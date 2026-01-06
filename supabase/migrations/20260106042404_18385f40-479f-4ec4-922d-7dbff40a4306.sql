-- Create storage bucket for maintenance issue images
INSERT INTO storage.buckets (id, name, public)
VALUES ('maintenance-images', 'maintenance-images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload maintenance images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'maintenance-images');

-- Allow anyone to view maintenance images (public bucket)
CREATE POLICY "Anyone can view maintenance images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'maintenance-images');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Authenticated users can delete their own maintenance images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'maintenance-images' AND auth.uid()::text = (storage.foldername(name))[1]);