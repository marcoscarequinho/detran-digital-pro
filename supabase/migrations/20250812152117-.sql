-- Configurar tempo de expiração de OTP para o valor recomendado de segurança
-- Reduzir o tempo de expiração do JWT para 30 minutos (1800 segundos)

-- Verificar configurações atuais
SELECT 
  name,
  setting,
  short_desc
FROM pg_settings 
WHERE name LIKE '%jwt%' OR name LIKE '%otp%' OR name LIKE '%auth%';