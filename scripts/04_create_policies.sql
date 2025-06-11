-- Configuração de políticas de segurança RLS (Row Level Security)
-- Execute este script após criar as funções

-- Habilitar RLS nas tabelas
ALTER TABLE empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE turno ENABLE ROW LEVEL SECURITY;
ALTER TABLE centro_custo ENABLE ROW LEVEL SECURITY;
ALTER TABLE parametrizador ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcionario ENABLE ROW LEVEL SECURITY;
ALTER TABLE ponto ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE planejamento ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT raw_user_meta_data->>'role' = 'admin' FROM auth.users WHERE id = auth.uid()),
    FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função auxiliar para verificar se o usuário é manager ou admin
CREATE OR REPLACE FUNCTION is_manager_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT raw_user_meta_data->>'role' IN ('admin', 'manager') FROM auth.users WHERE id = auth.uid()),
    FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para empresa
DROP POLICY IF EXISTS empresa_select ON empresa;
CREATE POLICY empresa_select ON empresa FOR SELECT USING (true);

DROP POLICY IF EXISTS empresa_insert ON empresa;
CREATE POLICY empresa_insert ON empresa FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS empresa_update ON empresa;
CREATE POLICY empresa_update ON empresa FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS empresa_delete ON empresa;
CREATE POLICY empresa_delete ON empresa FOR DELETE USING (is_admin());

-- Políticas para turno
DROP POLICY IF EXISTS turno_select ON turno;
CREATE POLICY turno_select ON turno FOR SELECT USING (true);

DROP POLICY IF EXISTS turno_insert ON turno;
CREATE POLICY turno_insert ON turno FOR INSERT WITH CHECK (is_manager_or_admin());

DROP POLICY IF EXISTS turno_update ON turno;
CREATE POLICY turno_update ON turno FOR UPDATE USING (is_manager_or_admin());

DROP POLICY IF EXISTS turno_delete ON turno;
CREATE POLICY turno_delete ON turno FOR DELETE USING (is_admin());

-- Políticas para centro_custo
DROP POLICY IF EXISTS centro_custo_select ON centro_custo;
CREATE POLICY centro_custo_select ON centro_custo FOR SELECT USING (true);

DROP POLICY IF EXISTS centro_custo_insert ON centro_custo;
CREATE POLICY centro_custo_insert ON centro_custo FOR INSERT WITH CHECK (is_manager_or_admin());

DROP POLICY IF EXISTS centro_custo_update ON centro_custo;
CREATE POLICY centro_custo_update ON centro_custo FOR UPDATE USING (is_manager_or_admin());

DROP POLICY IF EXISTS centro_custo_delete ON centro_custo;
CREATE POLICY centro_custo_delete ON centro_custo FOR DELETE USING (is_admin());

-- Políticas para parametrizador
DROP POLICY IF EXISTS parametrizador_select ON parametrizador;
CREATE POLICY parametrizador_select ON parametrizador FOR SELECT USING (true);

DROP POLICY IF EXISTS parametrizador_insert ON parametrizador;
CREATE POLICY parametrizador_insert ON parametrizador FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS parametrizador_update ON parametrizador;
CREATE POLICY parametrizador_update ON parametrizador FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS parametrizador_delete ON parametrizador;
CREATE POLICY parametrizador_delete ON parametrizador FOR DELETE USING (is_admin());

-- Políticas para funcionario
DROP POLICY IF EXISTS funcionario_select ON funcionario;
CREATE POLICY funcionario_select ON funcionario FOR SELECT USING (true);

DROP POLICY IF EXISTS funcionario_insert ON funcionario;
CREATE POLICY funcionario_insert ON funcionario FOR INSERT WITH CHECK (is_manager_or_admin());

DROP POLICY IF EXISTS funcionario_update ON funcionario;
CREATE POLICY funcionario_update ON funcionario FOR UPDATE USING (is_manager_or_admin());

DROP POLICY IF EXISTS funcionario_delete ON funcionario;
CREATE POLICY funcionario_delete ON funcionario FOR DELETE USING (is_admin());

-- Políticas para ponto
DROP POLICY IF EXISTS ponto_select ON ponto;
CREATE POLICY ponto_select ON ponto FOR SELECT USING (true);

DROP POLICY IF EXISTS ponto_insert ON ponto;
CREATE POLICY ponto_insert ON ponto FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS ponto_update ON ponto;
CREATE POLICY ponto_update ON ponto FOR UPDATE USING (is_manager_or_admin());

DROP POLICY IF EXISTS ponto_delete ON ponto;
CREATE POLICY ponto_delete ON ponto FOR DELETE USING (is_admin());

-- Políticas para notificacoes
DROP POLICY IF EXISTS notificacoes_select ON notificacoes;
CREATE POLICY notificacoes_select ON notificacoes FOR SELECT USING (auth.uid() = id_user OR is_admin());

DROP POLICY IF EXISTS notificacoes_insert ON notificacoes;
CREATE POLICY notificacoes_insert ON notificacoes FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS notificacoes_update ON notificacoes;
CREATE POLICY notificacoes_update ON notificacoes FOR UPDATE USING (auth.uid() = id_user OR is_admin());

DROP POLICY IF EXISTS notificacoes_delete ON notificacoes;
CREATE POLICY notificacoes_delete ON notificacoes FOR DELETE USING (is_admin());

-- Políticas para planejamento
DROP POLICY IF EXISTS planejamento_select ON planejamento;
CREATE POLICY planejamento_select ON planejamento FOR SELECT USING (true);

DROP POLICY IF EXISTS planejamento_insert ON planejamento;
CREATE POLICY planejamento_insert ON planejamento FOR INSERT WITH CHECK (is_manager_or_admin());

DROP POLICY IF EXISTS planejamento_update ON planejamento;
CREATE POLICY planejamento_update ON planejamento FOR UPDATE USING (is_manager_or_admin());

DROP POLICY IF EXISTS planejamento_delete ON planejamento;
CREATE POLICY planejamento_delete ON planejamento FOR DELETE USING (is_admin());

-- Permitir acesso às views para usuários autenticados
GRANT SELECT ON vw_funcionarios TO authenticated;
GRANT SELECT ON vw_pontos TO authenticated;
GRANT SELECT ON vw_planejamento TO authenticated;
GRANT SELECT ON vw_notificacoes TO authenticated;
GRANT SELECT ON vw_dashboard_stats TO authenticated;
GRANT SELECT ON vw_relatorio_frequencia TO authenticated;
