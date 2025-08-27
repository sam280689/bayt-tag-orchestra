-- Fix RLS policy for workflow_executions to allow proper insertions
DROP POLICY IF EXISTS "Users can create workflow executions for team rules" ON public.workflow_executions;

CREATE POLICY "Users can create workflow executions for team rules" 
ON public.workflow_executions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workflow_rules wr 
    WHERE wr.id = workflow_executions.rule_id
    AND (
      wr.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.team_members tm 
        WHERE tm.user_id = auth.uid()
      )
    )
  )
);