-- Verificar configurações de autenticação do Supabase

-- 1. Verificar se a extensão de autenticação está habilitada
SELECT 
  'Extensões instaladas' as info,
  extname as extension_name,
  extversion as version
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto');

-- 2. Verificar tabelas de auth
SELECT 
  'Tabelas de auth' as info,
  schemaname,
  tablename
FROM pg_tables 
WHERE schemaname = 'auth'
ORDER BY tablename;

-- 3. Verificar se há usuários na tabela auth.users
SELECT 
  'Total de usuários' as info,
  COUNT(*) as total_users
FROM auth.users;

-- 4. Verificar configurações específicas
SELECT 
  'Configurações de auth' as info,
  *
FROM auth.config
WHERE setting_name IN ('SITE_URL', 'JWT_SECRET', 'JWT_EXP', 'DISABLE_SIGNUP');

-- 5. Verificar se RLS está habilitado nas tabelas de auth
SELECT 
  'RLS Status' as info,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'auth'
ORDER BY tablename;
