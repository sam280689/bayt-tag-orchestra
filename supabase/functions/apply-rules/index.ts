import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple keyword-based rules for tag suggestions
const TAG_RULES = {
  // Programming languages
  'javascript': ['JavaScript', 'Frontend', 'React', 'Node.js'],
  'js': ['JavaScript', 'Frontend', 'React', 'Node.js'],
  'react': ['React', 'JavaScript', 'Frontend'],
  'python': ['Python', 'Backend', 'Data Science'],
  'java': ['Java', 'Backend', 'Enterprise'],
  'typescript': ['TypeScript', 'JavaScript', 'Frontend'],
  'node': ['Node.js', 'JavaScript', 'Backend'],
  
  // Roles and levels
  'senior': ['Senior Level', 'Leadership'],
  'junior': ['Junior Level', 'Entry Level'],
  'lead': ['Lead', 'Leadership', 'Senior Level'],
  'manager': ['Management', 'Leadership'],
  'architect': ['Architecture', 'Senior Level'],
  
  // Domains
  'frontend': ['Frontend', 'UI/UX'],
  'backend': ['Backend', 'API'],
  'fullstack': ['Full Stack', 'Frontend', 'Backend'],
  'full-stack': ['Full Stack', 'Frontend', 'Backend'],
  'devops': ['DevOps', 'Infrastructure'],
  'ui': ['UI/UX', 'Frontend'],
  'ux': ['UI/UX', 'Design'],
  'design': ['Design', 'UI/UX'],
  'data': ['Data Science', 'Analytics'],
  'ml': ['Machine Learning', 'Data Science'],
  'ai': ['AI', 'Machine Learning'],
}

const SYNONYMS = {
  'js': 'javascript',
  'ts': 'typescript',
  'fe': 'frontend',
  'be': 'backend',
  'fs': 'fullstack',
  'sr': 'senior',
  'jr': 'junior',
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

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { text, entityType } = await req.json()

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const textLower = text.toLowerCase()
    const suggestions = new Set<string>()

    // 1. Exact keyword matches
    for (const [keyword, tags] of Object.entries(TAG_RULES)) {
      if (textLower.includes(keyword)) {
        tags.forEach(tag => suggestions.add(tag))
      }
    }

    // 2. Synonym matches
    for (const [synonym, canonical] of Object.entries(SYNONYMS)) {
      if (textLower.includes(synonym)) {
        const tags = TAG_RULES[canonical] || []
        tags.forEach(tag => suggestions.add(tag))
      }
    }

    // 3. Get existing tags from database for frequency boost
    const { data: existingTags } = await supabase
      .from('tags')
      .select('name, usage_count, last_used')
      .order('usage_count', { ascending: false })
      .limit(50)

    // 4. Boost suggestions that match existing popular tags
    const boostedSuggestions: Array<{name: string, score: number, type: string}> = []
    
    for (const suggestion of suggestions) {
      const existingTag = existingTags?.find(t => 
        t.name.toLowerCase() === suggestion.toLowerCase()
      )
      
      let score = 1
      let type = 'suggested'
      
      if (existingTag) {
        score = existingTag.usage_count + 10 // Boost existing tags
        type = 'existing'
        
        // Additional boost for recently used tags
        if (existingTag.last_used) {
          const daysSinceUsed = (Date.now() - new Date(existingTag.last_used).getTime()) / (1000 * 60 * 60 * 24)
          if (daysSinceUsed < 7) {
            score += 5 // Recent usage boost
          }
        }
      }
      
      boostedSuggestions.push({
        name: suggestion,
        score,
        type
      })
    }

    // 5. Sort by score and limit to 7
    const topSuggestions = boostedSuggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 7)
      .map(s => ({
        value: s.name,
        label: s.name,
        type: s.type,
        count: s.type === 'existing' ? 
          existingTags?.find(t => t.name.toLowerCase() === s.name.toLowerCase())?.usage_count : 
          undefined
      }))

    return new Response(JSON.stringify({ suggestions: topSuggestions }), {
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