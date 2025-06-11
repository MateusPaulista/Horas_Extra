-- Este script deve ser executado no SQL Editor do Supabase
-- Ele criará um usuário administrador no sistema

-- IMPORTANTE: Substitua 'seu_email@exemplo.com' e 'sua_senha_segura' pelos valores desejados
-- A senha deve ter pelo menos 6 caracteres

-- Criar um usuário administrador
DO $$
DECLARE
  new_user_id UUID;
BEGIN
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
    uuid_generate_v4(),
    'authenticated',
    'authenticated',
    'mateushp@suporterei.com.br', -- Substitua pelo email desejado
    crypt('123456', gen_salt('bf')), -- Substitua pela senha desejada
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
  )
  RETURNING id INTO new_user_id;

  -- Inserir o usuário na tabela auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    new_user_id,
    new_user_id,
    format('{"sub":"%s","email":"%s"}', new_user_id, 'mateushp@suporterei.com.br')::jsonb, -- Substitua pelo email desejado
    'email',
    NOW(),
    NOW(),
    NOW()
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

  RAISE NOTICE 'Usuário administrador criado com sucesso! ID: %', new_user_id;
END $$;
