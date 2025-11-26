-- Criar configurações de segurança adicionais para OTP e tokens
-- Estas configurações garantem que seguimos as melhores práticas de segurança

-- Criar função para validar tokens com tempo de vida reduzido
CREATE OR REPLACE FUNCTION public.validate_token_expiry(
  p_created_at TIMESTAMP WITH TIME ZONE,
  p_max_age_minutes INTEGER DEFAULT 30
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verifica se o token não expirou baseado no tempo máximo permitido
  RETURN (p_created_at + (p_max_age_minutes || ' minutes')::INTERVAL) > now();
END;
$$;

-- Criar função para limpar tokens expirados
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  cleanup_count INTEGER;
BEGIN
  -- Limpar tentativas de autenticação antigas (mais de 24 horas)
  DELETE FROM public.auth_attempts 
  WHERE created_at < now() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS cleanup_count = ROW_COUNT;
  
  -- Limpar logs de auditoria antigos (mais de 30 dias)
  DELETE FROM public.security_audit_logs 
  WHERE created_at < now() - INTERVAL '30 days';
  
  -- Log da limpeza
  INSERT INTO public.security_audit_logs (
    action, resource_type, details, created_at
  ) VALUES (
    'token_cleanup', 'system',
    jsonb_build_object('records_cleaned', cleanup_count),
    now()
  );
  
  RETURN cleanup_count;
END;
$$;

-- Documentar as configurações de segurança recomendadas
COMMENT ON FUNCTION public.validate_token_expiry IS 'Valida se um token não expirou baseado no tempo máximo recomendado de 30 minutos';
COMMENT ON FUNCTION public.cleanup_expired_tokens IS 'Remove registros de autenticação e auditoria expirados para manter a base limpa';