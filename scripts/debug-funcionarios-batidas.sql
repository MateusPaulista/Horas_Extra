-- Script para debug: verificar funcionários e suas batidas
SELECT 
    f.id as funcionario_id,
    f.nome,
    f.matricula,
    f.ativo,
    f.data_admissao,
    cc.nome as centro_custo,
    e.Estabelecimento as empresa,
    t.nome as turno,
    t.hora_inicio,
    t.hora_fim,
    COUNT(bp.id) as total_batidas
FROM funcionarios f
LEFT JOIN centro_custos cc ON f.centro_custo_id = cc.id
LEFT JOIN empresas e ON cc.empresa_id = e.id
LEFT JOIN turnos t ON f.turno_id = t.id
LEFT JOIN batidas_ponto bp ON f.id = bp.funcionario_id 
    AND bp.created_at >= '2024-06-02T00:00:00'
    AND bp.created_at <= '2024-06-13T23:59:59'
WHERE f.ativo = true
GROUP BY f.id, f.nome, f.matricula, f.ativo, f.data_admissao, cc.nome, e.Estabelecimento, t.nome, t.hora_inicio, t.hora_fim
ORDER BY f.nome;
