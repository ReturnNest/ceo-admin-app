-- Add seller_id column to listings table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'seller_id') THEN
        ALTER TABLE listings ADD COLUMN seller_id UUID REFERENCES profiles(id);
    END IF;
END $$;
