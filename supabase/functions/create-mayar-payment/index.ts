import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const DEFAULT_MAYAR_V2_BASE_URL = 'https://api.mayar.id/hl/v2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CreatePaymentPayload {
  amount?: number | string
  customerName?: string
  customerEmail?: string
  customerMobile?: string
  description?: string
  notes?: string
  expiredAt?: string
}

interface MayarV2Response {
  statusCode?: number
  messages?: string
  message?: string
  data?: {
    id?: string
    transactionId?: string
    link?: string
    redirectUrl?: string | null
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      },
    )
  }

  try {
    const apiKey = Deno.env.get('MAYAR_API_KEY')?.trim()
    if (!apiKey) {
      throw new Error('MAYAR_API_KEY is not configured in Supabase Secrets')
    }

    const baseUrl = (Deno.env.get('MAYAR_BASE_URL')?.trim() || DEFAULT_MAYAR_V2_BASE_URL).replace(/\/+$/, '')

    const body: CreatePaymentPayload = await req.json()
    const amount = Math.round(Number(body.amount))

    if (!Number.isFinite(amount) || amount < 10000) {
      return new Response(
        JSON.stringify({ error: 'Minimum payment amount is Rp 10.000', code: 400 }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    const customerName = body.customerName?.trim() || 'Orang Baik'
    const customerEmail = body.customerEmail?.trim()
    const customerMobile = body.customerMobile?.replace(/\D/g, '').trim()
    const description = body.description?.trim() || `Donasi GambarYuk dari ${customerName}`
    const notes = body.notes?.trim()
    // Default payment link expiration: 24 hours from now (ISO 8601 UTC)
    const expiredAt = body.expiredAt?.trim() || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    // Build Mayar Headless API V2 payload for POST /hl/v2/payments/create
    const mayarPayload: Record<string, unknown> = {
      name: customerName,
      amount,
      description,
      expiredAt,
    }

    if (customerEmail) mayarPayload.email = customerEmail
    if (customerMobile) mayarPayload.mobile = customerMobile
    if (notes) mayarPayload.notes = notes

    const response = await fetch(`${baseUrl}/payments/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mayarPayload),
    })

    const rawText = await response.text()
    let data: MayarV2Response | null = null
    try {
      data = rawText ? JSON.parse(rawText) : null
    } catch {
      // Non-JSON response from upstream
    }

    // Per Mayar V2 docs, treat body statusCode as authoritative alongside HTTP status
    const effectiveStatus = typeof data?.statusCode === 'number' ? data.statusCode : response.status
    const isSuccess = response.ok && effectiveStatus >= 200 && effectiveStatus < 300

    if (!isSuccess) {
      const upstreamMessage = data?.messages || data?.message || rawText || response.statusText
      console.error('Mayar API V2 Error:', effectiveStatus, upstreamMessage)
      const clientStatus = effectiveStatus >= 400 && effectiveStatus < 500 ? effectiveStatus : 502
      return new Response(
        JSON.stringify({
          error: `Mayar API V2 Error (${effectiveStatus}): ${upstreamMessage}`,
          code: effectiveStatus,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: clientStatus,
        },
      )
    }

    const checkoutLink = data?.data?.link
    if (!checkoutLink) {
      throw new Error(`Could not parse checkout link from Mayar V2 response: ${rawText}`)
    }

    return new Response(
      JSON.stringify({
        link: checkoutLink,
        id: data?.data?.id ?? null,
        transactionId: data?.data?.transactionId ?? null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Error creating Mayar V2 payment:', message)
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
