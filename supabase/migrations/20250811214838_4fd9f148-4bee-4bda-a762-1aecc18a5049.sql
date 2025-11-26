-- Configurar OTP para um tempo mais seguro (10 minutos)
UPDATE auth.config 
SET 
  otp_exp = 600,  -- 10 minutos em segundos
  password_min_length = 6
WHERE TRUE;