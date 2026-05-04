-- Promote 'petertayo123@gmail.com' to admin
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'petertayo123@gmail.com'
);

-- Verify the change
SELECT * FROM public.profiles 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'petertayo123@gmail.com'
);
