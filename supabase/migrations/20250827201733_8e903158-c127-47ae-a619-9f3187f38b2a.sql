-- Create the increment_tag_usage function if it doesn't exist
CREATE OR REPLACE FUNCTION public.increment_tag_usage(tag_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.tags 
  SET usage_count = usage_count + 1,
      last_used = now()
  WHERE id = tag_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a decrement function as well for removing tags
CREATE OR REPLACE FUNCTION public.decrement_tag_usage(tag_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.tags 
  SET usage_count = GREATEST(0, usage_count - 1),
      last_used = now()
  WHERE id = tag_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;