-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all profiles (to populate the User list)
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy: Users can view Admin and Seller profiles (to see who sent messages)
CREATE POLICY "Users can view public roles"
ON profiles FOR SELECT
TO authenticated
USING (
    role IN ('admin', 'seller')
);

-- Note: The existing "Users can view own profile" policy handles self-viewing.
-- If that doesn't exist, we should add it, but 20251228_admin_setup.sql seemed to have it.
-- Just in case:
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" 
        ON profiles FOR SELECT 
        TO authenticated 
        USING ( auth.uid() = id );
    END IF;
END $$;
