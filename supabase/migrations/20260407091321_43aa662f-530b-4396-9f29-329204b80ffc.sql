-- Make user_id nullable for anonymous uploads
ALTER TABLE public.media_files ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.share_links ALTER COLUMN user_id DROP NOT NULL;

-- Allow anonymous users to insert media files (user_id must be null)
CREATE POLICY "Anonymous users can insert media"
ON public.media_files FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Allow anonymous users to insert share links (user_id must be null)
CREATE POLICY "Anonymous users can insert share links"
ON public.share_links FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Allow anonymous users to upload files to storage
CREATE POLICY "Anonymous users can upload to media bucket"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'media');

-- Allow anonymous users to read from media bucket (for public URLs)
CREATE POLICY "Anyone can read media bucket"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'media');