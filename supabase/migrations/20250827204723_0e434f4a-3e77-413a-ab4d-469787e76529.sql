-- Fix infinite recursion in team_members RLS policy
-- Drop the problematic policy first
DROP POLICY IF EXISTS "Admins can manage team members" ON public.team_members;

-- Create a simpler policy that allows users to manage their own record
-- and view all team members without infinite recursion
CREATE POLICY "Users can manage their own team member record" 
ON public.team_members 
FOR ALL 
USING (auth.uid() = user_id);

-- Create a policy for viewing all team members (this was already working)
-- But let's ensure it exists
DROP POLICY IF EXISTS "Team members can view all team members" ON public.team_members;
CREATE POLICY "Team members can view all team members" 
ON public.team_members 
FOR SELECT 
USING (true);

-- Create a policy that allows admins to manage other members
-- We'll use a function approach to avoid recursion
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

-- Ensure team_settings policies are working correctly
-- Create policy for viewing team settings
CREATE POLICY "Team members can view team settings" 
ON public.team_settings 
FOR SELECT 
USING (true);

-- Create policy for updating team settings (admins only)
CREATE POLICY "Admins can update team settings" 
ON public.team_settings 
FOR UPDATE 
USING (public.is_team_admin(auth.uid()));

-- Create policy for inserting team settings (admins only)
CREATE POLICY "Admins can insert team settings" 
ON public.team_settings 
FOR INSERT 
WITH CHECK (public.is_team_admin(auth.uid()));

-- Ensure there's a default team settings record
INSERT INTO public.team_settings (
  require_approval, 
  allow_public_tags, 
  auto_suggest_similar, 
  enforce_naming_convention, 
  max_tags_per_user
) VALUES (
  true, 
  false, 
  true, 
  false, 
  50
) ON CONFLICT DO NOTHING;