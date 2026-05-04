-- Fix for Ambiguous Function Error
-- We need to drop the old function signatures to resolve ambiguity

-- 1. Drop the original function (from 20260126_create_listing_rpc.sql)
DROP FUNCTION IF EXISTS create_listing(text, text, numeric, text, text, uuid, numeric, numeric, text[], text);

-- 2. Drop the new function signature if it was partially created (from 20260130_robust_location_fix.sql)
DROP FUNCTION IF EXISTS create_listing(text, text, numeric, text, text, uuid, numeric, numeric, text[], text, text, text, text, text);

-- 3. Re-create the single, correct function with all robust features
CREATE OR REPLACE FUNCTION create_listing(
    p_title text,
    p_type text,
    p_valuation numeric,
    p_location text, -- This will be saved to both location AND address
    p_description text,
    p_seller_id uuid,
    p_target_amount numeric DEFAULT 0,
    p_min_investment numeric DEFAULT 1000,
    p_images text[] DEFAULT NULL,
    p_status text DEFAULT 'pending',
    p_address text DEFAULT NULL, -- Explicit address if provided
    p_city text DEFAULT NULL,
    p_state text DEFAULT NULL,
    p_zip text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_listing_id uuid;
    final_address text;
    final_location text;
    final_type text;
BEGIN
    -- Logic to ensure we populate both location and address for maximum compatibility
    final_address := COALESCE(p_address, p_location);
    final_location := COALESCE(p_location, p_address);
    
    final_type := p_type; 

    INSERT INTO listings (
        title,
        type,
        valuation,
        location,
        address, -- Populate address too
        city,
        state,
        zip,
        description,
        seller_id,
        target_amount,
        min_investment,
        price_per_share, -- Populate this as well just in case
        images,
        status
    ) VALUES (
        p_title,
        final_type,
        p_valuation,
        final_location,
        final_address, -- Populate address too
        p_city,
        p_state,
        p_zip,
        p_description,
        p_seller_id,
        p_target_amount,
        p_min_investment,
        p_min_investment, -- Default price_per_share to min_investment
        p_images,
        p_status
    )
    RETURNING id INTO new_listing_id;

    RETURN new_listing_id;
END;
$$;
