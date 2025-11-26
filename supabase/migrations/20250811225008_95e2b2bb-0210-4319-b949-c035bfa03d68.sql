-- Fix security definer function with proper search path
CREATE OR REPLACE FUNCTION public.get_current_user_tipo()
RETURNS app_role 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
  SELECT tipo_usuario FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;