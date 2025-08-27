import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    supabase.auth.setSession({ access_token: token, refresh_token: '' } as any)

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { candidateIds, tagIds } = await req.json()

    if (!candidateIds || !tagIds || !Array.isArray(candidateIds) || !Array.isArray(tagIds)) {
      return new Response(JSON.stringify({ error: 'candidateIds and tagIds arrays are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Bulk tagging:', { candidateIds, tagIds, userId: user.id })

    // Create all candidate_tag combinations
    const candidateTagInserts = []
    for (const candidateId of candidateIds) {
      for (const tagId of tagIds) {
        candidateTagInserts.push({
          candidate_id: candidateId,
          tag_id: tagId,
          created_by: user.id
        })
      }
    }

    console.log('Inserting candidate tags:', candidateTagInserts.length, 'records')

    // Insert all candidate_tag relationships (ignore duplicates)
    const { data: insertedTags, error: insertError } = await supabase
      .from('candidate_tags')
      .upsert(candidateTagInserts, { 
        onConflict: 'candidate_id,tag_id',
        ignoreDuplicates: true 
      })
      .select()

    if (insertError) {
      console.error('Error bulk inserting candidate tags:', insertError)
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Successfully inserted:', insertedTags?.length || 0, 'candidate tag relationships')

    // Update usage counts for all affected tags
    for (const tagId of tagIds) {
      const { error: usageError } = await supabase
        .from('tags')
        .update({ 
          usage_count: supabase.raw('usage_count + ?', [candidateIds.length]),
          last_used: new Date().toISOString()
        })
        .eq('id', tagId)

      if (usageError) {
        console.error('Error updating tag usage count:', usageError)
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      applied: insertedTags?.length || 0,
      candidatesAffected: candidateIds.length,
      tagsApplied: tagIds.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})