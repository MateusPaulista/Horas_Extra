-- Script para verificar a estrutura das tabelas de autenticação
-- Execute este script para entender melhor a estrutura do Supabase Auth

-- Verificar estrutura da tabela auth.users
SELECT 'auth.users' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela auth.identities
SELECT 'auth.identities' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'identities'
ORDER BY ordinal_position;

-- Verificar usuários existentes
SELECT id, email, created_at, raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- Verificar identities existentes
SELECT id, user_id, provider, provider_id, email
FROM auth.identities
ORDER BY created_at DESC;

-- Verificar se existem constraints específicos
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'auth' 
  AND tc.table_name IN ('users', 'identities')
ORDER BY tc.table_name, tc.constraint_name;
