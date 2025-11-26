-- Configurar JWT Settings para resolver o aviso de segurança OTP
-- Reduzir tempo de expiração do JWT para 30 minutos (1800 segundos)

-- Configurar o tempo de expiração do JWT
ALTER DATABASE postgres SET app.settings.jwt_exp = '1800';

-- Verificar a configuração aplicada
SELECT current_setting('app.settings.jwt_exp') as jwt_expiry_seconds;