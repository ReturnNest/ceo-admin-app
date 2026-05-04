-- MIGRATION: ADD NAIRA (NGN) PRICING SUPPORT
-- Date: 2026-05-04

DO $$ 
BEGIN 
    -- 1. Add columns to 'listings' table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'price_ngn') THEN
        ALTER TABLE listings ADD COLUMN price_ngn numeric DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'min_investment_ngn') THEN
        ALTER TABLE listings ADD COLUMN min_investment_ngn numeric DEFAULT 0;
    END IF;

    -- 2. Add columns to 'properties' table (Marketplace Mirror)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'properties') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'price_ngn') THEN
            ALTER TABLE properties ADD COLUMN price_ngn numeric DEFAULT 0;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'min_investment_ngn') THEN
            ALTER TABLE properties ADD COLUMN min_investment_ngn numeric DEFAULT 0;
        END IF;
    END IF;
END $$;

-- 3. UPDATE create_listing RPC TO SUPPORT NGN
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
  p_address text DEFAULT NULL,
  p_price_ngn numeric DEFAULT 0,
  p_min_investment_ngn numeric DEFAULT 0
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  -- 1. Insert into listings
  INSERT INTO listings (
    title, 
    type, 
    category,
    valuation, 
    price,
    price_ngn,
    location, 
    address,
    description, 
    seller_id, 
    target_amount, 
    min_investment, 
    min_investment_ngn,
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
    p_price_ngn,
    p_location, 
    COALESCE(p_address, p_location),
    p_description, 
    p_seller_id, 
    p_target_amount, 
    p_min_investment, 
    p_min_investment_ngn,
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
        price_ngn,
        target_amount,
        min_investment,
        min_investment_ngn,
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
        p_valuation,
        p_price_ngn,
        p_target_amount,
        p_min_investment,
        p_min_investment_ngn,
        p_description,
        p_images,
        p_status
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        type = EXCLUDED.type,
        location = EXCLUDED.location,
        valuation = EXCLUDED.valuation,
        price_ngn = EXCLUDED.price_ngn,
        min_investment_ngn = EXCLUDED.min_investment_ngn,
        description = EXCLUDED.description,
        images = EXCLUDED.images;
  END IF;
  
  RETURN v_id;
END;
$$;
