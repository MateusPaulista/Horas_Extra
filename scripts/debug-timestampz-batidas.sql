-- Script para debug de batidas com timestampz
-- Verificar como os dados estão salvos e como extrair corretamente

SELECT 
  bp.id,
  bp.funcionario_id,
  f.nome as funcionario_nome,
  f.matricula,
  bp.created_at,
  -- Extrair data do created_at
  DATE(bp.created_at AT TIME ZONE 'America/Sao_Paulo') as data_batida,
  -- Extrair dia da semana (1=Segunda, 7=Domingo)
  EXTRACT(DOW FROM bp.created_at AT TIME ZONE 'America/Sao_Paulo') as dia_semana,
  -- Mostrar os timestamps das batidas B1-B8
  bp.B1,
  bp.B2,
  bp.B3,
  bp.B4,
  -- Extrair apenas o horário dos timestamps
  CASE 
    WHEN bp.B1 IS NOT NULL THEN TO_CHAR(bp.B1 AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI')
    ELSE NULL 
  END as b1_horario,
  CASE 
    WHEN bp.B2 IS NOT NULL THEN TO_CHAR(bp.B2 AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI')
    ELSE NULL 
  END as b2_horario,
  CASE 
    WHEN bp.B3 IS NOT NULL THEN TO_CHAR(bp.B3 AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI')
    ELSE NULL 
  END as b3_horario,
  CASE 
    WHEN bp.B4 IS NOT NULL THEN TO_CHAR(bp.B4 AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI')
    ELSE NULL 
  END as b4_horario
FROM batidas_ponto bp
JOIN funcionarios f ON f.id = bp.funcionario_id
WHERE bp.created_at >= '2025-06-02T00:00:00-03:00'
  AND bp.created_at <= '2025-06-13T23:59:59-03:00'
ORDER BY bp.funcionario_id, bp.created_at;

-- Verificar especificamente segundas-feiras
SELECT 
  COUNT(*) as total_batidas_segunda,
  COUNT(DISTINCT bp.funcionario_id) as funcionarios_com_batida_segunda
FROM batidas_ponto bp
WHERE bp.created_at >= '2025-06-02T00:00:00-03:00'
  AND bp.created_at <= '2025-06-13T23:59:59-03:00'
  AND EXTRACT(DOW FROM bp.created_at AT TIME ZONE 'America/Sao_Paulo') = 1; -- Segunda-feira

-- Mostrar distribuição por dia da semana
SELECT 
  EXTRACT(DOW FROM bp.created_at AT TIME ZONE 'America/Sao_Paulo') as dia_semana,
  CASE 
    WHEN EXTRACT(DOW FROM bp.created_at AT TIME ZONE 'America/Sao_Paulo') = 0 THEN 'Domingo'
    WHEN EXTRACT(DOW FROM bp.created_at AT TIME ZONE 'America/Sao_Paulo') = 1 THEN 'Segunda'
    WHEN EXTRACT(DOW FROM bp.created_at AT TIME ZONE 'America/Sao_Paulo') = 2 THEN 'Terça'
    WHEN EXTRACT(DOW FROM bp.created_at AT TIME ZONE 'America/Sao_Paulo') = 3 THEN 'Quarta'
    WHEN EXTRACT(DOW FROM bp.created_at AT TIME ZONE 'America/Sao_Paulo') = 4 THEN 'Quinta'
    WHEN EXTRACT(DOW FROM bp.created_at AT TIME ZONE 'America/Sao_Paulo') = 5 THEN 'Sexta'
    WHEN EXTRACT(DOW FROM bp.created_at AT TIME ZONE 'America/Sao_Paulo') = 6 THEN 'Sábado'
  END as nome_dia,
  COUNT(*) as total_batidas
FROM batidas_ponto bp
WHERE bp.created_at >= '2025-06-02T00:00:00-03:00'
  AND bp.created_at <= '2025-06-13T23:59:59-03:00'
GROUP BY EXTRACT(DOW FROM bp.created_at AT TIME ZONE 'America/Sao_Paulo')
ORDER BY dia_semana;
