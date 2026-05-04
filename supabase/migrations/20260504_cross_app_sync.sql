-- REVISED MIGRATION: CROSS-APP SYNCHRONIZATION AND DATA NORMALIZATION
-- Date: 2026-05-04
-- Target: Resolve visibility gap by matching Marketplace filter casing (Capitalized)

DO $$ 
BEGIN 
    -- 1. Create or Update 'properties' table (Required by Marketplace App)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'properties') THEN
        CREATE TABLE public.properties (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            title text NOT NULL,
            type text,
            location text,
            address text,
            valuation numeric DEFAULT 0,
            price numeric DEFAULT 0,
            target_amount numeric DEFAULT 0,
            min_investment numeric DEFAULT 0,
            description text,
            images text[] DEFAULT '{}',
            status text DEFAULT 'active',
            created_at timestamp with time zone DEFAULT now()
        );
        -- Enable RLS for public read
        ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow public read access for properties" ON public.properties FOR SELECT USING (true);
    ELSE
        -- Ensure columns exist in existing properties table
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'price') THEN
            ALTER TABLE properties ADD COLUMN price numeric DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'target_amount') THEN
            ALTER TABLE properties ADD COLUMN target_amount numeric DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'min_investment') THEN
            ALTER TABLE properties ADD COLUMN min_investment numeric DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'status') THEN
            ALTER TABLE properties ADD COLUMN status text DEFAULT 'active';
        END IF;
    END IF;

    -- 2. Ensure all required columns exist in 'listings'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'category') THEN
        ALTER TABLE listings ADD COLUMN category text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'price') THEN
        ALTER TABLE listings ADD COLUMN price numeric;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'price_per_share') THEN
        ALTER TABLE listings ADD COLUMN price_per_share numeric;
    END IF;
END $$;

-- 3. Update Existing Data (Normalization to Capitalized Case)
-- This matches the Marketplace filters seen in the UI (e.g. "Land", "Real Estate")
UPDATE listings 
SET 
    category = INITCAP(COALESCE(category, type, 'Real Estate')),
    type = INITCAP(COALESCE(type, 'Real Estate')),
    price = COALESCE(price, valuation, 0),
    price_per_share = COALESCE(price_per_share, min_investment, 1000);

-- Special mapping for known types if needed
UPDATE listings SET type = 'Real Estate', category = 'Real Estate' WHERE type ILIKE 'real-estate' OR type ILIKE 'property';
UPDATE listings SET type = 'Agri-Tech', category = 'Agri-Tech' WHERE type ILIKE 'agriculture';

-- 4. Sync 'properties' table with corrected data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'properties') THEN
        -- Clear and re-sync to ensure capitalization matches
        DELETE FROM properties;
        
        INSERT INTO properties (id, title, type, location, address, valuation, price, target_amount, min_investment, description, images, status, created_at)
        SELECT id, title, type, location, address, valuation, price, target_amount, min_investment, description, images, status, created_at
        FROM listings
        WHERE status = 'active';
    END IF;
END $$;

-- 5. UPDATED ROBUST create_listing RPC
CREATE OR REPLACE FUNCTION create_listing(
  p_title text,
  p_type text,
  p_valuation numeric,
  p_location text,
  p_description text,
  p_seller_id uuid,
  p_target_amount numeric DEFAULT 0,
  p_min_investment numeric DEFAULT 1000,
  p_images text[] DEFAULT '{}',
  p_status text DEFAULT 'active',
  p_real_estate_name text DEFAULT NULL,
  p_real_estate_contact text DEFAULT NULL,
  p_real_estate_agent text DEFAULT NULL,
  p_internal_notes text DEFAULT NULL,
  p_address text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  -- We preserve the casing passed from the Admin UI (e.g. "Land", "Shortlet")
  -- as the Marketplace filters are configured for capitalized values.

  -- 1. Insert into listings
  INSERT INTO listings (
    title, 
    type, 
    category,
    valuation, 
    price,
    location, 
    address,
    description, 
    seller_id, 
    target_amount, 
    min_investment, 
    price_per_share,
    images, 
    status,
    real_estate_name,
    real_estate_contact,
    real_estate_agent,
    internal_notes
  )
  VALUES (
    p_title, 
    p_type, 
    p_type, 
    p_valuation, 
    p_valuation,
    p_location, 
    COALESCE(p_address, p_location),
    p_description, 
    p_seller_id, 
    p_target_amount, 
    p_min_investment, 
    p_min_investment,
    p_images, 
    p_status,
    p_real_estate_name,
    p_real_estate_contact,
    p_real_estate_agent,
    p_internal_notes
  )
  RETURNING id INTO v_id;

  -- 2. Insert into properties (Marketplace Mirror)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'properties') THEN
      INSERT INTO properties (
        id,
        title,
        type,
        location,
        address,
        valuation,
        price,
        target_amount,
        min_investment,
        description,
        images,
        status
      )
      VALUES (
        v_id,
        p_title,
        p_type,
        p_location,
        COALESCE(p_address, p_location),
        p_valuation,
        p_valuation, -- Mirroring price from valuation
        p_target_amount,
        p_min_investment,
        p_description,
        p_images,
        p_status
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        type = EXCLUDED.type,
        location = EXCLUDED.location,
        valuation = EXCLUDED.valuation,
        description = EXCLUDED.description,
        images = EXCLUDED.images;
  END IF;
  
  RETURN v_id;
END;
$$;
