-- CRITICAL SECURITY FIXES - PII Protection and Data Security Enhancement

-- 1. Create enhanced encryption and masking functions for PII protection
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data text, salt text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- For production: implement proper encryption with pgcrypto
  -- For now: enhanced masking with deterministic salt
  IF data IS NULL OR data = '' THEN
    RETURN data;
  END IF;
  
  -- Hash sensitive data for storage (in production, use proper encryption)
  RETURN encode(digest(data || COALESCE(salt, 'default_salt'), 'sha256'), 'hex');
END;
$$;

-- 2. Enhanced PII access control function with strict validation
CREATE OR REPLACE FUNCTION public.secure_pii_access(
  p_data text, 
  p_data_type text, 
  p_context text DEFAULT 'general',
  p_user_role app_role DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_role app_role;
BEGIN
  -- Get current user role if not provided
  current_user_role := COALESCE(p_user_role, public.get_current_user_tipo());
  
  -- Log PII access attempt
  PERFORM public.log_security_event(
    'pii_access_attempt',
    'sensitive_data',
    jsonb_build_object(
      'data_type', p_data_type,
      'context', p_context,
      'user_role', current_user_role,
      'access_granted', (current_user_role = 'admin'::app_role)
    ),
    CASE WHEN current_user_role = 'admin'::app_role THEN 'info' ELSE 'warning' END
  );
  
  -- Only admins get full access to PII
  IF current_user_role = 'admin'::app_role THEN
    RETURN p_data;
  END IF;
  
  -- Apply enhanced masking for non-admins
  RETURN public.enhanced_mask_pii(p_data, p_data_type, current_user_role);
END;
$$;

-- 3. Create secure client data access function with field-level protection
CREATE OR REPLACE FUNCTION public.get_secure_cliente_data(p_cliente_id uuid DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  cpf text,
  nome text,
  email text,
  telefone text,
  endereco text,
  placa_veiculo text,
  email_verified boolean,
  account_status text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role app_role;
BEGIN
  user_role := public.get_current_user_tipo();
  
  -- Log secure data access
  PERFORM public.log_security_event(
    'secure_client_data_access',
    'customer_pii',
    jsonb_build_object(
      'cliente_id', p_cliente_id,
      'user_role', user_role,
      'timestamp', now()
    )
  );

  RETURN QUERY
  SELECT 
    c.id,
    public.secure_pii_access(c.cpf, 'cpf', 'client_data', user_role) as cpf,
    public.secure_pii_access(c.nome, 'general', 'client_data', user_role) as nome,
    public.secure_pii_access(c.email, 'email', 'client_data', user_role) as email,
    public.secure_pii_access(c.telefone, 'phone', 'client_data', user_role) as telefone,
    public.secure_pii_access(c.endereco, 'address', 'client_data', user_role) as endereco,
    c.placa_veiculo,
    c.email_verified,
    c.account_status,
    c.created_at
  FROM public.clientes c
  WHERE (p_cliente_id IS NULL OR c.id = p_cliente_id)
    AND (
      user_role = 'admin'::app_role
      OR c.id = public.get_current_user_cliente_id()
    );
END;
$$;

-- 4. Enhanced authentication security with sanitized logging
CREATE OR REPLACE FUNCTION public.secure_log_auth_attempt(
  p_email text DEFAULT NULL,
  p_identifier text DEFAULT NULL,
  p_attempt_type text DEFAULT 'client',
  p_success boolean DEFAULT false,
  p_error_code text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert sanitized auth attempt (no sensitive error messages)
  INSERT INTO public.auth_attempts (
    email, 
    identifier, 
    attempt_type, 
    success, 
    error_message,
    created_at
  ) VALUES (
    CASE WHEN p_email IS NOT NULL THEN 
      public.enhanced_mask_pii(p_email, 'email', 'admin'::app_role)
    ELSE NULL END,
    p_identifier,
    p_attempt_type,
    p_success,
    CASE WHEN p_error_code IS NOT NULL THEN 
      'AUTH_ERROR_' || upper(p_error_code)
    ELSE NULL END,
    now()
  );
  
  -- Log to security audit with full context for admins
  PERFORM public.log_security_event(
    'authentication_attempt',
    'auth_security',
    jsonb_build_object(
      'attempt_type', p_attempt_type,
      'success', p_success,
      'error_code', p_error_code,
      'timestamp', now()
    ),
    CASE WHEN p_success THEN 'info' ELSE 'warning' END
  );
END;
$$;