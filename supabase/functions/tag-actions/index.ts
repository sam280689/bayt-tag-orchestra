import { createClient } from '@supabase/supabase-js'

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
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      if (user) {
        supabase.auth.setSession({ access_token: token, refresh_token: '' } as any)
      }
    }

    const url = new URL(req.url)
    const method = req.method
    const pathname = url.pathname

    // PUT /api/tags/:id - Update tag
    if (method === 'PUT' && pathname.includes('/tag/')) {
      const tagId = pathname.split('/').pop()
      const { name, type } = await req.json()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const { data: tag, error } = await supabase
        .from('tags')
        .update({ name, type, updated_at: new Date().toISOString() })
        .eq('id', tagId)
        .eq('created_by', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating tag:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ tag }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // DELETE /api/tags/:id - Delete tag
    if (method === 'DELETE' && pathname.includes('/tag/')) {
      const tagId = pathname.split('/').pop()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Delete candidate_tags first (cascade should handle this, but being explicit)
      await supabase
        .from('candidate_tags')
        .delete()
        .eq('tag_id', tagId)

      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId)
        .eq('created_by', user.id)

      if (error) {
        console.error('Error deleting tag:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // POST /api/tags/merge - Merge tags
    if (method === 'POST' && pathname.includes('/merge')) {
      const { sourceTagId, targetTagId } = await req.json()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get both tags to verify ownership and get usage counts
      const { data: sourceTags } = await supabase
        .from('tags')
        .select('*')
        .in('id', [sourceTagId, targetTagId])

      if (!sourceTags || sourceTags.length !== 2) {
        return new Response(JSON.stringify({ error: 'Tags not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const sourceTag = sourceTags.find(t => t.id === sourceTagId)
      const targetTag = sourceTags.find(t => t.id === targetTagId)

      // Update all candidate_tags from source to target
      const { error: updateError } = await supabase
        .from('candidate_tags')
        .update({ tag_id: targetTagId })
        .eq('tag_id', sourceTagId)

      if (updateError) {
        console.error('Error updating candidate_tags:', updateError)
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Update target tag usage count
      const { error: usageError } = await supabase
        .from('tags')
        .update({ 
          usage_count: (targetTag?.usage_count || 0) + (sourceTag?.usage_count || 0),
          updated_at: new Date().toISOString()
        })
        .eq('id', targetTagId)

      if (usageError) {
        console.error('Error updating usage count:', usageError)
      }

      // Delete source tag
      const { error: deleteError } = await supabase
        .from('tags')
        .delete()
        .eq('id', sourceTagId)

      if (deleteError) {
        console.error('Error deleting source tag:', deleteError)
        return new Response(JSON.stringify({ error: deleteError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
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