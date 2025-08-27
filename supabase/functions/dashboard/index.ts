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

    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const url = new URL(req.url)
    const pathname = url.pathname

    if (pathname.includes('/usage')) {
      // GET /api/dashboard/usage - Dashboard metrics
      
      // 1. Top 10 tags by usage
      const { data: topTags, error: topTagsError } = await supabase
        .from('tags')
        .select('id, name, type, usage_count, last_used')
        .order('usage_count', { ascending: false })
        .limit(10)

      if (topTagsError) {
        console.error('Error fetching top tags:', topTagsError)
      }

      // 2. Recent tag activity (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { data: recentActivity, error: recentError } = await supabase
        .from('candidate_tags')
        .select(`
          created_at,
          tags (name, type)
        `)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(50)

      if (recentError) {
        console.error('Error fetching recent activity:', recentError)
      }

      // 3. Duplicate detection (simple name similarity)
      const { data: allTags, error: allTagsError } = await supabase
        .from('tags')
        .select('id, name, type, usage_count')
        .order('name')

      let duplicateFlags: Array<{
        id: string,
        name: string,
        similarTo: string[],
        confidence: number
      }> = []

      if (allTags && !allTagsError) {
        const duplicateMap = new Map<string, Array<typeof allTags[0]>>()
        
        // Simple duplicate detection based on similar names
        for (const tag of allTags) {
          const normalizedName = tag.name.toLowerCase().trim()
          
          // Check for exact matches (case insensitive)
          const exactMatches = allTags.filter(t => 
            t.id !== tag.id && 
            t.name.toLowerCase().trim() === normalizedName
          )
          
          // Check for similar names (contains or very similar)
          const similarMatches = allTags.filter(t => {
            if (t.id === tag.id) return false
            const otherName = t.name.toLowerCase().trim()
            
            // Check if one contains the other
            return (
              normalizedName.includes(otherName) || 
              otherName.includes(normalizedName) ||
              // Check for plurals
              (normalizedName + 's' === otherName) ||
              (otherName + 's' === normalizedName)
            )
          })
          
          const allMatches = [...exactMatches, ...similarMatches]
          if (allMatches.length > 0) {
            duplicateFlags.push({
              id: tag.id,
              name: tag.name,
              similarTo: allMatches.map(m => m.name),
              confidence: exactMatches.length > 0 ? 0.9 : 0.6
            })
          }
        }
        
        // Remove duplicates and keep only the most confident ones
        duplicateFlags = duplicateFlags
          .filter((flag, index, arr) => 
            arr.findIndex(f => f.name === flag.name) === index
          )
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 10)
      }

      // 4. Basic stats
      const { count: totalTags } = await supabase
        .from('tags')
        .select('*', { count: 'exact', head: true })

      const { count: totalCandidates } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })

      const { count: totalTagApplications } = await supabase
        .from('candidate_tags')
        .select('*', { count: 'exact', head: true })

      // 5. Tags created per week (last 4 weeks)
      const tagsPerWeek = []
      for (let i = 0; i < 4; i++) {
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - (i * 7) - 7)
        const weekEnd = new Date()
        weekEnd.setDate(weekEnd.getDate() - (i * 7))
        
        const { count } = await supabase
          .from('tags')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', weekStart.toISOString())
          .lt('created_at', weekEnd.toISOString())
        
        tagsPerWeek.unshift({
          week: `Week ${4 - i}`,
          count: count || 0,
          startDate: weekStart.toISOString().split('T')[0]
        })
      }

      const dashboardData = {
        topTags: topTags || [],
        recentActivity: (recentActivity || []).map(activity => ({
          ...activity,
          tagName: activity.tags?.name,
          tagType: activity.tags?.type
        })),
        duplicateFlags,
        stats: {
          totalTags: totalTags || 0,
          totalCandidates: totalCandidates || 0,
          totalTagApplications: totalTagApplications || 0,
        },
        tagsPerWeek
      }

      return new Response(JSON.stringify(dashboardData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
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
