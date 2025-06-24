-- Script para debug das batidas no período específico
SELECT 
  bp.id,
  bp.funcionario_id,
  f.nome as funcionario_nome,
  f.matricula,
  bp.created_at,
  bp.B1, bp.B2, bp.B3, bp.B4, bp.B5, bp.B6, bp.B7, bp.B8,
  t.nome as turno_nome,
  t.hora_inicio,
  t.hora_fim,
  t.tempo_refeicao
FROM batidas_ponto bp
JOIN funcionarios f ON bp.funcionario_id = f.id
LEFT JOIN turnos t ON f.turno_id = t.id
WHERE bp.created_at >= '2025-06-02T00:00:00.000Z'
  AND bp.created_at <= '2025-06-13T23:59:59.999Z'
ORDER BY bp.created_at;

-- Verificar estrutura da tabela batidas_ponto
\d batidas_ponto;
