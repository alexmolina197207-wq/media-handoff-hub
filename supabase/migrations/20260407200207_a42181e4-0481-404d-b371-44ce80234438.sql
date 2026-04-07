-- Fix Finding 1: Restrict anonymous INSERT on share_links to only reference anonymous-owned media
DROP POLICY IF EXISTS "Anonymous users can insert share links" ON public.share_links;

CREATE POLICY "Anonymous users can insert share links for own media"
  ON public.share_links
  FOR INSERT
  TO anon
  WITH CHECK (
    user_id IS NULL
    AND EXISTS (
      SELECT 1 FROM public.media_files mf
      WHERE mf.id = media_id
      AND mf.user_id IS NULL
    )
  );
