-- Force add the 'type' column which is definitely missing
ALTER TABLE listings ADD COLUMN IF NOT EXISTS type text DEFAULT 'property';

-- Also ensure other columns are present just in case
ALTER TABLE listings ADD COLUMN IF NOT EXISTS valuation numeric DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
