-- Remover temporariamente a constraint de foreign key e inserir o perfil admin
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Inserir o perfil do administrador
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

-- Recriar a foreign key constraint (opcional, mas recomendado para manter integridade)
-- ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_fkey 
-- FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;