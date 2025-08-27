-- Fix infinite recursion in team_members RLS policy
-- Drop the problematic policy first
DROP POLICY IF EXISTS "Admins can manage team members" ON public.team_members;

-- Create a simpler policy that allows users to manage their own record
-- and view all team members without infinite recursion
CREATE POLICY "Users can manage their own team member record" 
ON public.team_members 
FOR ALL 
USING (auth.uid() = user_id);

-- Create a policy for viewing all team members (this should already exist but let's make sure)
DROP POLICY IF EXISTS "Team members can view all team members" ON public.team_members;
CREATE POLICY "Team members can view all team members" 
ON public.team_members 
FOR SELECT 
USING (true);

-- Create a function to check if user is admin without causing recursion
CREATE OR REPLACE FUNCTION public.is_team_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user has admin role in any team member record
  -- This function approach avoids RLS recursion
  RETURN EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE user_id = user_uuid AND role = 'admin'
  );
END;
$$;

-- Now create admin management policy using the function
CREATE POLICY "Admins can manage all team members" 
ON public.team_members 
FOR ALL 
USING (public.is_team_admin(auth.uid()));

-- Ensure there's a default team settings record if none exists
INSERT INTO public.team_settings (
  require_approval, 
  allow_public_tags, 
  auto_suggest_similar, 
  enforce_naming_convention, 
  max_tags_per_user
) 
SELECT true, false, true, false, 50 
WHERE NOT EXISTS (SELECT 1 FROM public.team_settings);