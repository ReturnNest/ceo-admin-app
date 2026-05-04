-- 1. Update the password for the admin user in Supabase Auth
-- Note: Replace 'RtN_Adm!n_2026_#Xz9$KqP2' with the password if you wish to change it again.
-- We use the crypt function to hash the password correctly for Supabase.

UPDATE auth.users
SET encrypted_password = crypt('RtN_Adm!n_2026_#Xz9$KqP2', gen_salt('bf'))
WHERE email = 'petertayo123@gmail.com';

-- 2. Ensure the user exists in the public.profiles table with the 'admin' role
-- This resolves the "Access denied: Unable to verify administrator privileges" error.

INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'petertayo123@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin';

-- 3. Verify the changes
SELECT id, email, role FROM public.profiles WHERE email = 'petertayo123@gmail.com';
