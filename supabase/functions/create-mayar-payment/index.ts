import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const MAYAR_API_KEY = Deno.env.get('MAYAR_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, customerName, customerEmail, customerMobile, description } = await req.json()

    if (!MAYAR_API_KEY) {
      throw new Error('MAYAR_API_KEY is not configured in Supabase Secrets')
    }

    // Call Mayar Headless Commerce API to create a payment link/invoice
    const response = await fetch('https://api.mayar.id/hl/v1/payment/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MAYAR_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: customerName,
        email: customerEmail,
        mobile: customerMobile,
        amount: amount,
        description: description,
      }),
    })
    
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Mayar API Error: ${response.status} ${errText}`);
    }

    const data = await response.json()
    
    // We expect data to contain a checkout link. Example structure assumes { data: { link: '...' } } or similar
    // We'll normalize the response so the frontend always expects `{ link: string }`
    const checkoutLink = data?.link || data?.data?.link || data?.url || data?.data?.url;
    
    if (!checkoutLink) {
        throw new Error(`Could not parse checkout link from Mayar response: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ link: checkoutLink }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error creating Mayar payment:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
