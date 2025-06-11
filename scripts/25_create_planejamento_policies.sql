-- Verificar se a tabela planejamento existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'planejamento'
);

-- Verificar políticas existentes na tabela planejamento
SELECT * FROM pg_policies WHERE tablename = 'planejamento';

-- Remover políticas existentes se necessário
DROP POLICY IF EXISTS planejamento_select ON planejamento;
DROP POLICY IF EXISTS planejamento_insert ON planejamento;
DROP POLICY IF EXISTS planejamento_update ON planejamento;
DROP POLICY IF EXISTS planejamento_delete ON planejamento;

-- Criar novas políticas para a tabela planejamento
CREATE POLICY planejamento_select ON planejamento FOR SELECT USING (true);

CREATE POLICY planejamento_insert ON planejamento FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' IN ('admin', 'manager')
  ) OR (
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  )
);

CREATE POLICY planejamento_update ON planejamento FOR UPDATE USING (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' IN ('admin', 'manager')
  ) OR (
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  )
);

CREATE POLICY planejamento_delete ON planejamento FOR DELETE USING (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' IN ('admin', 'manager')
  ) OR (
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  )
);

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'planejamento';

-- Habilitar RLS se não estiver habilitado
ALTER TABLE IF EXISTS planejamento ENABLE ROW LEVEL SECURITY;

-- Verificar as políticas criadas
SELECT * FROM pg_policies WHERE tablename = 'planejamento';
