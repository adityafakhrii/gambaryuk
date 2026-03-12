import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ipRequests = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequests.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

function extractResultImage(message: any): string | null {
  let resultImage = message?.images?.[0]?.image_url?.url
    || message?.images?.[0]?.url
    || (typeof message?.images?.[0] === "string" ? message.images[0] : null)
    || null;

  if (!resultImage && Array.isArray(message?.content)) {
    for (const part of message.content) {
      const fromImageUrl = typeof part?.image_url === "string"
        ? part.image_url
        : part?.image_url?.url;

      const candidate = fromImageUrl || part?.url || part?.source_url || null;
      if (typeof candidate === "string" && candidate.startsWith("data:image/")) {
        resultImage = candidate;
        break;
      }

      if (typeof part?.text === "string" && part.text.startsWith("data:image/")) {
        resultImage = part.text;
        break;
      }
    }
  }

  if (!resultImage && typeof message?.content === "string" && message.content.startsWith("data:image/")) {
    resultImage = message.content;
  }

  return resultImage;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { image } = body;

    if (typeof image !== "string" || !image.startsWith("data:image/")) {
      return new Response(JSON.stringify({ error: "Invalid input: image must be a base64 data URI" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (image.length > 14_000_000) {
      return new Response(JSON.stringify({ error: "Image too large (max 10 MB)" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = "You are editing a user-owned image. Remove only the overlaid text artifact \"NotebookLM\" and reconstruct the area naturally. Keep the exact same dimensions and overall scene. Return only the edited image with no text.";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const t = await response.text();
      console.error("AI gateway error:", status, t);

      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 400) {
        return new Response(JSON.stringify({ error: "Gambar tidak dapat diproses. Pastikan gambar valid dan cukup besar." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const message = data?.choices?.[0]?.message;
    const resultImage = extractResultImage(message);

    if (!resultImage) {
      if (message?.refusal) {
        return new Response(JSON.stringify({ error: "AI menolak permintaan edit gambar ini. Coba gunakan gambar lain atau watermark yang lebih jelas." }), {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "AI tidak mengembalikan gambar hasil. Coba lagi dengan gambar yang lebih jelas." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ image: resultImage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Remove Watermark error:", e);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
