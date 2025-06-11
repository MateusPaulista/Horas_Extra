-- Verificar se a tabela turno existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'turno'
);

-- Verificar políticas existentes na tabela turno
SELECT * FROM pg_policies WHERE tablename = 'turno';

-- Remover políticas existentes se necessário
DROP POLICY IF EXISTS turno_select ON turno;
DROP POLICY IF EXISTS turno_insert ON turno;
DROP POLICY IF EXISTS turno_update ON turno;
DROP POLICY IF EXISTS turno_delete ON turno;

-- Criar novas políticas para a tabela turno
CREATE POLICY turno_select ON turno FOR SELECT USING (true);

CREATE POLICY turno_insert ON turno FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' IN ('admin', 'manager')
  ) OR (
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  )
);

CREATE POLICY turno_update ON turno FOR UPDATE USING (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' IN ('admin', 'manager')
  ) OR (
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  )
);

CREATE POLICY turno_delete ON turno FOR DELETE USING (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' IN ('admin', 'manager')
  ) OR (
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  )
);

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'turno';

-- Habilitar RLS se não estiver habilitado
ALTER TABLE IF EXISTS turno ENABLE ROW LEVEL SECURITY;

-- Verificar as políticas criadas
SELECT * FROM pg_policies WHERE tablename = 'turno';
