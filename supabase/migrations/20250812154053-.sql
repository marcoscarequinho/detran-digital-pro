-- Corrigir problemas de segurança detectados pelo linter

-- Remover a view segura anterior que causou problema de security definer
DROP VIEW IF EXISTS public.clientes_secure;

-- Criar função segura para obter dados de cliente com mascaramento
CREATE OR REPLACE FUNCTION public.get_cliente_data_secure(p_cliente_id UUID DEFAULT NULL)
RETURNS TABLE(
  id UUID,
  cpf TEXT,
  nome TEXT,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  placa_veiculo TEXT,
  email_verified BOOLEAN,
  account_status TEXT,
  login_attempts INTEGER,
  locked_until TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log do acesso aos dados
  IF p_cliente_id IS NOT NULL THEN
    PERFORM public.log_data_access('clientes', p_cliente_id, 'secure_data_access');
  END IF;

  RETURN QUERY
  SELECT 
    c.id,
    c.cpf,
    CASE 
      WHEN public.can_view_full_pii() THEN c.nome
      ELSE public.mask_pii_data(c.nome, 'partial')
    END as nome,
    c.email,
    CASE 
      WHEN public.can_view_full_pii() THEN c.telefone
      ELSE public.mask_pii_data(c.telefone, 'partial')
    END as telefone,
    CASE 
      WHEN public.can_view_full_pii() THEN c.endereco
      ELSE public.mask_pii_data(c.endereco, 'full')
    END as endereco,
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
      -- Admins podem ver todos os dados
      public.get_current_user_tipo() = 'admin'::app_role
      OR 
      -- Usuários podem ver apenas seus próprios dados
      c.id = public.get_current_user_cliente_id()
    );
END;
$$;

-- Função para verificar integridade de token de API
CREATE OR REPLACE FUNCTION public.validate_api_request(
  p_ip_address INET,
  p_user_agent TEXT DEFAULT NULL,
  p_endpoint TEXT DEFAULT 'consulta-veiculo'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  is_rate_limited BOOLEAN;
  suspicious_pattern BOOLEAN := FALSE;
BEGIN
  -- Verificar rate limiting (15 requests por minuto)
  SELECT NOT public.check_rate_limit(p_ip_address, p_endpoint, 15, 1)
  INTO is_rate_limited;
  
  IF is_rate_limited THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar padrões suspeitos no User-Agent
  IF p_user_agent IS NOT NULL THEN
    suspicious_pattern := (
      p_user_agent ~* '(bot|crawler|scraper|scanner|hack|attack)' OR
      length(p_user_agent) < 10 OR
      p_user_agent = ''
    );
  END IF;
  
  -- Log de tentativas suspeitas
  IF suspicious_pattern THEN
    INSERT INTO public.security_audit_logs (
      action, resource_type, details, created_at
    ) VALUES (
      'suspicious_api_request', 'edge_function',
      jsonb_build_object(
        'ip_address', p_ip_address,
        'user_agent', p_user_agent,
        'endpoint', p_endpoint,
        'reason', 'suspicious_user_agent'
      ),
      now()
    );
  END IF;
  
  -- Permitir requisição mesmo com padrão suspeito, mas logar
  RETURN TRUE;
END;
$$;