-- Método mais simples para criar usuário - usando apenas o essencial
-- Este método evita problemas com campos opcionais

DO $$
DECLARE
  new_user_id UUID := uuid_generate_v4();
BEGIN
  -- Inserir usuário com campos mínimos necessários
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
    raw_user_meta_data
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'mateushp@suporterei.com.br',
    crypt('123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "admin", "name": "Administrador Sistema"}'
  );

  -- Inserir identity com campos mínimos
  INSERT INTO auth.identities (
    user_id,
    provider_id,
    identity_data,
    provider,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    'mateushp@suporterei.com.br',
    format('{"sub":"%s","email":"%s"}', new_user_id, 'mateushp@suporterei.com.br')::jsonb,
    'email',
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Usuário criado com sucesso!';
  RAISE NOTICE 'Email: mateushp@suporterei.com.br';
  RAISE NOTICE 'Senha: 123456';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro: %', SQLERRM;
END $$;
