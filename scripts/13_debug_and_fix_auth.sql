-- Script completo para diagnosticar e corrigir problemas de autenticação

-- 1. Verificar configuração de autenticação do Supabase
SELECT 
  'Verificando configuração de auth' as step,
  setting_name,
  setting_value
FROM auth.config
WHERE setting_name IN ('SITE_URL', 'JWT_SECRET', 'JWT_EXP');

-- 2. Verificar se o usuário existe e suas informações
SELECT 
  'Usuário existente' as step,
  id,
  email,
  encrypted_password IS NOT NULL as has_password,
  email_confirmed_at IS NOT NULL as email_confirmed,
  raw_user_meta_data,
  created_at,
  updated_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'mateushp@suporterei.com.br';

-- 3. Verificar identities
SELECT 
  'Identity do usuário' as step,
  id,
  user_id,
  provider,
  provider_id,
  email,
  created_at
FROM auth.identities
WHERE email = 'mateushp@suporterei.com.br';

-- 4. Deletar usuário existente se houver problemas
DELETE FROM auth.identities WHERE email = 'mateushp@suporterei.com.br';
DELETE FROM auth.users WHERE email = 'mateushp@suporterei.com.br';

-- 5. Criar usuário completamente novo com método mais simples
DO $$
DECLARE
  new_user_id UUID := uuid_generate_v4();
  new_identity_id UUID := uuid_generate_v4();
BEGIN
  -- Inserir usuário
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
    deleted_at
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'mateushp@suporterei.com.br',
    crypt('123456', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    NULL,
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "admin", "name": "Administrador Sistema"}',
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
    NULL
  );

  -- Inserir identity
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
    new_identity_id,
    new_user_id,
    format('{"sub":"%s","email":"%s","email_verified":true,"phone_verified":false}', new_user_id, 'mateushp@suporterei.com.br')::jsonb,
    'email',
    NULL,
    NOW(),
    NOW(),
    'mateushp@suporterei.com.br',
    'mateushp@suporterei.com.br'
  );

  RAISE NOTICE 'Usuário criado com sucesso!';
  RAISE NOTICE 'ID: %', new_user_id;
  RAISE NOTICE 'Identity ID: %', new_identity_id;
  RAISE NOTICE 'Email: mateushp@suporterei.com.br';
  RAISE NOTICE 'Senha: 123456';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao criar usuário: %', SQLERRM;
END $$;

-- 6. Verificar se foi criado corretamente
SELECT 
  'Verificação final' as step,
  u.id,
  u.email,
  u.encrypted_password IS NOT NULL as has_password,
  u.email_confirmed_at IS NOT NULL as email_confirmed,
  i.provider,
  i.provider_id
FROM auth.users u
LEFT JOIN auth.identities i ON u.id = i.user_id
WHERE u.email = 'mateushp@suporterei.com.br';
