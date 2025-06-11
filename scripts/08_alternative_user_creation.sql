-- Método alternativo para criar usuário usando as funções nativas do Supabase
-- Execute este script se o anterior não funcionar

-- Primeiro, vamos verificar a estrutura da tabela auth.identities
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'identities'
ORDER BY ordinal_position;

-- Método alternativo: Usar a função auth.uid() e inserir diretamente
DO $$
DECLARE
  new_user_id UUID := uuid_generate_v4();
  hashed_password TEXT;
BEGIN
  -- Gerar hash da senha
  hashed_password := crypt('123456', gen_salt('bf'));

  -- Inserir usuário diretamente
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'mateushp@suporterei.com.br',
    hashed_password,
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "admin", "name": "Administrador Sistema"}',
    false,
    '',
    '',
    '',
    ''
  );

  -- Inserir identity com todos os campos necessários
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at,
    email
  ) VALUES (
    uuid_generate_v4(),
    new_user_id,
    'mateushp@suporterei.com.br', -- provider_id é o email para provider 'email'
    jsonb_build_object(
      'sub', new_user_id::text,
      'email', 'mateushp@suporterei.com.br',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    NOW(),
    NOW(),
    NOW(),
    'mateushp@suporterei.com.br'
  );

  RAISE NOTICE 'Usuário criado com sucesso! ID: %', new_user_id;
  RAISE NOTICE 'Email: mateushp@suporterei.com.br';
  RAISE NOTICE 'Senha: 123456';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao criar usuário: %', SQLERRM;
    RAISE NOTICE 'Detalhes do erro: %', SQLSTATE;
END $$;
