-- Debug completo da estrutura de dados
SELECT 
    'FUNCIONARIOS' as tabela,
    COUNT(*) as total_registros
FROM funcionarios 
WHERE ativo = true

UNION ALL

SELECT 
    'BATIDAS_PONTO' as tabela,
    COUNT(*) as total_registros
FROM batidas_ponto 
WHERE created_at >= '2024-06-02' AND created_at <= '2024-06-13'

UNION ALL

SELECT 
    'TURNOS' as tabela,
    COUNT(*) as total_registros
FROM turnos;

-- Estrutura detalhada de uma batida real
SELECT 
    'EXEMPLO_BATIDA' as tipo,
    funcionario_id,
    created_at,
    date(created_at) as data_batida,
    B1, B2, B3, B4, B5, B6, B7, B8,
    pg_typeof(B1) as tipo_B1,
    pg_typeof(B2) as tipo_B2
FROM batidas_ponto 
WHERE created_at >= '2024-06-02' AND created_at <= '2024-06-13'
LIMIT 3;

-- Funcionário com turno
SELECT 
    f.id,
    f.nome,
    f.matricula,
    t.nome as turno_nome,
    t.hora_inicio,
    t.hora_fim,
    t.tempo_refeicao,
    e.Estabelecimento as empresa
FROM funcionarios f
LEFT JOIN turnos t ON f.turno_id = t.id
LEFT JOIN centro_custos cc ON f.centro_custo_id = cc.id
LEFT JOIN empresas e ON cc.empresa_id = e.id
WHERE f.ativo = true
LIMIT 3;

-- Contagem de batidas por funcionário no período
SELECT 
    funcionario_id,
    COUNT(*) as total_batidas,
    MIN(created_at) as primeira_batida,
    MAX(created_at) as ultima_batida
FROM batidas_ponto 
WHERE created_at >= '2024-06-02' AND created_at <= '2024-06-13'
GROUP BY funcionario_id
ORDER BY total_batidas DESC
LIMIT 5;
