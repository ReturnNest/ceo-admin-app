-- Migration to add Real Estate Company internal information to listings
-- This information is intended for administrative use only.

DO $$ 
BEGIN 
    -- Add real_estate_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'real_estate_name') THEN
        ALTER TABLE listings ADD COLUMN real_estate_name text;
    END IF;

    -- Add real_estate_contact
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'real_estate_contact') THEN
        ALTER TABLE listings ADD COLUMN real_estate_contact text;
    END IF;

    -- Add real_estate_agent
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'real_estate_agent') THEN
        ALTER TABLE listings ADD COLUMN real_estate_agent text;
    END IF;

    -- Add internal_notes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'internal_notes') THEN
        ALTER TABLE listings ADD COLUMN internal_notes text;
    END IF;

    -- Ensure category and price exist for cross-app compatibility
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'category') THEN
        ALTER TABLE listings ADD COLUMN category text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'price') THEN
        ALTER TABLE listings ADD COLUMN price numeric;
    END IF;
    
    -- Ensure address exists (legacy from 20260130 migration)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'address') THEN
        ALTER TABLE listings ADD COLUMN address text;
    END IF;
END $$;

-- Update create_listing RPC to support all legacy and new internal fields
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
  v_final_type text;
BEGIN
  -- Handle category/type mapping
  v_final_type := p_type;

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
    v_final_type, 
    p_type,
    p_valuation, 
    p_valuation,
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


