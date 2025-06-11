-- Verificar o usuário atual e suas permissões
SELECT 
    auth.uid() as current_user_id,
    auth.jwt() as current_jwt,
    (auth.jwt()->>'role') as jwt_role,
    u.email,
    u.raw_user_meta_data,
    (u.raw_user_meta_data->>'role') as user_role
FROM auth.users u 
WHERE u.id = auth.uid();

-- Verificar todas as políticas da tabela empresa
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'empresa';

-- Verificar se RLS está habilitado na tabela empresa
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'empresa';
