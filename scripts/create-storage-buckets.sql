-- Criar bucket para fotos de funcionários se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'fotosfuncionarios',
    'fotosfuncionarios', 
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Criar bucket para fotos de perfil se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES (
  'fotosperfil',
  'fotosperfil',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas para permitir leitura pública das fotos de funcionários
DROP POLICY IF EXISTS "Fotos funcionários são públicas" ON storage.objects;
CREATE POLICY "Fotos funcionários são públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'fotosfuncionarios');

-- Criar políticas para permitir upload de fotos de funcionários
DROP POLICY IF EXISTS "Usuários podem fazer upload de fotos funcionários" ON storage.objects;
CREATE POLICY "Usuários podem fazer upload de fotos funcionários"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'fotosfuncionarios');

-- Criar políticas para permitir atualização de fotos de funcionários
DROP POLICY IF EXISTS "Usuários podem atualizar fotos funcionários" ON storage.objects;
CREATE POLICY "Usuários podem atualizar fotos funcionários"
ON storage.objects FOR UPDATE
USING (bucket_id = 'fotosfuncionarios');

-- Criar políticas para permitir leitura pública das fotos de perfil
DROP POLICY IF EXISTS "Fotos perfil são públicas" ON storage.objects;
CREATE POLICY "Fotos perfil são públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'fotosperfil');

-- Criar políticas para permitir upload de fotos de perfil
DROP POLICY IF EXISTS "Usuários podem fazer upload de fotos perfil" ON storage.objects;
CREATE POLICY "Usuários podem fazer upload de fotos perfil"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'fotosperfil');

-- Criar políticas para permitir atualização de fotos de perfil
DROP POLICY IF EXISTS "Usuários podem atualizar fotos perfil" ON storage.objects;
CREATE POLICY "Usuários podem atualizar fotos perfil"
ON storage.objects FOR UPDATE
USING (bucket_id = 'fotosperfil');

-- Verificar se as políticas foram criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
