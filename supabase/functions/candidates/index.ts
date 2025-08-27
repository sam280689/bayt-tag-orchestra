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

    if (method === 'GET') {
      // GET /api/candidates?tags[]=...&page=...
      const tagFilters = url.searchParams.getAll('tags[]')
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '20')
      const search = url.searchParams.get('search')
      const offset = (page - 1) * limit

      let query = supabase
        .from('candidates')
        .select(`
          *,
          candidate_tags (
            id,
            tag_id,
            created_at,
            tags (
              id,
              name,
              type
            )
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,profile_text.ilike.%${search}%`)
      }

      const { data: candidates, error } = await query

      if (error) {
        console.error('Error fetching candidates:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Filter by tags if specified
      let filteredCandidates = candidates || []
      if (tagFilters.length > 0) {
        filteredCandidates = candidates?.filter(candidate => {
          const candidateTagNames = candidate.candidate_tags?.map((ct: any) => ct.tags?.name) || []
          return tagFilters.some(tagName => candidateTagNames.includes(tagName))
        }) || []
      }

      // Transform the data to match expected format
      const transformedCandidates = filteredCandidates.map(candidate => ({
        ...candidate,
        tags: candidate.candidate_tags?.map((ct: any) => ({
          id: ct.tags?.id,
          name: ct.tags?.name,
          type: ct.tags?.type
        })) || []
      }))

      return new Response(JSON.stringify({ 
        candidates: transformedCandidates, 
        page, 
        limit,
        total: filteredCandidates.length 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // POST /api/candidates/:id/tags - Apply tag to candidate
    if (method === 'POST' && pathname.includes('/tags')) {
      const candidateId = pathname.split('/').slice(-2)[0] // Get candidate ID from path
      const { tagId } = await req.json()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Insert candidate_tag relationship
      const { data: candidateTag, error } = await supabase
        .from('candidate_tags')
        .insert({
          candidate_id: candidateId,
          tag_id: tagId,
          created_by: user.id
        })
        .select()
        .single()

      if (error) {
        // Handle duplicate key error gracefully
        if (error.code === '23505') {
          return new Response(JSON.stringify({ error: 'Tag already applied to candidate' }), {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        console.error('Error applying tag to candidate:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Update tag usage count
      await supabase.rpc('increment_tag_usage', { tag_id: tagId })

      return new Response(JSON.stringify({ candidateTag }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // DELETE /api/candidates/:id/tags/:tagId - Remove tag from candidate
    if (method === 'DELETE' && pathname.includes('/tags/')) {
      const pathParts = pathname.split('/')
      const candidateId = pathParts[pathParts.length - 3]
      const tagId = pathParts[pathParts.length - 1]

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const { error } = await supabase
        .from('candidate_tags')
        .delete()
        .eq('candidate_id', candidateId)
        .eq('tag_id', tagId)
        .eq('created_by', user.id)

      if (error) {
        console.error('Error removing tag from candidate:', error)
        return new Response(JSON.stringify({ error: error.message }), {
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