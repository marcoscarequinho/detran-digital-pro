-- Create security definer function to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_tipo()
RETURNS app_role AS $$
  SELECT tipo_usuario FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING (public.get_current_user_tipo() = 'admin'::app_role);