-- Allow anon users to SELECT media they inserted (user_id IS NULL)
CREATE POLICY "Anonymous users can view their own media"
ON public.media_files FOR SELECT
TO anon
USING (user_id IS NULL);

-- Allow anon users to SELECT share links they inserted (user_id IS NULL)
CREATE POLICY "Anonymous users can view their own share links"
ON public.share_links FOR SELECT
TO anon
USING (user_id IS NULL);