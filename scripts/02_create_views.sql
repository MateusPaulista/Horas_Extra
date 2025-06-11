-- Criação de views para facilitar consultas comuns
-- Execute este script após criar as tabelas

-- View para exibir informações completas dos funcionários
CREATE OR REPLACE VIEW vw_funcionarios AS
SELECT 
  f.id_matricula,
  f.matricula,
  f.nome,
  f.email,
  f.ativo,
  f.data_adm,
  f.data_demis,
  f.foto_url,
  e.id_empresa,
  e.cod_estabel AS empresa_codigo,
  e.descricao AS empresa_nome,
  cc.id_centro,
  cc.codigo AS centro_codigo,
  cc.descricao AS centro_nome,
  t.id_turno,
  t.nome AS turno_nome,
  t.hr_entrada,
  t.hr_saida,
  t.tempo_refeicao,
  f.created_at,
  f.updated_at
FROM 
  funcionario f
JOIN centro_custo cc ON f.id_centro = cc.id_centro
JOIN empresa e ON cc.id_empresa = e.id_empresa
JOIN turno t ON f.id_turno = t.id_turno;

-- View para exibir pontos com informações do funcionário
CREATE OR REPLACE VIEW vw_pontos AS
SELECT 
  p.id,
  p.data,
  p.batida1,
  p.batida2,
  p.batida3,
  p.batida4,
  p.batida5,
  p.batida6,
  p.batida7,
  p.batida8,
  p.total_horas,
  p.status,
  f.id_matricula,
  f.matricula,
  f.nome AS funcionario_nome,
  cc.id_centro,
  cc.descricao AS centro_nome,
  t.id_turno,
  t.nome AS turno_nome,
  e.id_empresa,
  e.descricao AS empresa_nome,
  u1.email AS registrado_por,
  u2.email AS alterado_por,
  p.created_at,
  p.updated_at
FROM 
  ponto p
JOIN funcionario f ON p.id_matricula = f.id_matricula
JOIN centro_custo cc ON p.id_centro = cc.id_centro
JOIN turno t ON p.id_turno = t.id_turno
JOIN empresa e ON cc.id_empresa = e.id_empresa
LEFT JOIN auth.users u1 ON p.user_input = u1.id
LEFT JOIN auth.users u2 ON p.user_input_alt = u2.id;

-- View para exibir planejamento com informações do funcionário
CREATE OR REPLACE VIEW vw_planejamento AS
SELECT 
  pl.id,
  pl.mes,
  pl.horas_planejadas,
  pl.horas_realizadas,
  pl.horas_extra,
  pl.horas_falta,
  f.id_matricula,
  f.matricula,
  f.nome AS funcionario_nome,
  cc.id_centro,
  cc.descricao AS centro_nome,
  e.id_empresa,
  e.descricao AS empresa_nome,
  pl.created_at,
  pl.updated_at
FROM 
  planejamento pl
JOIN funcionario f ON pl.id_matricula = f.id_matricula
JOIN centro_custo cc ON f.id_centro = cc.id_centro
JOIN empresa e ON cc.id_empresa = e.id_empresa;

-- View para exibir notificações com informações do usuário
CREATE OR REPLACE VIEW vw_notificacoes AS
SELECT 
  n.id_notificacao,
  n.mensagem,
  n.lida,
  n.id_data_not,
  u.email AS usuario_email,
  f.nome AS funcionario_nome,
  f.matricula,
  n.created_at,
  n.updated_at
FROM 
  notificacoes n
JOIN auth.users u ON n.id_user = u.id
LEFT JOIN funcionario f ON n.id_matricula = f.id_matricula;

-- View para dashboard com estatísticas
CREATE OR REPLACE VIEW vw_dashboard_stats AS
SELECT 
  COUNT(DISTINCT f.id_matricula) AS total_funcionarios,
  COUNT(DISTINCT e.id_empresa) AS total_empresas,
  COUNT(DISTINCT cc.id_centro) AS total_centros_custo,
  COUNT(DISTINCT t.id_turno) AS total_turnos,
  COALESCE(SUM(pl.horas_realizadas), 0) AS total_horas_realizadas,
  COALESCE(SUM(pl.horas_planejadas), 0) AS total_horas_planejadas,
  COALESCE(SUM(pl.horas_extra), 0) AS total_horas_extra,
  COALESCE(SUM(pl.horas_falta), 0) AS total_horas_falta
FROM 
  funcionario f
JOIN centro_custo cc ON f.id_centro = cc.id_centro
JOIN empresa e ON cc.id_empresa = e.id_empresa
JOIN turno t ON f.id_turno = t.id_turno
LEFT JOIN planejamento pl ON f.id_matricula = pl.id_matricula 
  AND pl.mes = TO_CHAR(CURRENT_DATE, 'YYYY-MM');

-- View para relatórios de frequência
CREATE OR REPLACE VIEW vw_relatorio_frequencia AS
SELECT 
  f.id_matricula,
  f.matricula,
  f.nome AS funcionario_nome,
  e.descricao AS empresa_nome,
  cc.descricao AS centro_nome,
  t.nome AS turno_nome,
  p.data,
  p.total_horas,
  p.status,
  CASE 
    WHEN p.total_horas >= 8 THEN p.total_horas - 8
    ELSE 0
  END AS horas_extra_dia,
  CASE 
    WHEN p.total_horas < 8 THEN 8 - p.total_horas
    ELSE 0
  END AS horas_falta_dia
FROM 
  funcionario f
JOIN centro_custo cc ON f.id_centro = cc.id_centro
JOIN empresa e ON cc.id_empresa = e.id_empresa
JOIN turno t ON f.id_turno = t.id_turno
LEFT JOIN ponto p ON f.id_matricula = p.id_matricula
WHERE f.ativo = TRUE;
