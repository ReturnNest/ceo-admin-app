-- FINAL MIGRATION FOR PRIVATE VENDOR DATA AND CATEGORY UPDATES
-- Run this in Supabase SQL Editor to fix "Uploading not working" and enable Private Records.

DO $$ 
BEGIN 
    -- 1. Add Internal Admin Columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'real_estate_name') THEN
        ALTER TABLE listings ADD COLUMN real_estate_name text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'real_estate_contact') THEN
        ALTER TABLE listings ADD COLUMN real_estate_contact text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'real_estate_agent') THEN
        ALTER TABLE listings ADD COLUMN real_estate_agent text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'internal_notes') THEN
        ALTER TABLE listings ADD COLUMN internal_notes text;
    END IF;

    -- 2. Ensure Category & Compatibility Columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'category') THEN
        ALTER TABLE listings ADD COLUMN category text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'price') THEN
        ALTER TABLE listings ADD COLUMN price numeric;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'address') THEN
        ALTER TABLE listings ADD COLUMN address text;
    END IF;
END $$;

-- 3. Update create_listing RPC with the exact signature expected by the Frontend
-- This version handles the mapping of categories to the database 'type' and 'category' columns.
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
    images, 
    status,
    real_estate_name,
    real_estate_contact,
    real_estate_agent,
    internal_notes
  )
  VALUES (
    p_title, 
    p_type,      -- Saves to 'type' column
    p_type,      -- Also saves to 'category' column for cross-app compatibility
    p_valuation, 
    p_valuation, -- Default price to valuation if not separate
    p_location, 
    COALESCE(p_address, p_location),
    p_description, 
    p_seller_id, 
    p_target_amount, 
    p_min_investment, 
    p_images, 
    p_status,
    p_real_estate_name,
    p_real_estate_contact,
    p_real_estate_agent,
    p_internal_notes
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;
