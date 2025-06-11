-- Remover políticas existentes da tabela empresa
DROP POLICY IF EXISTS empresa_select ON empresa;
DROP POLICY IF EXISTS empresa_insert ON empresa;
DROP POLICY IF EXISTS empresa_update ON empresa;
DROP POLICY IF EXISTS empresa_delete ON empresa;

-- Criar políticas mais flexíveis para empresa
-- Permitir SELECT para todos os usuários autenticados
CREATE POLICY empresa_select ON empresa FOR SELECT USING (auth.uid() IS NOT NULL);

-- Permitir INSERT para usuários autenticados com role admin ou manager
CREATE POLICY empresa_insert ON empresa FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    (
        (auth.jwt()->>'role') IN ('admin', 'manager') OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND (raw_user_meta_data->>'role') IN ('admin', 'manager')
        )
    )
);

-- Permitir UPDATE para usuários autenticados com role admin ou manager
CREATE POLICY empresa_update ON empresa FOR UPDATE USING (
    auth.uid() IS NOT NULL AND 
    (
        (auth.jwt()->>'role') IN ('admin', 'manager') OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND (raw_user_meta_data->>'role') IN ('admin', 'manager')
        )
    )
);

-- Permitir DELETE apenas para admins
CREATE POLICY empresa_delete ON empresa FOR DELETE USING (
    auth.uid() IS NOT NULL AND 
    (
        (auth.jwt()->>'role') = 'admin' OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND (raw_user_meta_data->>'role') = 'admin'
        )
    )
);

-- Verificar as novas políticas
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'empresa';
