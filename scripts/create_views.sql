-- Criação de views para facilitar consultas comuns

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
  t.tempo_refeicao
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
  u2.email AS alterado_por
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
  e.descricao AS empresa_nome
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
  f.matricula
FROM 
  notificacoes n
JOIN auth.users u ON n.id_user = u.id
LEFT JOIN funcionario f ON n.id_matricula = f.id_matricula;
