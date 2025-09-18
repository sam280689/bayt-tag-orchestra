-- Fix critical security vulnerabilities in team management and database functions

-- 1. Fix team_members table RLS policies - restrict access to authenticated team members only
DROP POLICY IF EXISTS "Team members can view all team members" ON public.team_members;

-- Create secure policy that only allows authenticated users to view team members they should have access to
CREATE POLICY "Authenticated users can view team members" 
ON public.team_members 
FOR SELECT 
TO authenticated
USING (
  -- Users can view team members if they are themselves a team member
  EXISTS (
    SELECT 1 
    FROM public.team_members tm 
    WHERE tm.user_id = auth.uid()
  )
);

-- 2. Enhance database function security by adding explicit search_path settings

-- Update increment_tag_usage function
CREATE OR REPLACE FUNCTION public.increment_tag_usage(tag_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.tags 
  SET usage_count = usage_count + 1,
      last_used = now()
  WHERE id = tag_id;
END;
$function$;

-- Update decrement_tag_usage function  
CREATE OR REPLACE FUNCTION public.decrement_tag_usage(tag_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.tags 
  SET usage_count = GREATEST(0, usage_count - 1),
      last_used = now()
  WHERE id = tag_id;
END;
$function$;

-- Update is_team_admin function
CREATE OR REPLACE FUNCTION public.is_team_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE user_id = user_uuid AND role = 'admin'
  );
END;
$function$;

-- Update get_tag_usage_by_period function
CREATE OR REPLACE FUNCTION public.get_tag_usage_by_period(days_back integer DEFAULT 30)
RETURNS TABLE(period_start date, tags_created integer, tags_used integer, candidates_tagged integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    date_trunc('day', generate_series(
      current_date - interval '1 day' * days_back,
      current_date,
      interval '1 day'
    ))::date as period_start,
    COALESCE(tag_counts.created, 0) as tags_created,
    COALESCE(usage_counts.used, 0) as tags_used,
    COALESCE(candidate_counts.tagged, 0) as candidates_tagged
  FROM generate_series(
    current_date - interval '1 day' * days_back,
    current_date,
    interval '1 day'
  ) as period_start
  LEFT JOIN (
    SELECT date_trunc('day', created_at)::date as day, COUNT(*) as created
    FROM public.tags
    WHERE created_at >= current_date - interval '1 day' * days_back
    GROUP BY date_trunc('day', created_at)::date
  ) tag_counts ON period_start::date = tag_counts.day
  LEFT JOIN (
    SELECT date_trunc('day', created_at)::date as day, COUNT(*) as used
    FROM public.candidate_tags
    WHERE created_at >= current_date - interval '1 day' * days_back
    GROUP BY date_trunc('day', created_at)::date
  ) usage_counts ON period_start::date = usage_counts.day
  LEFT JOIN (
    SELECT date_trunc('day', ct.created_at)::date as day, COUNT(DISTINCT ct.candidate_id) as tagged
    FROM public.candidate_tags ct
    WHERE ct.created_at >= current_date - interval '1 day' * days_back
    GROUP BY date_trunc('day', ct.created_at)::date
  ) candidate_counts ON period_start::date = candidate_counts.day
  ORDER BY period_start;
END;
$function$;

-- Update get_conversion_analytics function
CREATE OR REPLACE FUNCTION public.get_conversion_analytics()
RETURNS TABLE(metric_name text, tagged_count integer, untagged_count integer, tagged_rate numeric, untagged_rate numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    'candidates'::text as metric_name,
    COUNT(CASE WHEN ct.candidate_id IS NOT NULL THEN 1 END)::integer as tagged_count,
    COUNT(CASE WHEN ct.candidate_id IS NULL THEN 1 END)::integer as untagged_count,
    ROUND(
      COUNT(CASE WHEN ct.candidate_id IS NOT NULL THEN 1 END)::numeric / 
      NULLIF(COUNT(*)::numeric, 0) * 100, 
      2
    ) as tagged_rate,
    ROUND(
      COUNT(CASE WHEN ct.candidate_id IS NULL THEN 1 END)::numeric / 
      NULLIF(COUNT(*)::numeric, 0) * 100, 
      2
    ) as untagged_rate
  FROM public.candidates c
  LEFT JOIN public.candidate_tags ct ON c.id = ct.candidate_id;
END;
$function$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email
  );
  
  -- Insert team member record with default viewer role
  INSERT INTO public.team_members (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$function$;