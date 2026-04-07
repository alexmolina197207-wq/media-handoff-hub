-- Fix 1: Authenticated users must own the media they're sharing
DROP POLICY IF EXISTS "Users can create their own share links" ON public.share_links;
CREATE POLICY "Users can create their own share links"
  ON public.share_links FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.media_files mf
      WHERE mf.id = media_id AND mf.user_id = auth.uid()
    )
  );

-- Fix 2: Tighten "Anyone can view shared media" to respect expiry
-- Password-protected media is excluded from direct RLS access;
-- access is only via edge function signed URLs after server-side password check
DROP POLICY IF EXISTS "Anyone can view shared media" ON public.media_files;
CREATE POLICY "Anyone can view shared media"
  ON public.media_files FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.share_links sl
      WHERE sl.media_id = media_files.id
        AND sl.active = true
        AND (sl.expires_at IS NULL OR sl.expires_at > now())
        AND sl.password_hash IS NULL
    )
  );