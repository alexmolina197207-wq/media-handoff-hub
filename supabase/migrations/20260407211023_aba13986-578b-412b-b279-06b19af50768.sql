
-- Validation trigger: anonymous media paths must start with 'anonymous/'
CREATE OR REPLACE FUNCTION public.validate_anonymous_media_paths()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    IF NEW.preview_path IS NOT NULL AND NEW.preview_path NOT LIKE 'anonymous/%' THEN
      RAISE EXCEPTION 'Anonymous media preview_path must start with anonymous/';
    END IF;
    IF NEW.video_path IS NOT NULL AND NEW.video_path NOT LIKE 'anonymous/%' THEN
      RAISE EXCEPTION 'Anonymous media video_path must start with anonymous/';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_anonymous_media_paths
  BEFORE INSERT OR UPDATE ON public.media_files
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_anonymous_media_paths();
