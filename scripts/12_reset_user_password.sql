-- Script para resetar a senha do usuário específico
-- Execute este script se ainda houver problemas de login

DO $$
DECLARE
  user_exists BOOLEAN;
  user_id_found UUID;
BEGIN
  -- Verificar se o usuário existe
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE email = 'mateushp@suporterei.com.br'
  ) INTO user_exists;
  
  IF user_exists THEN
    -- Buscar o ID do usuário
    SELECT id INTO user_id_found 
    FROM auth.users 
    WHERE email = 'mateushp@suporterei.com.br';
    
    -- Atualizar senha
    UPDATE auth.users 
    SET 
      encrypted_password = crypt('123456', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      updated_at = NOW(),
      raw_user_meta_data = COALESCE(
        raw_user_meta_data, 
        '{"role": "admin", "name": "Administrador Sistema"}'::jsonb
      )
    WHERE email = 'mateushp@suporterei.com.br';
    
    -- Verificar/criar identity se não existir
    INSERT INTO auth.identities (
      user_id,
      provider_id,
      identity_data,
      provider,
      created_at,
      updated_at,
      email
    ) VALUES (
      user_id_found,
      'mateushp@suporterei.com.br',
      jsonb_build_object(
        'sub', user_id_found::text,
        'email', 'mateushp@suporterei.com.br',
        'email_verified', true
      ),
      'email',
      NOW(),
      NOW(),
      'mateushp@suporterei.com.br'
    )
    ON CONFLICT (provider, provider_id) DO UPDATE SET
      updated_at = NOW(),
      email = EXCLUDED.email;
    
    RAISE NOTICE 'Usuário atualizado com sucesso!';
    RAISE NOTICE 'Email: mateushp@suporterei.com.br';
    RAISE NOTICE 'Nova senha: 123456';
    RAISE NOTICE 'ID: %', user_id_found;
  ELSE
    RAISE NOTICE 'Usuário não encontrado com email: mateushp@suporterei.com.br';
  END IF;
END $$;
