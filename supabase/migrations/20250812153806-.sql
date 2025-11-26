-- Implementar criptografia e proteção de dados para campos sensíveis
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
      'mc_despachante_2024_' || current_setting('app.settings.jwt_secret', true)
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
      'mc_despachante_2024_' || current_setting('app.settings.jwt_secret', true)
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

-- Criar view segura para acesso aos dados com descriptografia automática
CREATE OR REPLACE VIEW public.clientes_secure AS
SELECT 
  id,
  cpf,
  public.decrypt_pii(nome_encrypted) as nome,
  email,
  public.decrypt_pii(telefone_encrypted) as telefone,
  public.decrypt_pii(endereco_encrypted) as endereco,
  placa_veiculo,
  email_verified,
  account_status,
  login_attempts,
  locked_until,
  last_login_at,
  created_at,
  updated_at
FROM public.clientes;

-- Política RLS para a view segura
ALTER VIEW public.clientes_secure SET ROW SECURITY ENABLED;

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

-- Trigger para log automático de acessos
CREATE OR REPLACE FUNCTION public.trigger_log_cliente_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log apenas para operações de SELECT em dados sensíveis
  IF TG_OP = 'SELECT' THEN
    PERFORM public.log_data_access('clientes', NEW.id, 'data_access');
  END IF;
  RETURN NEW;
END;
$$;