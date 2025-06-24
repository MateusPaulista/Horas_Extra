-- Script para corrigir o bucket fotosperfil
-- Este script garante que o bucket seja público para permitir acesso às fotos de perfil

-- Verificar se o bucket existe e seu status atual
SELECT 
    id,
    name,
    public,
    created_at,
    updated_at
FROM storage.buckets 
WHERE id = 'fotosperfil';

-- Atualizar o bucket para ser público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'fotosperfil';

-- Criar o bucket se não existir (público)
INSERT INTO storage.buckets (id, name, public)
VALUES (
  'fotosperfil',
  'fotosperfil',
  true
)
ON CONFLICT (id) DO UPDATE SET
  public = true;

-- Verificar políticas existentes para o bucket fotosperfil
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
WHERE tablename = 'objects' 
AND policyname LIKE '%fotosperfil%' 
OR policyname LIKE '%perfil%';

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Fotos perfil são públicas" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem fazer upload de fotos perfil" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar fotos perfil" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar fotos perfil" ON storage.objects;

-- Criar política para leitura pública das fotos de perfil
CREATE POLICY "Fotos perfil são públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'fotosperfil');

-- Criar política para upload de fotos de perfil (usuários autenticados)
CREATE POLICY "Usuários podem fazer upload de fotos perfil"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'fotosperfil' 
  AND auth.role() = 'authenticated'
);

-- Criar política para atualização de fotos de perfil (usuários autenticados)
CREATE POLICY "Usuários podem atualizar fotos perfil"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'fotosperfil' 
  AND auth.role() = 'authenticated'
);

-- Criar política para deletar fotos de perfil (usuários autenticados)
CREATE POLICY "Usuários podem deletar fotos perfil"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'fotosperfil' 
  AND auth.role() = 'authenticated'
);

-- Verificar o resultado final
SELECT 
    'Bucket Status' as tipo,
    id,
    name,
    public,
    created_at
FROM storage.buckets 
WHERE id = 'fotosperfil'

UNION ALL

SELECT 
    'Políticas' as tipo,
    policyname as id,
    cmd as name,
    permissive::text as public,
    NULL as created_at
FROM pg_policies 
WHERE tablename = 'objects' 
AND (policyname LIKE '%fotosperfil%' OR policyname LIKE '%perfil%')
ORDER BY tipo, id;

-- Listar arquivos no bucket (se houver)
SELECT 
    name,
    metadata,
    created_at,
    updated_at
FROM storage.objects 
WHERE bucket_id = 'fotosperfil'
ORDER BY created_at DESC
LIMIT 10;