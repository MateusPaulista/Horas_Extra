-- Configuração de políticas de segurança RLS (Row Level Security)

-- Habilitar RLS nas tabelas
ALTER TABLE empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE turno ENABLE ROW LEVEL SECURITY;
ALTER TABLE centro_custo ENABLE ROW LEVEL SECURITY;
ALTER TABLE parametrizador ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcionario ENABLE ROW LEVEL SECURITY;
ALTER TABLE ponto ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE planejamento ENABLE ROW LEVEL SECURITY;

-- Políticas para empresa
CREATE POLICY empresa_select ON empresa FOR SELECT USING (true);
CREATE POLICY empresa_insert ON empresa FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));
CREATE POLICY empresa_update ON empresa FOR UPDATE USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));
CREATE POLICY empresa_delete ON empresa FOR DELETE USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Políticas para turno
CREATE POLICY turno_select ON turno FOR SELECT USING (true);
CREATE POLICY turno_insert ON turno FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'manager')));
CREATE POLICY turno_update ON turno FOR UPDATE USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'manager')));
CREATE POLICY turno_delete ON turno FOR DELETE USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Políticas para centro_custo
CREATE POLICY centro_custo_select ON centro_custo FOR SELECT USING (true);
CREATE POLICY centro_custo_insert ON centro_custo FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'manager')));
CREATE POLICY centro_custo_update ON centro_custo FOR UPDATE USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'manager')));
CREATE POLICY centro_custo_delete ON centro_custo FOR DELETE USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Políticas para parametrizador
CREATE POLICY parametrizador_select ON parametrizador FOR SELECT USING (true);
CREATE POLICY parametrizador_insert ON parametrizador FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));
CREATE POLICY parametrizador_update ON parametrizador FOR UPDATE USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));
CREATE POLICY parametrizador_delete ON parametrizador FOR DELETE USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Políticas para funcionario
CREATE POLICY funcionario_select ON funcionario FOR SELECT USING (true);
CREATE POLICY funcionario_insert ON funcionario FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'manager')));
CREATE POLICY funcionario_update ON funcionario FOR UPDATE USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'manager')));
CREATE POLICY funcionario_delete ON funcionario FOR DELETE USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Políticas para ponto
CREATE POLICY ponto_select ON ponto FOR SELECT USING (true);
CREATE POLICY ponto_insert ON ponto FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY ponto_update ON ponto FOR UPDATE USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'manager')));
CREATE POLICY ponto_delete ON ponto FOR DELETE USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Políticas para notificacoes
CREATE POLICY notificacoes_select ON notificacoes FOR SELECT USING (auth.uid() = id_user);
CREATE POLICY notificacoes_insert ON notificacoes FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'system')));
CREATE POLICY notificacoes_update ON notificacoes FOR UPDATE USING (auth.uid() = id_user);
CREATE POLICY notificacoes_delete ON notificacoes FOR DELETE USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Políticas para planejamento
CREATE POLICY planejamento_select ON planejamento FOR SELECT USING (true);
CREATE POLICY planejamento_insert ON planejamento FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'manager')));
CREATE POLICY planejamento_update ON planejamento FOR UPDATE USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'manager')));
CREATE POLICY planejamento_delete ON planejamento FOR DELETE USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));
