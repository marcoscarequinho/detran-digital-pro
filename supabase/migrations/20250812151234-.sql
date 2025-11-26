-- Critical Security Fixes Migration
-- This migration addresses critical security vulnerabilities

-- 1. Create audit log table for security monitoring
CREATE TABLE public.security_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view all audit logs" 
ON public.security_audit_logs 
FOR SELECT 
USING (get_current_user_tipo() = 'admin'::app_role);

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.security_audit_logs 
FOR INSERT 
WITH CHECK (true);

-- 2. Create authentication attempts table for rate limiting and monitoring
CREATE TABLE public.auth_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  identifier TEXT, -- for client logins (placa/cpf combination)
  attempt_type TEXT NOT NULL, -- 'admin' or 'client'
  success BOOLEAN NOT NULL DEFAULT FALSE,
  ip_address INET,
  user_agent TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on auth attempts
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view auth attempts
CREATE POLICY "Admins can view all auth attempts" 
ON public.auth_attempts 
FOR SELECT 
USING (get_current_user_tipo() = 'admin'::app_role);

-- System can insert auth attempts
CREATE POLICY "System can insert auth attempts" 
ON public.auth_attempts 
FOR INSERT 
WITH CHECK (true);

-- 3. Add account status and security fields to clientes table
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'pending_activation' CHECK (account_status IN ('pending_activation', 'active', 'suspended', 'locked')),
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- 4. Update profiles table to prevent role escalation
-- First, make sure we can't update tipo_usuario from the application
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow admins to change user roles
  IF OLD.tipo_usuario IS DISTINCT FROM NEW.tipo_usuario THEN
    -- Check if current user is admin
    IF get_current_user_tipo() != 'admin'::app_role THEN
      RAISE EXCEPTION 'Unauthorized: Only administrators can change user roles';
    END IF;
    
    -- Log the role change
    INSERT INTO public.security_audit_logs (
      user_id, action, resource_type, resource_id, 
      details, created_at
    ) VALUES (
      auth.uid(), 'role_change', 'profiles', NEW.id,
      jsonb_build_object(
        'old_role', OLD.tipo_usuario,
        'new_role', NEW.tipo_usuario,
        'target_user_id', NEW.user_id
      ),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to prevent unauthorized role changes
DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.profiles;
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- 5. Create function to log authentication attempts
CREATE OR REPLACE FUNCTION public.log_auth_attempt(
  p_email TEXT DEFAULT NULL,
  p_identifier TEXT DEFAULT NULL,
  p_attempt_type TEXT DEFAULT 'client',
  p_success BOOLEAN DEFAULT FALSE,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.auth_attempts (
    email, identifier, attempt_type, success, error_message, created_at
  ) VALUES (
    p_email, p_identifier, p_attempt_type, p_success, p_error_message, now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create function to check if account is locked
CREATE OR REPLACE FUNCTION public.is_account_locked(p_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  failed_attempts INTEGER;
  last_attempt TIMESTAMP WITH TIME ZONE;
  lockout_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get recent failed attempts (last 15 minutes)
  SELECT COUNT(*), MAX(created_at)
  INTO failed_attempts, last_attempt
  FROM public.auth_attempts
  WHERE email = p_email 
    AND success = FALSE 
    AND created_at > now() - INTERVAL '15 minutes';
  
  -- If 5 or more failed attempts in 15 minutes, account is locked for 30 minutes
  IF failed_attempts >= 5 THEN
    lockout_time := last_attempt + INTERVAL '30 minutes';
    IF now() < lockout_time THEN
      RETURN TRUE;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create more restrictive RLS policies for profiles
-- Drop existing profile update policy and create a more restrictive one
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update own profile (restricted)" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND (
    -- Users can only update their own non-security fields
    OLD.tipo_usuario = NEW.tipo_usuario  -- Cannot change role
    AND OLD.user_id = NEW.user_id        -- Cannot change user_id
  )
);

-- 8. Create function to get client by secure lookup
CREATE OR REPLACE FUNCTION public.get_client_by_secure_lookup(
  p_placa TEXT,
  p_cpf TEXT
)
RETURNS TABLE(
  id UUID,
  nome TEXT,
  email TEXT,
  account_status TEXT,
  email_verified BOOLEAN,
  login_attempts INTEGER,
  locked_until TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Log the lookup attempt
  PERFORM public.log_auth_attempt(
    NULL, 
    p_placa || '_' || p_cpf, 
    'client_lookup', 
    TRUE, 
    NULL
  );
  
  RETURN QUERY
  SELECT 
    c.id,
    c.nome,
    c.email,
    c.account_status,
    c.email_verified,
    c.login_attempts,
    c.locked_until
  FROM public.clientes c
  WHERE c.placa_veiculo = p_placa 
    AND c.cpf = p_cpf
    AND c.account_status != 'suspended';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Add indexes for performance and security
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id_created_at ON public.security_audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_action_created_at ON public.security_audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_email_created_at ON public.auth_attempts(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_identifier_created_at ON public.auth_attempts(identifier, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clientes_account_status ON public.clientes(account_status);
CREATE INDEX IF NOT EXISTS idx_clientes_email_verified ON public.clientes(email_verified);

-- 10. Update the handle_new_user function to include security logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, nome, tipo_usuario)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'name', 'Usuário'),
    COALESCE((NEW.raw_user_meta_data->>'tipo_usuario')::app_role, 'cliente'::app_role)
  );
  
  -- Log new user creation
  INSERT INTO public.security_audit_logs (
    user_id, action, resource_type, resource_id, 
    details, created_at
  ) VALUES (
    NEW.id, 'user_created', 'auth_users', NEW.id,
    jsonb_build_object(
      'email', NEW.email,
      'tipo_usuario', COALESCE(NEW.raw_user_meta_data->>'tipo_usuario', 'cliente')
    ),
    now()
  );
  
  RETURN NEW;
END;
$$;