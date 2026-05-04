-- Comprehensive Fix for Listing Data

-- 1. Ensure columns exist for robust data storage
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS zip text,
ADD COLUMN IF NOT EXISTS min_investment numeric DEFAULT 1000, 
ADD COLUMN IF NOT EXISTS price_per_share numeric DEFAULT 1000; -- Often used interchangeably with min_investment

-- 2. Update the create_listing function to handle these new fields
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
    
    -- Ensure type is Title Case if that's what the frontend expects
    -- But let's just save exactly what is passed for now, assuming frontend handles it
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
        final_address,
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
