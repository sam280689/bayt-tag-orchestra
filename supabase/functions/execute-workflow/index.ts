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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role for admin operations
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

    const { candidate_id, trigger_type = 'candidate_added' } = await req.json()

    if (!candidate_id) {
      return new Response(JSON.stringify({ error: 'candidate_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Executing workflow for candidate:', candidate_id, 'trigger:', trigger_type)

    // Get the candidate data
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', candidate_id)
      .single()

    if (candidateError || !candidate) {
      console.error('Error fetching candidate:', candidateError)
      return new Response(JSON.stringify({ error: 'Candidate not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get enabled workflow rules for this trigger type
    const { data: rules, error: rulesError } = await supabase
      .from('workflow_rules')
      .select('*')
      .eq('trigger_type', trigger_type)
      .eq('enabled', true)

    if (rulesError) {
      console.error('Error fetching rules:', rulesError)
      return new Response(JSON.stringify({ error: 'Failed to fetch rules' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!rules || rules.length === 0) {
      console.log('No enabled rules found for trigger type:', trigger_type)
      return new Response(JSON.stringify({ 
        message: 'No rules to execute',
        rules_executed: 0,
        tags_applied: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let rulesExecuted = 0
    let tagsApplied = 0
    const executionResults = []

    // Execute each rule
    for (const rule of rules) {
      try {
        console.log('Evaluating rule:', rule.name, 'for candidate:', candidate.name)
        
        // Check if conditions are met
        const conditionsMet = evaluateConditions(rule.conditions, candidate)
        
        if (conditionsMet) {
          console.log('Conditions met for rule:', rule.name)
          
          // Execute actions
          const actionsResult = await executeActions(rule.actions, candidate_id, supabase)
          
          if (actionsResult.success) {
            rulesExecuted++
            tagsApplied += actionsResult.tagsApplied || 0
            
            // Update rule execution stats
            await supabase
              .from('workflow_rules')
              .update({
                execution_count: rule.execution_count + 1,
                last_executed: new Date().toISOString()
              })
              .eq('id', rule.id)
          }
          
          executionResults.push({
            rule_id: rule.id,
            rule_name: rule.name,
            success: actionsResult.success,
            tags_applied: actionsResult.tagsApplied || 0,
            error: actionsResult.error
          })
        } else {
          console.log('Conditions not met for rule:', rule.name)
          executionResults.push({
            rule_id: rule.id,
            rule_name: rule.name,
            success: false,
            tags_applied: 0,
            error: 'Conditions not met'
          })
        }
      } catch (error) {
        console.error('Error executing rule:', rule.name, error)
        executionResults.push({
          rule_id: rule.id,
          rule_name: rule.name,
          success: false,
          tags_applied: 0,
          error: error.message
        })
      }
    }

    console.log('Workflow execution completed. Rules executed:', rulesExecuted, 'Tags applied:', tagsApplied)

    return new Response(JSON.stringify({
      message: 'Workflow execution completed',
      candidate_id,
      rules_executed: rulesExecuted,
      tags_applied: tagsApplied,
      results: executionResults
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

function evaluateConditions(conditions: any[], candidate: any): boolean {
  if (!conditions || conditions.length === 0) {
    return false
  }

  // All conditions must be met (AND logic)
  return conditions.every(condition => {
    const { field, operator, value } = condition
    
    if (!field || !operator || !value) {
      return false
    }

    const candidateValue = candidate[field] || ''
    const candidateValueLower = candidateValue.toString().toLowerCase()
    const conditionValueLower = value.toString().toLowerCase()

    switch (operator) {
      case 'contains':
        return candidateValueLower.includes(conditionValueLower)
      case 'equals':
        return candidateValueLower === conditionValueLower
      case 'starts_with':
        return candidateValueLower.startsWith(conditionValueLower)
      case 'ends_with':
        return candidateValueLower.endsWith(conditionValueLower)
      case 'not_contains':
        return !candidateValueLower.includes(conditionValueLower)
      case 'not_equals':
        return candidateValueLower !== conditionValueLower
      default:
        console.warn('Unknown operator:', operator)
        return false
    }
  })
}

async function executeActions(actions: any[], candidateId: string, supabase: any): Promise<{success: boolean, tagsApplied?: number, error?: string}> {
  if (!actions || actions.length === 0) {
    return { success: false, error: 'No actions defined' }
  }

  let tagsApplied = 0

  try {
    for (const action of actions) {
      if (action.type === 'add_tag' && action.tag_id) {
        // Check if tag is already applied
        const { data: existingTag } = await supabase
          .from('candidate_tags')
          .select('id')
          .eq('candidate_id', candidateId)
          .eq('tag_id', action.tag_id)
          .single()

        if (!existingTag) {
          // Apply the tag - use a system user approach
          // For system-created tags, we'll use the first admin user or the rule creator
          const { data: adminUser } = await supabase
            .from('team_members')
            .select('user_id')
            .eq('role', 'admin')
            .limit(1)
            .single()

          const systemUserId = adminUser?.user_id || 'b1d5f92a-166f-49da-8692-b4ed5a323631' // fallback to known admin

          const { error: tagError } = await supabase
            .from('candidate_tags')
            .insert({
              candidate_id: candidateId,
              tag_id: action.tag_id,
              created_by: systemUserId // Use system user instead of null
            })

          if (!tagError) {
            tagsApplied++
            
            // Update tag usage count
            await supabase.rpc('increment_tag_usage', { tag_id: action.tag_id })
            
            console.log('Applied tag:', action.tag_id, 'to candidate:', candidateId)
          } else {
            console.error('Error applying tag:', tagError)
          }
        } else {
          console.log('Tag already applied:', action.tag_id, 'to candidate:', candidateId)
        }
      }
    }

    return { success: true, tagsApplied }
  } catch (error) {
    console.error('Error executing actions:', error)
    return { success: false, error: error.message }
  }
}