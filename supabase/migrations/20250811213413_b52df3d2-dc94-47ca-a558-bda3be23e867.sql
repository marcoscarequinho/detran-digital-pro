-- Criar conta de administrador diretamente no banco para teste
-- Primeiro vamos inserir na tabela profiles
INSERT INTO public.profiles (user_id, email, nome, tipo_usuario)
VALUES (
  gen_random_uuid(),
  'contato@mcdetranji.com',
  'Administrador MC',
  'admin'::app_role
);