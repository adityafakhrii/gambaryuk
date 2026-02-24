import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Find expired images
    const { data: expired, error: fetchError } = await supabase
      .from('shared_image_files')
      .select('id, bucket_path')
      .not('expires_at', 'is', null)
      .lt('expires_at', new Date().toISOString())

    if (fetchError) throw fetchError

    if (!expired || expired.length === 0) {
      return new Response(JSON.stringify({ deleted: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Delete from storage
    const paths = expired.map((f) => f.bucket_path)
    const { error: storageError } = await supabase.storage
      .from('shared-images')
      .remove(paths)

    if (storageError) console.error('Storage delete error:', storageError)

    // Delete from tracking table
    const ids = expired.map((f) => f.id)
    const { error: dbError } = await supabase
      .from('shared_image_files')
      .delete()
      .in('id', ids)

    if (dbError) console.error('DB delete error:', dbError)

    return new Response(JSON.stringify({ deleted: expired.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
