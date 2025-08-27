-- Add RLS policies for workflow_executions table to allow inserts and updates
CREATE POLICY "Users can create workflow executions for team rules" 
ON public.workflow_executions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workflow_rules wr 
    WHERE wr.id = workflow_executions.rule_id
    AND EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update workflow executions" 
ON public.workflow_executions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm 
    WHERE tm.user_id = auth.uid()
  )
);