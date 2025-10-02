-- Add logo_url column to brand_settings table
ALTER TABLE public.brand_settings 
ADD COLUMN logo_url text;

-- Create storage bucket for brand logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brand-logos',
  'brand-logos',
  true,
  2097152, -- 2MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
);

-- Create RLS policies for brand-logos bucket
CREATE POLICY "Users can upload their own brand logo"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'brand-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own brand logo"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'brand-logos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own brand logo"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'brand-logos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Brand logos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'brand-logos');