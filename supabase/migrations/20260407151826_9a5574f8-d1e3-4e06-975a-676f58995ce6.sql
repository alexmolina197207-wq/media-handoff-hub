
-- 1. Drop the overly broad anonymous SELECT policy on share_links
DROP POLICY IF EXISTS "Anyone can view share links by slug" ON public.share_links;

-- 2. Create a SECURITY DEFINER function to resolve a share link by slug
-- This never exposes password_hash to the client
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
  _result json;
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

  SELECT id, title, file_type, size, preview_url, video_url, created_at
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
      'preview_url', _media.preview_url,
      'video_url', _media.video_url,
      'created_at', _media.created_at
    ) END
  );
END;
$$;

-- 3. Create a SECURITY DEFINER function to verify a share link password server-side
CREATE OR REPLACE FUNCTION public.verify_share_password(_slug text, _password text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _stored_password text;
BEGIN
  SELECT password_hash INTO _stored_password
  FROM share_links
  WHERE slug = _slug AND active = true
  LIMIT 1;

  IF _stored_password IS NULL THEN
    RETURN false;
  END IF;

  -- Plain text comparison for now (matches current app behavior)
  RETURN _stored_password = _password;
END;
$$;

-- 4. Fix anonymous storage upload policy - restrict to anonymous/ prefix only
DROP POLICY IF EXISTS "Anonymous users can upload to media bucket" ON storage.objects;

CREATE POLICY "Anonymous upload scoped to anonymous prefix"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = 'anonymous'
  );
