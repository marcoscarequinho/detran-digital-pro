-- Allow trigger to insert into profiles
CREATE POLICY "Allow trigger to insert profiles" ON public.profiles
FOR INSERT 
WITH CHECK (true);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);