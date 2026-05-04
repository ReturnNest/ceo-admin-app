-- Function to bypass PostgREST table schema cache issues
-- This function accesses the table directly from the database side
CREATE OR REPLACE FUNCTION create_listing(
  p_title text,
  p_type text,
  p_valuation numeric,
  p_location text,
  p_description text,
  p_seller_id uuid,
  p_target_amount numeric,
  p_min_investment numeric DEFAULT 1000,
  p_images text[] DEFAULT '{}',
  p_status text DEFAULT 'active'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO listings (title, type, valuation, location, description, seller_id, target_amount, min_investment, images, status)
  VALUES (p_title, p_type, p_valuation, p_location, p_description, p_seller_id, p_target_amount, p_min_investment, p_images, p_status)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;
