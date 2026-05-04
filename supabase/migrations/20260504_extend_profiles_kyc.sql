-- MIGRATION: EXTEND PROFILES FOR KYC AND USER DATA
-- Date: 2026-05-04
-- Target: Sync profiles with Marketplace Identity Node data

DO $$ 
BEGIN 
    -- 1. Identity Information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'title') THEN
        ALTER TABLE profiles ADD COLUMN title text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone_number') THEN
        ALTER TABLE profiles ADD COLUMN phone_number text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'gender') THEN
        ALTER TABLE profiles ADD COLUMN gender text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'nin') THEN
        ALTER TABLE profiles ADD COLUMN nin text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'marital_status') THEN
        ALTER TABLE profiles ADD COLUMN marital_status text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'dob') THEN
        ALTER TABLE profiles ADD COLUMN dob date;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'occupation') THEN
        ALTER TABLE profiles ADD COLUMN occupation text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'position') THEN
        ALTER TABLE profiles ADD COLUMN position text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'nationality') THEN
        ALTER TABLE profiles ADD COLUMN nationality text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'home_address') THEN
        ALTER TABLE profiles ADD COLUMN home_address text;
    END IF;

    -- 2. Work Information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'work_address') THEN
        ALTER TABLE profiles ADD COLUMN work_address text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'work_phone') THEN
        ALTER TABLE profiles ADD COLUMN work_phone text;
    END IF;

    -- 3. Next of Kin Information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'nok_fullname') THEN
        ALTER TABLE profiles ADD COLUMN nok_fullname text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'nok_relationship') THEN
        ALTER TABLE profiles ADD COLUMN nok_relationship text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'nok_phone') THEN
        ALTER TABLE profiles ADD COLUMN nok_phone text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'nok_email') THEN
        ALTER TABLE profiles ADD COLUMN nok_email text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'nok_address') THEN
        ALTER TABLE profiles ADD COLUMN nok_address text;
    END IF;

    -- 4. Financial / Wallet Integration
    -- Mirroring 'wallets' table info if needed, or just relying on joins.
    -- But let's ensure 'profiles' has a cached 'balance' for quick dashboard views if helpful.
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'wallet_balance') THEN
        ALTER TABLE profiles ADD COLUMN wallet_balance numeric DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE profiles ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;

END $$;

-- 5. Ensure Transactions and Investments tables are accessible to Admins
-- (Policies usually exist in a generic form, but let's be explicit)
DO $$
BEGIN
    -- Transactions Policy
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
        ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Admins can view all transactions') THEN
            CREATE POLICY "Admins can view all transactions" ON transactions FOR SELECT TO authenticated USING (
                EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
            );
        END IF;
    END IF;

    -- Investments Policy
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'investments') THEN
        ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'investments' AND policyname = 'Admins can view all investments') THEN
            CREATE POLICY "Admins can view all investments" ON investments FOR SELECT TO authenticated USING (
                EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
            );
        END IF;
    END IF;
END $$;
