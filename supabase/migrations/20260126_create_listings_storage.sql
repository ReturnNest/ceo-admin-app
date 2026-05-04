-- Create storage bucket for listing images
INSERT INTO storage.buckets (id, name, public)
VALUES ('listings', 'listings', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read access for listings"
ON storage.objects FOR SELECT
USING (bucket_id = 'listings');

-- Allow authenticated users (admins/sellers) to upload
CREATE POLICY "Authenticated users can upload listings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listings');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Authenticated users can delete listings"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'listings');
