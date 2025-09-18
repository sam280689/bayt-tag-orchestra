-- Fix infinite recursion in team_members RLS policy
-- Create a security definer function to check team membership
CREATE OR REPLACE FUNCTION public.is_team_member(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE user_id = user_uuid
  );
END;
$$;

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Authenticated users can view team members" ON public.team_members;

-- Create a new policy using the security definer function
CREATE POLICY "Team members can view team members" 
ON public.team_members 
FOR SELECT 
USING (public.is_team_member(auth.uid()));

-- Also ensure candidates table uses the same function for consistency
DROP POLICY IF EXISTS "Team members can view candidates" ON public.candidates;
DROP POLICY IF EXISTS "Team members can create candidates" ON public.candidates; 
DROP POLICY IF EXISTS "Team members can update candidates" ON public.candidates;

CREATE POLICY "Team members can view candidates" 
ON public.candidates 
FOR SELECT 
USING (public.is_team_member(auth.uid()));

CREATE POLICY "Team members can create candidates" 
ON public.candidates 
FOR INSERT 
WITH CHECK (public.is_team_member(auth.uid()));

CREATE POLICY "Team members can update candidates" 
ON public.candidates 
FOR UPDATE 
USING (public.is_team_member(auth.uid()))
WITH CHECK (public.is_team_member(auth.uid()));