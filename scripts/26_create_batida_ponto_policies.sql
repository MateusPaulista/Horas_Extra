-- Verificar se a tabela batida_ponto existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'batida_ponto'
);

-- Verificar políticas existentes na tabela batida_ponto
SELECT * FROM pg_policies WHERE tablename = 'batida_ponto';

-- Remover políticas existentes se necessário
DROP POLICY IF EXISTS batida_ponto_select ON batida_ponto;
DROP POLICY IF EXISTS batida_ponto_insert ON batida_ponto;
DROP POLICY IF EXISTS batida_ponto_update ON batida_ponto;
DROP POLICY IF EXISTS batida_ponto_delete ON batida_ponto;

-- Criar novas políticas para a tabela batida_ponto
CREATE POLICY batida_ponto_select ON batida_ponto FOR SELECT USING (true);

CREATE POLICY batida_ponto_insert ON batida_ponto FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' IN ('admin', 'manager', 'user')
  ) OR (
    auth.jwt() ->> 'role' IN ('admin', 'manager', 'user')
  )
);

CREATE POLICY batida_ponto_update ON batida_ponto FOR UPDATE USING (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' IN ('admin', 'manager')
  ) OR (
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  )
);

CREATE POLICY batida_ponto_delete ON batida_ponto FOR DELETE USING (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' IN ('admin', 'manager')
  ) OR (
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  )
);

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'batida_ponto';

-- Habilitar RLS se não estiver habilitado
ALTER TABLE IF EXISTS batida_ponto ENABLE ROW LEVEL SECURITY;

-- Verificar as políticas criadas
SELECT * FROM pg_policies WHERE tablename = 'batida_ponto';
