-- Inserir perfil de administrador diretamente
INSERT INTO public.profiles (user_id, email, nome, tipo_usuario, created_at, updated_at)
VALUES (
  'bac5d087-0c0f-4215-9c06-5c26c0ad2916'::uuid,
  'contato@mcdetranrj.com',
  'Administrador',
  'admin'::app_role,
  now(),
  now()
) ON CONFLICT (user_id) DO UPDATE SET
  tipo_usuario = 'admin'::app_role,
  updated_at = now();