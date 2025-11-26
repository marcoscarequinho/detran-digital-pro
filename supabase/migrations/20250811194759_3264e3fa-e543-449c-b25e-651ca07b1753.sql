-- Função para criar usuário admin facilmente
CREATE OR REPLACE FUNCTION public.create_admin_user(
  admin_email TEXT,
  admin_name TEXT DEFAULT 'Administrador'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_exists BOOLEAN := FALSE;
BEGIN
  -- Verificar se já existe um perfil com este email
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE email = admin_email
  ) INTO user_exists;
  
  IF user_exists THEN
    -- Atualizar para admin se já existe
    UPDATE public.profiles 
    SET tipo_usuario = 'admin'::app_role, nome = admin_name
    WHERE email = admin_email;
    
    RETURN 'Usuário ' || admin_email || ' atualizado para administrador.';
  ELSE
    -- Inserir perfil admin temporário (será linkado quando o usuário fizer login)
    INSERT INTO public.profiles (user_id, email, nome, tipo_usuario)
    VALUES (gen_random_uuid(), admin_email, admin_name, 'admin'::app_role);
    
    RETURN 'Perfil admin criado para ' || admin_email || '. Faça o cadastro no sistema com este email.';
  END IF;
END;
$$;

-- Criar perfil admin padrão
SELECT public.create_admin_user('admin@mcdespachadoria.com.br', 'Administrador Sistema');