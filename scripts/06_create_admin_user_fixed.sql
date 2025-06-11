-- Script corrigido para criar um usuário administrador no Supabase
-- Este script resolve o problema do provider_id na tabela auth.identities

-- IMPORTANTE: Substitua o email e senha conforme necessário
DO $$
DECLARE
  new_user_id UUID;
  new_provider_id TEXT;
BEGIN
  -- Gerar um novo UUID para o usuário
  new_user_id := uuid_generate_v4();
  new_provider_id := new_user_id::text;

  -- Inserir o usuário na tabela auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'mateushp@suporterei.com.br', -- Email do administrador
    crypt('123456', gen_salt('bf')), -- Senha: 123456
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"admin","name":"Administrador Sistema"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );

  -- Inserir o usuário na tabela auth.identities com provider_id
  INSERT INTO auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at,
    email
  )
  VALUES (
    new_provider_id, -- provider_id não pode ser nulo
    new_user_id,
    format('{"sub":"%s","email":"%s","email_verified":true,"phone_verified":false}', new_user_id, 'mateushp@suporterei.com.br')::jsonb,
    'email',
    NOW(),
    NOW(),
    NOW(),
    'mateushp@suporterei.com.br'
  );

  -- Configurar parâmetros para o novo usuário admin
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
    2.0,  -- 2 horas extras por dia
    8.0,  -- 8 horas de falta
    40.0, -- 40 horas extras por mês
    0.5,  -- 30 minutos de atraso por dia
    TRUE,
    FALSE
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Usuário administrador criado com sucesso!';
  RAISE NOTICE 'Email: mateushp@suporterei.com.br';
  RAISE NOTICE 'Senha: 123456';
  RAISE NOTICE 'ID do usuário: %', new_user_id;
END $$;
