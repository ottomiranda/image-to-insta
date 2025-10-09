-- Create RLS policies for brand-logos bucket to allow authenticated users to upload
-- Policy for INSERT (upload)
CREATE POLICY "Authenticated users can upload to brand-logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'brand-logos'
);

-- Policy for SELECT (read/download)
CREATE POLICY "Anyone can view brand-logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'brand-logos');

-- Policy for UPDATE
CREATE POLICY "Users can update their own uploads in brand-logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'brand-logos' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'brand-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for DELETE
CREATE POLICY "Users can delete their own uploads in brand-logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'brand-logos' AND auth.uid()::text = (storage.foldername(name))[1]);