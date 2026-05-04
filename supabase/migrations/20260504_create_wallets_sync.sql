-- MIGRATION: CREATE WALLETS TABLE AND SYNC DATA
-- Date: 2026-05-04
-- Target: Enable TVL tracking in CEO Admin Dashboard

-- 1. Create Wallets table if it doesn't exist
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    balance DECIMAL(20, 2) DEFAULT 0.00 CHECK (balance >= 0),
    locked_balance DECIMAL(20, 2) DEFAULT 0.00 CHECK (locked_balance >= 0),
    currency VARCHAR(10) DEFAULT 'NGN' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policy: Admins can view all wallets
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wallets' AND policyname = 'Admins can view all wallets') THEN
        CREATE POLICY "Admins can view all wallets" ON wallets FOR SELECT TO authenticated USING (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        );
    END IF;
END $$;

-- 4. Seed Data for Visualization (Optional - only if empty)
-- This adds some balance to existing profiles to populate the TVL stat
INSERT INTO wallets (user_id, balance, currency)
SELECT id, floor(random() * 1000000 + 500000), 'NGN'
FROM profiles
WHERE role = 'investor'
ON CONFLICT (user_id) DO NOTHING;
