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
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      if (user) {
        supabase.auth.setSession({ access_token: token, refresh_token: '' } as any)
      }
    }

    const url = new URL(req.url)
    const method = req.method

    if (method === 'GET') {
      // GET /api/tags?type=team|personal|global&query=xxx
      const type = url.searchParams.get('type')
      const query = url.searchParams.get('query')
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '20')
      const offset = (page - 1) * limit

      let queryBuilder = supabase
        .from('tags')
        .select('*')
        .order('usage_count', { ascending: false })
        .range(offset, offset + limit - 1)

      if (type) {
        queryBuilder = queryBuilder.eq('type', type)
      }

      if (query) {
        queryBuilder = queryBuilder.ilike('name', `%${query}%`)
      }

      const { data: tags, error } = await queryBuilder

      if (error) {
        console.error('Error fetching tags:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ tags, page, limit }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (method === 'POST') {
      // POST /api/tags - Create new tag
      const { name, type } = await req.json()

      if (!name || !type) {
        return new Response(JSON.stringify({ error: 'Name and type are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Check if tag already exists
      const { data: existingTag } = await supabase
        .from('tags')
        .select('*')
        .eq('name', name)
        .single()

      if (existingTag) {
        return new Response(JSON.stringify({ error: 'Tag already exists', existingTag }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const { data: tag, error } = await supabase
        .from('tags')
        .insert({
          name,
          type,
          created_by: user.id,
          usage_count: 0
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating tag:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ tag }), {
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