-- Add the current user as an admin team member if they don't exist
-- First, let's see current auth user
DO $$
DECLARE
    current_user_id uuid;
BEGIN
    -- Get current authenticated user ID (will be null if not authenticated)
    current_user_id := auth.uid();
    
    IF current_user_id IS NOT NULL THEN
        -- Insert team member record if it doesn't exist
        INSERT INTO public.team_members (user_id, role, permissions)
        VALUES (
            current_user_id,
            'admin',
            jsonb_build_object(
                'canCreateTags', true,
                'canEditTags', true,
                'canDeleteTags', true,
                'canManageTeam', true,
                'canViewAnalytics', true
            )
        )
        ON CONFLICT (user_id) DO UPDATE SET
            role = 'admin',
            permissions = jsonb_build_object(
                'canCreateTags', true,
                'canEditTags', true,
                'canDeleteTags', true,
                'canManageTeam', true,
                'canViewAnalytics', true
            );
    END IF;
END
$$;