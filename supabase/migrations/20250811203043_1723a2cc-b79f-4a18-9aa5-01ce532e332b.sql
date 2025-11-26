-- Remove a política duplicada e conflitante
DROP POLICY IF EXISTS "Allow trigger to insert profiles" ON public.profiles;

-- Remove a política anterior se existir
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Criar uma política única que funciona tanto para trigger quanto para usuários
CREATE POLICY "Users and trigger can insert profiles" ON public.profiles
FOR INSERT 
WITH CHECK (true);