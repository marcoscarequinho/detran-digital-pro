-- Criar perfil de administrador para o usuário
INSERT INTO public.profiles (user_id, email, nome, tipo_usuario)
VALUES (
  'bac5d087-0c0f-4215-9c06-5c26c0ad2916',
  'contato@mcdetranrj.com',
  'Administrador',
  'admin'::app_role
);