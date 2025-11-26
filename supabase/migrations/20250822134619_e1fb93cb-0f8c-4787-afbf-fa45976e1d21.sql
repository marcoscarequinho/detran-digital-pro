-- Create or update admin user profile
-- First, insert the admin profile if it doesn't exist
INSERT INTO public.profiles (user_id, email, nome, tipo_usuario)
SELECT 
  auth.users.id,
  'contato@mcdetranrj.com',
  'Administrador MC Detran',
  'admin'::app_role
FROM auth.users 
WHERE auth.users.email = 'contato@mcdetranrj.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
  tipo_usuario = 'admin'::app_role,
  nome = 'Administrador MC Detran',
  updated_at = now();

-- If no user exists in auth.users yet, we'll create a placeholder profile
-- that will be linked when the user signs up
INSERT INTO public.profiles (email, nome, tipo_usuario)
SELECT 'contato@mcdetranrj.com', 'Administrador MC Detran', 'admin'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'contato@mcdetranrj.com'
)
AND NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE email = 'contato@mcdetranrj.com'
);

-- Log the admin creation
INSERT INTO public.security_audit_logs (
  action, resource_type, details, created_at
) VALUES (
  'admin_user_setup', 'user_management',
  jsonb_build_object(
    'email', 'contato@mcdetranrj.com',
    'role', 'admin',
    'created_by', 'system_migration'
  ),
  now()
);