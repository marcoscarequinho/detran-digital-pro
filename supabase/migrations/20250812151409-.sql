-- Fix security warnings - set search_path for all functions
-- This addresses the Function Search Path Mutable warnings

-- Fix log_auth_attempt function
CREATE OR REPLACE FUNCTION public.log_auth_attempt(
  p_email TEXT DEFAULT NULL,
  p_identifier TEXT DEFAULT NULL,
  p_attempt_type TEXT DEFAULT 'client',
  p_success BOOLEAN DEFAULT FALSE,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.auth_attempts (
    email, identifier, attempt_type, success, error_message, created_at
  ) VALUES (
    p_email, p_identifier, p_attempt_type, p_success, p_error_message, now()
  );
END;
$$;

-- Fix is_account_locked function
CREATE OR REPLACE FUNCTION public.is_account_locked(p_email TEXT)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
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
$$;

-- Fix get_client_by_secure_lookup function
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
) 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
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
$$;