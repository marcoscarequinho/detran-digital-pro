-- Critical Security Fixes Migration (Fixed)
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

-- 4. Create function to log authentication attempts
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

-- 5. Create function to check if account is locked
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

-- 6. Create function to get client by secure lookup
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

-- 7. Add indexes for performance and security
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id_created_at ON public.security_audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_action_created_at ON public.security_audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_email_created_at ON public.auth_attempts(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_identifier_created_at ON public.auth_attempts(identifier, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clientes_account_status ON public.clientes(account_status);
CREATE INDEX IF NOT EXISTS idx_clientes_email_verified ON public.clientes(email_verified);