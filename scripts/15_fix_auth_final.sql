-- Script final para corrigir autenticação e criar usuário válido

-- 1. Limpar usuários existentes problemáticos
DELETE FROM auth.identities WHERE email = 'mateushp@suporterei.com.br';
DELETE FROM auth.users WHERE email = 'mateushp@suporterei.com.br';

-- 2. Verificar e corrigir configurações de autenticação
-- Desabilitar confirmação de email para desenvolvimento
UPDATE auth.config 
SET setting_value = 'false' 
WHERE setting_name = 'DISABLE_SIGNUP';

-- 3. Criar usuário administrador com método mais robusto
DO $$
DECLARE
  new_user_id UUID := uuid_generate_v4();
  hashed_password TEXT;
BEGIN
  -- Gerar hash da senha usando o método correto
  SELECT crypt('admin123', gen_salt('bf')) INTO hashed_password;

  -- Inserir usuário com todos os campos necessários
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    phone_confirmed_at,
    confirmation_sent_at,
    recovery_sent_at,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_change,
    email_change,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at,
    confirmation_token,
    recovery_token,
    email_change_token_new
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@clockflow.com',
    hashed_password,
    NOW(), -- Email já confirmado
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "admin", "name": "Administrador"}',
    false,
    NOW(),
    NOW(),
    NULL,
    '',
    '',
    '',
    0,
    NULL,
    '',
    NULL,
    false,
    NULL,
    '',
    '',
    ''
  );

  -- Inserir identity correspondente
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at,
    email,
    provider_id
  ) VALUES (
    uuid_generate_v4(),
    new_user_id,
    jsonb_build_object(
      'sub', new_user_id::text,
      'email', 'admin@clockflow.com',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    NULL,
    NOW(),
    NOW(),
    'admin@clockflow.com',
    'admin@clockflow.com'
  );

  -- Inserir parâmetros para o usuário admin
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

  RAISE NOTICE 'Usuário administrador criado com sucesso!';
  RAISE NOTICE 'Email: admin@clockflow.com';
  RAISE NOTICE 'Senha: admin123';
  RAISE NOTICE 'ID: %', new_user_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao criar usuário: %', SQLERRM;
    RAISE NOTICE 'Código do erro: %', SQLSTATE;
END $$;

-- 4. Verificar se foi criado corretamente
SELECT 
  'Verificação do usuário criado' as status,
  u.id,
  u.email,
  u.encrypted_password IS NOT NULL as has_password,
  u.email_confirmed_at IS NOT NULL as email_confirmed,
  u.raw_user_meta_data,
  i.provider,
  i.provider_id
FROM auth.users u
LEFT JOIN auth.identities i ON u.id = i.user_id
WHERE u.email = 'admin@clockflow.com';

-- 5. Verificar configurações de auth
SELECT 
  'Configurações de autenticação' as status,
  setting_name,
  setting_value
FROM auth.config
WHERE setting_name IN ('DISABLE_SIGNUP', 'SITE_URL', 'JWT_EXP');
