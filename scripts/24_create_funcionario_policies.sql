-- Verificar se a tabela funcionario existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'funcionario'
);

-- Verificar políticas existentes na tabela funcionario
SELECT * FROM pg_policies WHERE tablename = 'funcionario';

-- Remover políticas existentes se necessário
DROP POLICY IF EXISTS funcionario_select ON funcionario;
DROP POLICY IF EXISTS funcionario_insert ON funcionario;
DROP POLICY IF EXISTS funcionario_update ON funcionario;
DROP POLICY IF EXISTS funcionario_delete ON funcionario;

-- Criar novas políticas para a tabela funcionario
CREATE POLICY funcionario_select ON funcionario FOR SELECT USING (true);

CREATE POLICY funcionario_insert ON funcionario FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' IN ('admin', 'manager')
  ) OR (
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  )
);

CREATE POLICY funcionario_update ON funcionario FOR UPDATE USING (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' IN ('admin', 'manager')
  ) OR (
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  )
);

CREATE POLICY funcionario_delete ON funcionario FOR DELETE USING (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' IN ('admin', 'manager')
  ) OR (
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  )
);

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'funcionario';

-- Habilitar RLS se não estiver habilitado
ALTER TABLE IF EXISTS funcionario ENABLE ROW LEVEL SECURITY;

-- Verificar as políticas criadas
SELECT * FROM pg_policies WHERE tablename = 'funcionario';
