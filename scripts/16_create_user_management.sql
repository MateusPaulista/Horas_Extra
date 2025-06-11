-- Script para criar sistema de gerenciamento de usuários

-- Função para criar novos usuários (apenas admins podem executar)
CREATE OR REPLACE FUNCTION create_user(
  user_email TEXT,
  user_password TEXT,
  user_name TEXT DEFAULT NULL,
  user_role TEXT DEFAULT 'user'
)
RETURNS JSON AS $$
DECLARE
  new_user_id UUID := uuid_generate_v4();
  hashed_password TEXT;
  result JSON;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT is_admin() THEN
    RETURN json_build_object('success', false, 'error', 'Acesso negado. Apenas administradores podem criar usuários.');
  END IF;

  -- Verificar se o email já existe
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    RETURN json_build_object('success', false, 'error', 'Email já está em uso.');
  END IF;

  -- Gerar hash da senha
  SELECT crypt(user_password, gen_salt('bf')) INTO hashed_password;

  -- Inserir usuário
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    user_email,
    hashed_password,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    json_build_object('role', user_role, 'name', COALESCE(user_name, split_part(user_email, '@', 1))),
    NOW(),
    NOW()
  );

  -- Inserir identity
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    created_at,
    updated_at,
    email,
    provider_id
  ) VALUES (
    uuid_generate_v4(),
    new_user_id,
    json_build_object(
      'sub', new_user_id::text,
      'email', user_email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    NOW(),
    NOW(),
    user_email,
    user_email
  );

  -- Criar parâmetros padrão para o usuário
  INSERT INTO parametrizador (
    id_user, 
    limite_extra_dia, 
    limite_falta, 
    limite_extra_mes, 
    limite_atras_dia, 
    status,
    push_ativo
  ) VALUES (
    new_user_id,
    2.0,
    8.0,
    40.0,
    0.5,
    TRUE,
    FALSE
  );

  result := json_build_object(
    'success', true,
    'user_id', new_user_id,
    'email', user_email,
    'message', 'Usuário criado com sucesso'
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para listar usuários (apenas admins)
CREATE OR REPLACE FUNCTION list_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  role TEXT,
  email_confirmed BOOLEAN,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem listar usuários.';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) as name,
    COALESCE(u.raw_user_meta_data->>'role', 'user') as role,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    u.created_at,
    u.last_sign_in_at
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar usuário
CREATE OR REPLACE FUNCTION update_user(
  user_id UUID,
  new_email TEXT DEFAULT NULL,
  new_name TEXT DEFAULT NULL,
  new_role TEXT DEFAULT NULL,
  new_password TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  hashed_password TEXT;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT is_admin() THEN
    RETURN json_build_object('success', false, 'error', 'Acesso negado. Apenas administradores podem atualizar usuários.');
  END IF;

  -- Verificar se o usuário existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Usuário não encontrado.');
  END IF;

  -- Atualizar email se fornecido
  IF new_email IS NOT NULL THEN
    -- Verificar se o novo email já está em uso
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = new_email AND id != user_id) THEN
      RETURN json_build_object('success', false, 'error', 'Email já está em uso por outro usuário.');
    END IF;
    
    UPDATE auth.users SET email = new_email WHERE id = user_id;
    UPDATE auth.identities SET email = new_email, provider_id = new_email WHERE user_id = user_id;
  END IF;

  -- Atualizar senha se fornecida
  IF new_password IS NOT NULL THEN
    SELECT crypt(new_password, gen_salt('bf')) INTO hashed_password;
    UPDATE auth.users SET encrypted_password = hashed_password WHERE id = user_id;
  END IF;

  -- Atualizar metadados
  UPDATE auth.users 
  SET 
    raw_user_meta_data = raw_user_meta_data || 
      CASE 
        WHEN new_name IS NOT NULL OR new_role IS NOT NULL THEN
          json_build_object(
            'name', COALESCE(new_name, raw_user_meta_data->>'name'),
            'role', COALESCE(new_role, raw_user_meta_data->>'role')
          )
        ELSE '{}'::json
      END,
    updated_at = NOW()
  WHERE id = user_id;

  result := json_build_object(
    'success', true,
    'message', 'Usuário atualizado com sucesso'
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para deletar usuário
CREATE OR REPLACE FUNCTION delete_user(user_id UUID)
RETURNS JSON AS $$
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT is_admin() THEN
    RETURN json_build_object('success', false, 'error', 'Acesso negado. Apenas administradores podem deletar usuários.');
  END IF;

  -- Verificar se o usuário existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Usuário não encontrado.');
  END IF;

  -- Não permitir que o admin delete a si mesmo
  IF user_id = auth.uid() THEN
    RETURN json_build_object('success', false, 'error', 'Você não pode deletar sua própria conta.');
  END IF;

  -- Deletar usuário (as identities serão deletadas em cascata)
  DELETE FROM auth.users WHERE id = user_id;

  RETURN json_build_object('success', true, 'message', 'Usuário deletado com sucesso');

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissões para usuários autenticados executarem as funções
GRANT EXECUTE ON FUNCTION create_user(TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION update_user(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user(UUID) TO authenticated;
