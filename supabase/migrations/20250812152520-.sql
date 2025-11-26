-- Tentar configuração alternativa para JWT através de configurações auth
-- Como não podemos alterar app.settings.jwt_exp diretamente, 
-- vamos criar configurações que implementem melhores práticas de segurança

-- Criar configuração personalizada para validação de token
CREATE OR REPLACE FUNCTION public.get_jwt_expiry_recommendation()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 'JWT expiry should be set to 1800 seconds (30 minutes) in Supabase Dashboard Settings > Auth for optimal security. Current database setting: ' || current_setting('app.settings.jwt_exp', true);
$$;

-- Verificar configurações atuais do sistema
SELECT 
  'Current JWT setting' as config_type,
  current_setting('app.settings.jwt_exp', true) as current_value,
  '1800 seconds (30 min)' as recommended_value,
  'Settings > Auth in Supabase Dashboard' as where_to_change;

-- Função para verificar se estamos usando configurações seguras
CREATE OR REPLACE FUNCTION public.check_security_compliance()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  recommendation TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'JWT Expiry'::TEXT,
    CASE 
      WHEN current_setting('app.settings.jwt_exp', true)::INTEGER <= 1800 
      THEN '✅ COMPLIANT'::TEXT
      ELSE '⚠️ NEEDS CONFIGURATION'::TEXT
    END,
    'Set JWT expiry to 1800 seconds in Dashboard'::TEXT;
END;
$$;