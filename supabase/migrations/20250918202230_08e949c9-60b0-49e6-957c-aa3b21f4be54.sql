-- Manually add the current user as an admin team member
INSERT INTO public.team_members (user_id, role, permissions, tag_stats)
VALUES (
    'b1d5f92a-166f-49da-8692-b4ed5a323631'::uuid,
    'admin',
    jsonb_build_object(
        'canCreateTags', true,
        'canEditTags', true,
        'canDeleteTags', true,
        'canManageTeam', true,
        'canViewAnalytics', true
    ),
    jsonb_build_object(
        'created', 0,
        'used', 0,
        'shared', 0
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