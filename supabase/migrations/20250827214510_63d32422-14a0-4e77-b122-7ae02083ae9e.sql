-- Fix security issues by updating function search paths
DROP FUNCTION IF EXISTS get_tag_usage_by_period(integer);
DROP FUNCTION IF EXISTS get_conversion_analytics();

-- Create function to get tag statistics by time period with proper search path
CREATE OR REPLACE FUNCTION get_tag_usage_by_period(days_back integer DEFAULT 30)
RETURNS TABLE (
  period_start date,
  tags_created integer,
  tags_used integer,
  candidates_tagged integer
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    FROM tags
    WHERE created_at >= current_date - interval '1 day' * days_back
    GROUP BY date_trunc('day', created_at)::date
  ) tag_counts ON period_start::date = tag_counts.day
  LEFT JOIN (
    SELECT date_trunc('day', created_at)::date as day, COUNT(*) as used
    FROM candidate_tags
    WHERE created_at >= current_date - interval '1 day' * days_back
    GROUP BY date_trunc('day', created_at)::date
  ) usage_counts ON period_start::date = usage_counts.day
  LEFT JOIN (
    SELECT date_trunc('day', ct.created_at)::date as day, COUNT(DISTINCT ct.candidate_id) as tagged
    FROM candidate_tags ct
    WHERE ct.created_at >= current_date - interval '1 day' * days_back
    GROUP BY date_trunc('day', ct.created_at)::date
  ) candidate_counts ON period_start::date = candidate_counts.day
  ORDER BY period_start;
END;
$$;

-- Create function to get conversion analytics with proper search path
CREATE OR REPLACE FUNCTION get_conversion_analytics()
RETURNS TABLE (
  metric_name text,
  tagged_count integer,
  untagged_count integer,
  tagged_rate numeric,
  untagged_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  FROM candidates c
  LEFT JOIN candidate_tags ct ON c.id = ct.candidate_id;
END;
$$;