-- Script para criar bucket de fotos de parceiros no Supabase Storage
-- Este script cria o bucket 'fotosparceiros' com as políticas necessárias

-- Criar bucket para fotos de parceiros se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'fotosparceiros',
    'fotosparceiros',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Criar políticas para permitir leitura pública das fotos de parceiros
DROP POLICY IF EXISTS "Fotos parceiros são públicas" ON storage.objects;
CREATE POLICY "Fotos parceiros são públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'fotosparceiros');

-- Criar políticas para permitir upload de fotos de parceiros
DROP POLICY IF EXISTS "Usuários podem fazer upload de fotos parceiros" ON storage.objects;
CREATE POLICY "Usuários podem fazer upload de fotos parceiros"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'fotosparceiros');

-- Criar políticas para permitir atualização de fotos de parceiros
DROP POLICY IF EXISTS "Usuários podem atualizar fotos parceiros" ON storage.objects;
CREATE POLICY "Usuários podem atualizar fotos parceiros"
ON storage.objects FOR UPDATE
USING (bucket_id = 'fotosparceiros');

-- Criar políticas para permitir exclusão de fotos de parceiros
DROP POLICY IF EXISTS "Usuários podem excluir fotos parceiros" ON storage.objects;
CREATE POLICY "Usuários podem excluir fotos parceiros"
ON storage.objects FOR DELETE
USING (bucket_id = 'fotosparceiros');

-- Verificar se o bucket foi criado com sucesso
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at,
    updated_at
FROM storage.buckets 
WHERE id = 'fotosparceiros';

-- Verificar se as políticas foram criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%parceiros%'
ORDER BY policyname;

-- Verificar arquivos no bucket fotosparceiros (inicialmente vazio)
SELECT 
    name,
    id,
    updated_at,
    created_at,
    last_accessed_at,
    metadata
FROM storage.objects 
WHERE bucket_id = 'fotosparceiros'
ORDER BY created_at DESC
LIMIT 10;

COMMIT;