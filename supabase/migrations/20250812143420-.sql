-- Fix critical RLS policies by removing all existing insecure policies and creating secure ones

-- Drop ALL existing policies for clientes table
DROP POLICY IF EXISTS "Admins can manage all clientes" ON public.clientes;
DROP POLICY IF EXISTS "Clientes can view their own data by CPF" ON public.clientes;
DROP POLICY IF EXISTS "Users can view their own cliente record" ON public.clientes;

-- Drop ALL existing policies for documentos table  
DROP POLICY IF EXISTS "Admins can manage all documentos" ON public.documentos;
DROP POLICY IF EXISTS "Clientes can view their own documentos" ON public.documentos;
DROP POLICY IF EXISTS "Users can view their own documentos" ON public.documentos;

-- Create a function to get the current user's cliente_id based on their email
CREATE OR REPLACE FUNCTION public.get_current_user_cliente_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id 
  FROM public.clientes c
  JOIN public.profiles p ON p.email = c.email
  WHERE p.user_id = auth.uid()
  LIMIT 1;
$$;

-- Create secure admin policies for clientes
CREATE POLICY "Admins can manage all clientes"
ON public.clientes
FOR ALL
TO authenticated
USING (
  (SELECT tipo_usuario FROM public.profiles WHERE user_id = auth.uid()) = 'admin'::app_role
)
WITH CHECK (
  (SELECT tipo_usuario FROM public.profiles WHERE user_id = auth.uid()) = 'admin'::app_role
);

-- Create secure user policy for clientes - users can only see their own record
CREATE POLICY "Users can view their own cliente record"
ON public.clientes
FOR SELECT
TO authenticated
USING (
  id = public.get_current_user_cliente_id()
);

-- Create secure admin policies for documentos
CREATE POLICY "Admins can manage all documentos"
ON public.documentos
FOR ALL
TO authenticated
USING (
  (SELECT tipo_usuario FROM public.profiles WHERE user_id = auth.uid()) = 'admin'::app_role
)
WITH CHECK (
  (SELECT tipo_usuario FROM public.profiles WHERE user_id = auth.uid()) = 'admin'::app_role
);

-- Create secure user policy for documentos - users can only see their own documents
CREATE POLICY "Users can view their own documentos"
ON public.documentos
FOR SELECT
TO authenticated
USING (
  cliente_id = public.get_current_user_cliente_id()
);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_clientes_email ON public.clientes(email);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);