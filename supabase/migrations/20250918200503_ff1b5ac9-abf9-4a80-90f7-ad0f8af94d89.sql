-- Fix critical security vulnerability: Restrict candidate data access to authenticated team members only

-- Drop the overly permissive policy that allows anyone to view all candidates
DROP POLICY IF EXISTS "Users can view all candidates" ON public.candidates;

-- Create a secure policy that only allows authenticated team members to view candidates
CREATE POLICY "Team members can view candidates" 
ON public.candidates 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.team_members tm 
    WHERE tm.user_id = auth.uid()
  )
);

-- Also restrict INSERT and UPDATE to authenticated team members for consistency
DROP POLICY IF EXISTS "Users can create candidates" ON public.candidates;
DROP POLICY IF EXISTS "Users can update candidates" ON public.candidates;

CREATE POLICY "Team members can create candidates" 
ON public.candidates 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.team_members tm 
    WHERE tm.user_id = auth.uid()
  )
);

CREATE POLICY "Team members can update candidates" 
ON public.candidates 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.team_members tm 
    WHERE tm.user_id = auth.uid()
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.team_members tm 
    WHERE tm.user_id = auth.uid()
  )
);