-- Verificar buckets de storage existentes
SELECT 
    name,
    id,
    public,
    created_at,
    updated_at
FROM storage.buckets
ORDER BY name;

-- Verificar políticas RLS dos buckets
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
WHERE schemaname = 'storage'
ORDER BY tablename, policyname;

-- Verificar arquivos no bucket fotosfuncionarios
SELECT 
    name,
    bucket_id,
    owner,
    created_at,
    updated_at,
    last_accessed_at,
    metadata
FROM storage.objects 
WHERE bucket_id = 'fotosfuncionarios'
ORDER BY created_at DESC
LIMIT 10;

-- Verificar arquivos no bucket fotosperfil
SELECT 
    name,
    bucket_id,
    owner,
    created_at,
    updated_at,
    last_accessed_at,
    metadata
FROM storage.objects 
WHERE bucket_id = 'fotosperfil'
ORDER BY created_at DESC
LIMIT 10;
