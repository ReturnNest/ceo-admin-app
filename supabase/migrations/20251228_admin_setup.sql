-- 1. Extend profiles table for RBAC
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role text DEFAULT 'investor' CHECK (role IN ('investor', 'seller', 'admin'));
    END IF;
END $$;

-- 2. Create audit_logs table for administrative tracking
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    target_id TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Only admins can view audit logs
CREATE POLICY "Admins can view all audit logs" 
ON audit_logs FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 5. RLS Policy: Admins can manage all listings
CREATE POLICY "Admins can manage all listings" 
ON listings FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 6. RLS Policy: Admins can update all profiles (for verification)
CREATE POLICY "Admins can update profiles" 
ON profiles FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 7. Function to log admin actions (can be called from Frontend or Trigger)
CREATE OR REPLACE FUNCTION log_admin_action(p_admin_id UUID, p_action TEXT, p_target_id TEXT, p_details JSONB)
RETURNS VOID AS $$
BEGIN
    INSERT INTO audit_logs (admin_id, action, target_id, details)
    VALUES (p_admin_id, p_action, p_target_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. RLS Policy: Users can view their own profile (Critical for role verification)
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
TO authenticated 
USING (
    auth.uid() = id
);
