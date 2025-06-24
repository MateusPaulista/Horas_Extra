-- Debug de um caso real específico para entender o formato dos dados
SELECT 
    bp.id,
    bp.funcionario_id,
    f.nome as funcionario_nome,
    f.matricula,
    bp.created_at,
    DATE(bp.created_at AT TIME ZONE 'America/Sao_Paulo') as data_batida,
    EXTRACT(DOW FROM bp.created_at AT TIME ZONE 'America/Sao_Paulo') as dia_semana,
    
    -- Campos B1-B8 com seus tipos
    bp.B1, pg_typeof(bp.B1) as tipo_B1,
    bp.B2, pg_typeof(bp.B2) as tipo_B2,
    bp.B3, pg_typeof(bp.B3) as tipo_B3,
    bp.B4, pg_typeof(bp.B4) as tipo_B4,
    bp.B5, pg_typeof(bp.B5) as tipo_B5,
    bp.B6, pg_typeof(bp.B6) as tipo_B6,
    bp.B7, pg_typeof(bp.B7) as tipo_B7,
    bp.B8, pg_typeof(bp.B8) as tipo_B8,
    
    -- Tentar extrair horários de diferentes formas
    CASE 
        WHEN bp.B1 IS NOT NULL THEN 
            CASE 
                WHEN bp.B1::text ~ '^\d{4}-\d{2}-\d{2}' THEN 
                    TO_CHAR(bp.B1::timestamptz AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI')
                WHEN bp.B1::text ~ '^\d{1,2}:\d{2}$' THEN bp.B1::text
                WHEN bp.B1::text ~ '^\d{3,4}$' THEN 
                    LPAD(bp.B1::text, 4, '0') || ' -> ' || 
                    SUBSTRING(LPAD(bp.B1::text, 4, '0'), 1, 2) || ':' || 
                    SUBSTRING(LPAD(bp.B1::text, 4, '0'), 3, 2)
                ELSE 'FORMATO_NAO_RECONHECIDO: ' || bp.B1::text
            END
        ELSE NULL
    END as B1_extraido,
    
    CASE 
        WHEN bp.B2 IS NOT NULL THEN 
            CASE 
                WHEN bp.B2::text ~ '^\d{4}-\d{2}-\d{2}' THEN 
                    TO_CHAR(bp.B2::timestamptz AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI')
                WHEN bp.B2::text ~ '^\d{1,2}:\d{2}$' THEN bp.B2::text
                WHEN bp.B2::text ~ '^\d{3,4}$' THEN 
                    LPAD(bp.B2::text, 4, '0') || ' -> ' || 
                    SUBSTRING(LPAD(bp.B2::text, 4, '0'), 1, 2) || ':' || 
                    SUBSTRING(LPAD(bp.B2::text, 4, '0'), 3, 2)
                ELSE 'FORMATO_NAO_RECONHECIDO: ' || bp.B2::text
            END
        ELSE NULL
    END as B2_extraido,
    
    -- Informações do turno para comparação
    t.nome as turno_nome,
    t.hora_inicio,
    t.hora_fim,
    t.tempo_refeicao,
    
    -- Calcular horas previstas do turno
    CASE 
        WHEN t.hora_inicio IS NOT NULL AND t.hora_fim IS NOT NULL THEN
            EXTRACT(EPOCH FROM (
                (t.hora_fim::time - t.hora_inicio::time) - 
                COALESCE(t.tempo_refeicao::time, '00:00:00'::time)
            )) / 3600.0
        ELSE 8.0
    END as horas_previstas_turno

FROM batidas_ponto bp
JOIN funcionarios f ON f.id = bp.funcionario_id
LEFT JOIN turnos t ON t.id = f.turno_id
WHERE bp.created_at >= '2024-06-02T00:00:00-03:00'
  AND bp.created_at <= '2024-06-13T23:59:59-03:00'
  AND (bp.B1 IS NOT NULL OR bp.B2 IS NOT NULL OR bp.B3 IS NOT NULL OR bp.B4 IS NOT NULL)
ORDER BY bp.funcionario_id, bp.created_at
LIMIT 10;
