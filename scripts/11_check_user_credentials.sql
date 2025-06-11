-- Script para verificar e corrigir credenciais do usuário existente
-- Execute este script para diagnosticar problemas de login

-- 1. Verificar usuários existentes
SELECT 
  id,
  email,
  encrypted_password IS NOT NULL as has_password,
  email_confirmed_at IS NOT NULL as email_confirmed,
  raw_user_meta_data,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Verificar identities
SELECT 
  user_id,
  provider,
  provider_id,
  email,
  created_at
FROM auth.identities
ORDER BY created_at DESC;

-- 3. Verificar se o email está confirmado
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'mateushp@suporterei.com.br' 
  AND email_confirmed_at IS NULL;

-- 4. Atualizar metadados do usuário se necessário
UPDATE auth.users 
SET raw_user_meta_data = '{"role": "admin", "name": "Administrador Sistema"}'
WHERE email = 'mateushp@suporterei.com.br';

-- 5. Verificar se a senha está correta (resetar se necessário)
UPDATE auth.users 
SET encrypted_password = crypt('123456', gen_salt('bf'))
WHERE email = 'mateushp@suporterei.com.br';

-- 6. Verificar resultado final
SELECT 
  id,
  email,
  encrypted_password IS NOT NULL as has_password,
  email_confirmed_at IS NOT NULL as email_confirmed,
  raw_user_meta_data,
  created_at,
  updated_at
FROM auth.users
WHERE email = 'mateushp@suporterei.com.br';
