-- Comprehensive migration to ensure 'listings' table has all required columns
DO $$ 
BEGIN 
    -- 1. Check for 'type' column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'type') THEN
        ALTER TABLE listings ADD COLUMN type text DEFAULT 'property';
    END IF;

    -- 2. Check for 'valuation' column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'valuation') THEN
        ALTER TABLE listings ADD COLUMN valuation numeric DEFAULT 0;
    END IF;

    -- 3. Check for 'description' column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'description') THEN
        ALTER TABLE listings ADD COLUMN description text;
    END IF;

    -- 4. Check for 'status' column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'status') THEN
        ALTER TABLE listings ADD COLUMN status text DEFAULT 'pending';
    END IF;

    -- 5. Re-check 'location' and 'seller_id' just in case
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'location') THEN
        ALTER TABLE listings ADD COLUMN location text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'seller_id') THEN
        ALTER TABLE listings ADD COLUMN seller_id UUID REFERENCES profiles(id);
    END IF;

    -- 6. Check for 'title' column (should exist, but good to be safe)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'title') THEN
        ALTER TABLE listings ADD COLUMN title text;
    END IF;

END $$;
