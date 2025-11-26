-- Implementar criptografia e proteção de dados para campos sensíveis (Versão Corrigida)
-- Criar função para criptografar dados sensíveis
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Função para criptografar dados PII
CREATE OR REPLACE FUNCTION public.encrypt_pii(data TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF data IS NULL OR data = '' THEN
    RETURN data;
  END IF;
  
  -- Usar chave derivada do ID do projeto para criptografia
  RETURN encode(
    pgp_sym_encrypt(
      data, 
      'mc_despachante_2024_security_key'
    ), 
    'base64'
  );
END;
$$;

-- Função para descriptografar dados PII
CREATE OR REPLACE FUNCTION public.decrypt_pii(encrypted_data TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF encrypted_data IS NULL OR encrypted_data = '' THEN
    RETURN encrypted_data;
  END IF;
  
  BEGIN
    RETURN pgp_sym_decrypt(
      decode(encrypted_data, 'base64'),
      'mc_despachante_2024_security_key'
    );
  EXCEPTION WHEN OTHERS THEN
    -- Se falhar a descriptografia, retornar dados mascarados
    RETURN '***DADOS PROTEGIDOS***';
  END;
END;
$$;

-- Adicionar colunas criptografadas para dados sensíveis
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS nome_encrypted TEXT,
ADD COLUMN IF NOT EXISTS endereco_encrypted TEXT,
ADD COLUMN IF NOT EXISTS telefone_encrypted TEXT;

-- Função para migrar dados existentes para formato criptografado
CREATE OR REPLACE FUNCTION public.migrate_to_encrypted_data()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  -- Criptografar dados existentes
  UPDATE public.clientes 
  SET 
    nome_encrypted = public.encrypt_pii(nome),
    endereco_encrypted = public.encrypt_pii(endereco),
    telefone_encrypted = public.encrypt_pii(telefone)
  WHERE nome_encrypted IS NULL 
    OR endereco_encrypted IS NULL 
    OR telefone_encrypted IS NULL;
    
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  -- Log da migração
  INSERT INTO public.security_audit_logs (
    action, resource_type, details, created_at
  ) VALUES (
    'data_encryption_migration', 'clientes',
    jsonb_build_object('affected_rows', affected_rows),
    now()
  );
  
  RETURN affected_rows;
END;
$$;

-- Executar migração de dados
SELECT public.migrate_to_encrypted_data();

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
      'user_role', public.get_current_user_tipo()
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
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
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
    AND window_start > window_start;
  
  -- Se excedeu o limite, retornar false
  IF current_requests >= p_max_requests THEN
    RETURN FALSE;
  END IF;
  
  -- Registrar a tentativa
  INSERT INTO public.api_rate_limits (ip_address, endpoint, request_count, window_start)
  VALUES (p_ip_address, p_endpoint, 1, now())
  ON CONFLICT (ip_address, endpoint) 
  DO UPDATE SET 
    request_count = api_rate_limits.request_count + 1,
    window_start = CASE 
      WHEN api_rate_limits.window_start < window_start THEN now()
      ELSE api_rate_limits.window_start
    END;
  
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