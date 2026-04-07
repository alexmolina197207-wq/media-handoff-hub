
-- Create a SECURITY DEFINER helper to check anonymous media ownership without RLS
CREATE OR REPLACE FUNCTION public.is_anonymous_media(_media_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.media_files
    WHERE id = _media_id AND user_id IS NULL
  )
$$;

-- Replace the broken policy with one using the helper function
DROP POLICY IF EXISTS "Anonymous users can insert share links for own media" ON public.share_links;

CREATE POLICY "Anonymous users can insert share links for own media"
  ON public.share_links
  FOR INSERT
  TO anon
  WITH CHECK (
    user_id IS NULL
    AND public.is_anonymous_media(media_id)
  );
