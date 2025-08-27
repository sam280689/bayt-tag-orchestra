-- Fix search path for the increment/decrement functions
CREATE OR REPLACE FUNCTION public.increment_tag_usage(tag_id UUID)
RETURNS void 
SET search_path = public
AS $$
BEGIN
  UPDATE public.tags 
  SET usage_count = usage_count + 1,
      last_used = now()
  WHERE id = tag_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_tag_usage(tag_id UUID)
RETURNS void 
SET search_path = public
AS $$
BEGIN
  UPDATE public.tags 
  SET usage_count = GREATEST(0, usage_count - 1),
      last_used = now()
  WHERE id = tag_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;