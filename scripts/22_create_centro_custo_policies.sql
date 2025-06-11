-- Verificar se a tabela centro_custo existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'centro_custo'
);

-- Verificar políticas existentes na tabela centro_custo
SELECT * FROM pg_policies WHERE tablename = 'centro_custo';

-- Remover políticas existentes se necessário
DROP POLICY IF EXISTS centro_custo_select ON centro_custo;
DROP POLICY IF EXISTS centro_custo_insert ON centro_custo;
DROP POLICY IF EXISTS centro_custo_update ON centro_custo;
DROP POLICY IF EXISTS centro_custo_delete ON centro_custo;

-- Criar novas políticas para a tabela centro_custo
CREATE POLICY centro_custo_select ON centro_custo FOR SELECT USING (true);

CREATE POLICY centro_custo_insert ON centro_custo FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' IN ('admin', 'manager')
  ) OR (
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  )
);

CREATE POLICY centro_custo_update ON centro_custo FOR UPDATE USING (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' IN ('admin', 'manager')
  ) OR (
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  )
);

CREATE POLICY centro_custo_delete ON centro_custo FOR DELETE USING (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' IN ('admin', 'manager')
  ) OR (
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  )
);

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'centro_custo';

-- Habilitar RLS se não estiver habilitado
ALTER TABLE IF EXISTS centro_custo ENABLE ROW LEVEL SECURITY;

-- Verificar as políticas criadas
SELECT * FROM pg_policies WHERE tablename = 'centro_custo';
