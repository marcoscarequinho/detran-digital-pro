-- Implementar proteção de dados usando hash e controle de acesso aprimorado
-- Criar funções de mascaramento de dados em vez de criptografia complexa

-- Função para mascarar dados PII (alternativa mais simples à criptografia)
CREATE OR REPLACE FUNCTION public.mask_pii_data(data TEXT, mask_type TEXT DEFAULT 'partial')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF data IS NULL OR data = '' THEN
    RETURN data;
  END IF;
  
  CASE mask_type
    WHEN 'partial' THEN
      -- Mascarar parcialmente (mostrar primeiros 2 e últimos 2 caracteres)
      IF length(data) <= 4 THEN
        RETURN '***';
      ELSE
        RETURN left(data, 2) || repeat('*', length(data) - 4) || right(data, 2);
      END IF;
    WHEN 'full' THEN
      -- Mascarar completamente
      RETURN repeat('*', GREATEST(length(data), 3));
    ELSE
      RETURN data;
  END CASE;
END;
$$;

-- Função para validar se usuário pode ver dados completos
CREATE OR REPLACE FUNCTION public.can_view_full_pii()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Apenas admins podem ver dados completos
  RETURN (public.get_current_user_tipo() = 'admin'::app_role);
END;
$$;

-- Criar view segura para clientes com mascaramento automático
CREATE OR REPLACE VIEW public.clientes_secure AS
SELECT 
  id,
  cpf,
  CASE 
    WHEN public.can_view_full_pii() THEN nome
    ELSE public.mask_pii_data(nome, 'partial')
  END as nome,
  email,
  CASE 
    WHEN public.can_view_full_pii() THEN telefone
    ELSE public.mask_pii_data(telefone, 'partial')
  END as telefone,
  CASE 
    WHEN public.can_view_full_pii() THEN endereco
    ELSE public.mask_pii_data(endereco, 'full')
  END as endereco,
  placa_veiculo,
  email_verified,
  account_status,
  login_attempts,
  locked_until,
  last_login_at,
  created_at,
  updated_at
FROM public.clientes;

-- Função para log de acessos a dados sensíveis
CREATE OR REPLACE FUNCTION public.log_data_access(
  p_resource_type TEXT,
  p_resource_id UUID,
  p_action TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.security_audit_logs (
    user_id, action, resource_type, resource_id, 
    details, created_at
  ) VALUES (
    auth.uid(), p_action, p_resource_type, p_resource_id,
    jsonb_build_object(
      'timestamp', now(),
      'user_role', public.get_current_user_tipo(),
      'can_view_full_pii', public.can_view_full_pii()
    ),
    now()
  );
END;
$$;

-- Criar tabela para controle de rate limiting da API
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ip_address, endpoint)
);

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_ip_endpoint 
ON public.api_rate_limits(ip_address, endpoint);

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_window 
ON public.api_rate_limits(window_start);

-- Habilitar RLS na tabela de rate limits
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Política para permitir que o sistema gerencie rate limits
CREATE POLICY "System can manage rate limits" 
ON public.api_rate_limits 
FOR ALL 
USING (true);

-- Função para verificar rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_ip_address INET,
  p_endpoint TEXT,
  p_max_requests INTEGER DEFAULT 10,
  p_window_minutes INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_requests INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Contar requests atuais na janela de tempo
  SELECT COALESCE(SUM(request_count), 0)
  INTO current_requests
  FROM public.api_rate_limits
  WHERE ip_address = p_ip_address 
    AND endpoint = p_endpoint
    AND created_at > window_start;
  
  -- Se excedeu o limite, retornar false
  IF current_requests >= p_max_requests THEN
    -- Log da tentativa de rate limit excedido
    INSERT INTO public.security_audit_logs (
      action, resource_type, details, created_at
    ) VALUES (
      'rate_limit_exceeded', 'api',
      jsonb_build_object(
        'ip_address', p_ip_address,
        'endpoint', p_endpoint,
        'current_requests', current_requests,
        'max_requests', p_max_requests
      ),
      now()
    );
    RETURN FALSE;
  END IF;
  
  -- Registrar a tentativa
  INSERT INTO public.api_rate_limits (ip_address, endpoint, request_count, window_start)
  VALUES (p_ip_address, p_endpoint, 1, now())
  ON CONFLICT (ip_address, endpoint) 
  DO UPDATE SET 
    request_count = api_rate_limits.request_count + 1,
    created_at = now();
  
  RETURN TRUE;
END;
$$;

-- Função para limpeza automática de rate limits antigos
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  cleanup_count INTEGER;
BEGIN
  -- Limpar registros de rate limit antigos (mais de 1 hora)
  DELETE FROM public.api_rate_limits 
  WHERE created_at < now() - INTERVAL '1 hour';
  
  GET DIAGNOSTICS cleanup_count = ROW_COUNT;
  RETURN cleanup_count;
END;
$$;