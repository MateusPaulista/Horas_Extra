-- Debug detalhado dos horários nas batidas
SELECT 
    bp.id,
    bp.funcionario_id,
    f.nome as funcionario_nome,
    bp.created_at,
    DATE(bp.created_at AT TIME ZONE 'America/Sao_Paulo') as data_batida,
    EXTRACT(DOW FROM bp.created_at AT TIME ZONE 'America/Sao_Paulo') as dia_semana,
    bp.B1,
    bp.B2,
    bp.B3,
    bp.B4,
    bp.B5,
    bp.B6,
    bp.B7,
    bp.B8,
    -- Verificar tipos dos campos B1-B8
    pg_typeof(bp.B1) as tipo_B1,
    pg_typeof(bp.B2) as tipo_B2,
    -- Tentar extrair horário se for timestamp
    CASE 
        WHEN bp.B1 IS NOT NULL THEN 
            CASE 
                WHEN bp.B1::text ~ '^\d{4}-\d{2}-\d{2}' THEN 
                    TO_CHAR(bp.B1::timestamptz AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI')
                ELSE bp.B1::text
            END
        ELSE NULL
    END as B1_horario_extraido,
    CASE 
        WHEN bp.B2 IS NOT NULL THEN 
            CASE 
                WHEN bp.B2::text ~ '^\d{4}-\d{2}-\d{2}' THEN 
                    TO_CHAR(bp.B2::timestamptz AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI')
                ELSE bp.B2::text
            END
        ELSE NULL
    END as B2_horario_extraido
FROM batidas_ponto bp
JOIN funcionarios f ON f.id = bp.funcionario_id
WHERE bp.created_at >= '2024-06-02T00:00:00-03:00'
  AND bp.created_at <= '2024-06-13T23:59:59-03:00'
  AND (bp.B1 IS NOT NULL OR bp.B2 IS NOT NULL OR bp.B3 IS NOT NULL OR bp.B4 IS NOT NULL)
ORDER BY bp.funcionario_id, bp.created_at
LIMIT 20;
