
DROP POLICY IF EXISTS "Anonymous upload scoped to anonymous prefix" ON storage.objects;
DROP POLICY IF EXISTS "Anonymous users can upload to media bucket" ON storage.objects;

CREATE POLICY "Anonymous upload scoped to anonymous prefix"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = 'anonymous'
  );
