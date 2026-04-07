
-- 1. Make media bucket private
UPDATE storage.buckets SET public = false WHERE id = 'media';

-- 2. Add storage path columns to media_files for signed URL generation
ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS preview_path text;
ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS video_path text;

-- 3. Backfill paths from existing public URLs
-- URL pattern: https://<ref>.supabase.co/storage/v1/object/public/media/<path>
UPDATE public.media_files
SET preview_path = regexp_replace(preview_url, '^.*/storage/v1/object/public/media/', '')
WHERE preview_url IS NOT NULL AND preview_url LIKE '%/storage/v1/object/public/media/%';

UPDATE public.media_files
SET video_path = regexp_replace(video_url, '^.*/storage/v1/object/public/media/', '')
WHERE video_url IS NOT NULL AND video_url LIKE '%/storage/v1/object/public/media/%';

-- 4. Drop overly broad storage SELECT policies
DROP POLICY IF EXISTS "Anyone can read media bucket" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view media files" ON storage.objects;

-- 5. Add scoped SELECT policy for authenticated users on their own files
CREATE POLICY "Authenticated users can read own media files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 6. Update resolve_share_link to NOT return file URLs (only safe metadata)
CREATE OR REPLACE FUNCTION public.resolve_share_link(_slug text)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _link record;
  _media record;
BEGIN
  SELECT id, slug, access, active, expires_at, media_id,
         (password_hash IS NOT NULL) AS is_password_protected
  INTO _link
  FROM share_links
  WHERE slug = _slug
  LIMIT 1;

  IF _link IS NULL THEN
    RETURN json_build_object('found', false);
  END IF;

  IF NOT _link.active THEN
    RETURN json_build_object('found', true, 'active', false);
  END IF;

  IF _link.expires_at IS NOT NULL AND _link.expires_at < now() THEN
    RETURN json_build_object('found', true, 'active', false);
  END IF;

  SELECT id, title, file_type, size, created_at
  INTO _media
  FROM media_files
  WHERE id = _link.media_id
  LIMIT 1;

  RETURN json_build_object(
    'found', true,
    'active', true,
    'access', _link.access,
    'is_password_protected', _link.is_password_protected,
    'media', CASE WHEN _media IS NULL THEN NULL ELSE json_build_object(
      'id', _media.id,
      'title', _media.title,
      'file_type', _media.file_type,
      'size', _media.size,
      'created_at', _media.created_at
    ) END
  );
END;
$$;
