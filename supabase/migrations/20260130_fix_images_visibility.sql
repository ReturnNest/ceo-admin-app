-- 1. Force the 'listings' bucket to be public
-- This is critical for getPublicUrl() to return accessible URLs
UPDATE storage.buckets
SET public = true
WHERE id = 'listings';

-- 2. Ensure the 'images' column exists in the 'listings' table (safety check)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'images') THEN
        ALTER TABLE listings ADD COLUMN images text[] DEFAULT '{}';
    END IF;
END $$;

-- 3. Update Policy: Public read access for listings
-- We drop and recreate to ensure it's correct
DROP POLICY IF EXISTS "Public read access for listings" ON storage.objects;

CREATE POLICY "Public read access for listings"
ON storage.objects FOR SELECT
USING (bucket_id = 'listings');

-- 4. Verify other policies exist (idempotent checks)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND policyname = 'Authenticated users can upload listings'
    ) THEN
        CREATE POLICY "Authenticated users can upload listings"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'listings');
    END IF;
END $$;
