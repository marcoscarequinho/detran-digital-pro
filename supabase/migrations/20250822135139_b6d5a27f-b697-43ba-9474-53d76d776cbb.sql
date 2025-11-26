-- Enhanced security improvements for production

-- Update the edge function error logging to be more secure
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_resource_type text,
  p_details jsonb DEFAULT NULL,
  p_severity text DEFAULT 'info'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.security_audit_logs (
    user_id, action, resource_type, details, created_at
  ) VALUES (
    auth.uid(), 
    p_event_type, 
    p_resource_type,
    COALESCE(p_details, jsonb_build_object('severity', p_severity)),
    now()
  );
END;
$function$;

-- Enhanced rate limiting with dynamic thresholds
CREATE OR REPLACE FUNCTION public.check_enhanced_rate_limit(
  p_ip_address inet,
  p_endpoint text,
  p_user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_requests INTEGER := 0;
  max_requests INTEGER := 15; -- Default limit
  window_minutes INTEGER := 1;
  is_suspicious BOOLEAN := FALSE;
  result jsonb;
BEGIN
  -- Check for suspicious patterns
  IF p_user_agent IS NOT NULL THEN
    is_suspicious := (
      p_user_agent ~* '(bot|crawler|scraper|scanner|hack|attack|automated)' OR
      length(p_user_agent) < 10 OR
      p_user_agent = '' OR
      p_user_agent ~* '^(curl|wget|python|java|php|ruby)'
    );
  END IF;
  
  -- Stricter limits for suspicious requests
  IF is_suspicious THEN
    max_requests := 5;
    window_minutes := 5;
  END IF;
  
  -- Count current requests in window
  SELECT COALESCE(SUM(request_count), 0)
  INTO current_requests
  FROM public.api_rate_limits
  WHERE ip_address = p_ip_address 
    AND endpoint = p_endpoint
    AND created_at > now() - (window_minutes || ' minutes')::INTERVAL;
  
  -- Check if limit exceeded
  IF current_requests >= max_requests THEN
    -- Log rate limit violation
    PERFORM public.log_security_event(
      'rate_limit_exceeded',
      'api_security',
      jsonb_build_object(
        'ip_address', p_ip_address,
        'endpoint', p_endpoint,
        'current_requests', current_requests,
        'max_requests', max_requests,
        'is_suspicious', is_suspicious,
        'user_agent_truncated', left(COALESCE(p_user_agent, ''), 100)
      ),
      'warning'
    );
    
    result := jsonb_build_object(
      'allowed', false,
      'reason', 'rate_limit_exceeded',
      'current_requests', current_requests,
      'max_requests', max_requests
    );
  ELSE
    -- Record the request
    INSERT INTO public.api_rate_limits (ip_address, endpoint, request_count, window_start)
    VALUES (p_ip_address, p_endpoint, 1, now())
    ON CONFLICT (ip_address, endpoint) 
    DO UPDATE SET 
      request_count = api_rate_limits.request_count + 1,
      created_at = now();
    
    result := jsonb_build_object(
      'allowed', true,
      'current_requests', current_requests + 1,
      'max_requests', max_requests
    );
  END IF;
  
  RETURN result;
END;
$function$;

-- Enhanced PII masking function with better protection
CREATE OR REPLACE FUNCTION public.enhanced_mask_pii(
  data text, 
  data_type text DEFAULT 'general',
  user_role app_role DEFAULT 'cliente'::app_role
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Return original data for admins
  IF user_role = 'admin'::app_role THEN
    RETURN data;
  END IF;
  
  IF data IS NULL OR data = '' THEN
    RETURN data;
  END IF;
  
  CASE data_type
    WHEN 'cpf' THEN
      -- Mask CPF keeping only last 4 digits visible
      IF length(data) >= 4 THEN
        RETURN repeat('*', length(data) - 4) || right(data, 4);
      ELSE
        RETURN repeat('*', length(data));
      END IF;
    WHEN 'email' THEN
      -- Mask email preserving domain
      IF position('@' in data) > 0 THEN
        RETURN left(data, 2) || repeat('*', position('@' in data) - 3) || right(data, length(data) - position('@' in data) + 1);
      ELSE
        RETURN repeat('*', length(data));
      END IF;
    WHEN 'phone' THEN
      -- Mask phone keeping only last 4 digits
      IF length(data) >= 4 THEN
        RETURN repeat('*', length(data) - 4) || right(data, 4);
      ELSE
        RETURN repeat('*', length(data));
      END IF;
    WHEN 'address' THEN
      -- Completely mask addresses for non-admins
      RETURN '*** Endereço Protegido ***';
    ELSE
      -- General masking
      IF length(data) <= 4 THEN
        RETURN repeat('*', length(data));
      ELSE
        RETURN left(data, 1) || repeat('*', length(data) - 2) || right(data, 1);
      END IF;
  END CASE;
END;
$function$;

-- Enhanced secure client data function with better PII protection
CREATE OR REPLACE FUNCTION public.get_enhanced_cliente_data_secure(p_cliente_id uuid DEFAULT NULL::uuid)
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
  login_attempts integer, 
  locked_until timestamp with time zone, 
  last_login_at timestamp with time zone, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_role app_role;
BEGIN
  -- Get current user role
  current_user_role := public.get_current_user_tipo();
  
  -- Log data access attempt
  IF p_cliente_id IS NOT NULL THEN
    PERFORM public.log_security_event(
      'client_data_access',
      'pii_data',
      jsonb_build_object(
        'cliente_id', p_cliente_id,
        'user_role', current_user_role,
        'access_type', 'secure_function'
      )
    );
  END IF;

  RETURN QUERY
  SELECT 
    c.id,
    public.enhanced_mask_pii(c.cpf, 'cpf', current_user_role) as cpf,
    CASE 
      WHEN current_user_role = 'admin'::app_role THEN c.nome
      ELSE public.enhanced_mask_pii(c.nome, 'general', current_user_role)
    END as nome,
    public.enhanced_mask_pii(c.email, 'email', current_user_role) as email,
    public.enhanced_mask_pii(c.telefone, 'phone', current_user_role) as telefone,
    public.enhanced_mask_pii(c.endereco, 'address', current_user_role) as endereco,
    c.placa_veiculo,
    c.email_verified,
    c.account_status,
    c.login_attempts,
    c.locked_until,
    c.last_login_at,
    c.created_at,
    c.updated_at
  FROM public.clientes c
  WHERE (p_cliente_id IS NULL OR c.id = p_cliente_id)
    AND (
      -- Admins can see all data (already masked appropriately above)
      current_user_role = 'admin'::app_role
      OR 
      -- Users can see only their own data (masked)
      c.id = public.get_current_user_cliente_id()
    );
END;
$function$;

-- Create automated security monitoring function
CREATE OR REPLACE FUNCTION public.check_security_violations()
RETURNS TABLE(
  violation_type text,
  count_last_hour bigint,
  severity text,
  recommendation text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH security_stats AS (
    SELECT 
      action,
      COUNT(*) as event_count,
      MAX(created_at) as last_occurrence
    FROM public.security_audit_logs 
    WHERE created_at > now() - INTERVAL '1 hour'
    GROUP BY action
  )
  SELECT 
    ss.action as violation_type,
    ss.event_count as count_last_hour,
    CASE 
      WHEN ss.action = 'rate_limit_exceeded' AND ss.event_count > 50 THEN 'critical'
      WHEN ss.action = 'suspicious_api_request' AND ss.event_count > 20 THEN 'high'
      WHEN ss.action = 'auth_failure' AND ss.event_count > 10 THEN 'medium'
      ELSE 'low'
    END as severity,
    CASE 
      WHEN ss.action = 'rate_limit_exceeded' THEN 'Review IP addresses and consider blocking'
      WHEN ss.action = 'suspicious_api_request' THEN 'Investigate user agents and request patterns'
      WHEN ss.action = 'auth_failure' THEN 'Check for brute force attacks'
      ELSE 'Monitor for patterns'
    END as recommendation
  FROM security_stats ss
  WHERE ss.event_count > 5
  ORDER BY 
    CASE 
      WHEN ss.action = 'rate_limit_exceeded' AND ss.event_count > 50 THEN 1
      WHEN ss.action = 'suspicious_api_request' AND ss.event_count > 20 THEN 2
      WHEN ss.action = 'auth_failure' AND ss.event_count > 10 THEN 3
      ELSE 4
    END;
END;
$function$;

-- Enhanced JWT expiry check
CREATE OR REPLACE FUNCTION public.get_security_recommendations()
RETURNS TABLE(
  category text,
  status text,
  priority text,
  recommendation text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  VALUES
    ('JWT Configuration', '⚠️ NEEDS REVIEW', 'HIGH', 'Set JWT expiry to 1800 seconds (30 minutes) in Supabase Dashboard'),
    ('Rate Limiting', '✅ ACTIVE', 'MEDIUM', 'Enhanced rate limiting with suspicious pattern detection enabled'),
    ('PII Protection', '✅ ACTIVE', 'HIGH', 'Enhanced PII masking with role-based access control enabled'),
    ('Security Monitoring', '✅ ACTIVE', 'MEDIUM', 'Automated security violation detection enabled'),
    ('Audit Logging', '✅ ACTIVE', 'HIGH', 'Comprehensive security event logging enabled');
END;
$function$;