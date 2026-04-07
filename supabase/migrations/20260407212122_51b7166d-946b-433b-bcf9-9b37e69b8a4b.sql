
-- Rate-limit anonymous media_files inserts: max 10 per hour per anonymous session
-- Since anonymous users share a single null user_id, we use a global cap on recent anonymous inserts.
CREATE OR REPLACE FUNCTION public.enforce_anonymous_upload_limit()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  recent_count integer;
BEGIN
  IF NEW.user_id IS NULL THEN
    SELECT count(*) INTO recent_count
    FROM public.media_files
    WHERE user_id IS NULL
      AND created_at > now() - interval '1 hour';

    IF recent_count >= 50 THEN
      RAISE EXCEPTION 'Anonymous upload limit exceeded. Please try again later.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_anonymous_upload_limit
  BEFORE INSERT ON public.media_files
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_anonymous_upload_limit();

-- Set file size limit on media bucket (50 MB)
UPDATE storage.buckets
SET file_size_limit = 52428800
WHERE id = 'media';
