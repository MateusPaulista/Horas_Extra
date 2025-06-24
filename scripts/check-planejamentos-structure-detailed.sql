-- Verificar estrutura detalhada da tabela planejamentos

-- 1. Verificar se a tabela existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'planejamentos') 
        THEN 'Tabela planejamentos existe ✅'
        ELSE 'Tabela planejamentos NÃO existe ❌'
    END as status_tabela;

-- 2. Mostrar TODAS as colunas da tabela com detalhes
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'planejamentos' 
ORDER BY ordinal_position;

-- 3. Mostrar alguns registros para entender os dados
SELECT * FROM planejamentos LIMIT 5;

-- 4. Verificar colunas específicas que esperamos
SELECT 
    CASE WHEN EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'planejamentos' AND column_name = 'mes_ano') 
         THEN '✅ mes_ano existe' ELSE '❌ mes_ano NÃO existe' END as mes_ano_status,
    CASE WHEN EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'planejamentos' AND column_name = 'horas_atraso') 
         THEN '✅ horas_atraso existe' ELSE '❌ horas_atraso NÃO existe' END as horas_atraso_status,
    CASE WHEN EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'planejamentos' AND column_name = 'horas_extra') 
         THEN '✅ horas_extra existe' ELSE '❌ horas_extra NÃO existe' END as horas_extra_status,
    CASE WHEN EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'planejamentos' AND column_name = 'horas_justificadas') 
         THEN '✅ horas_justificadas existe' ELSE '❌ horas_justificadas NÃO existe' END as horas_justificadas_status,
    CASE WHEN EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'planejamentos' AND column_name = 'horas_realizadas') 
         THEN '✅ horas_realizadas existe' ELSE '❌ horas_realizadas NÃO existe' END as horas_realizadas_status,
    CASE WHEN EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'planejamentos' AND column_name = 'percentual_atendimento') 
         THEN '✅ percentual_atendimento existe' ELSE '❌ percentual_atendimento NÃO existe' END as percentual_status;

-- 5. Contar total de registros
SELECT COUNT(*) as total_registros FROM planejamentos;

-- 6. Mostrar estrutura em formato JSON para debug
SELECT json_agg(
    json_build_object(
        'column_name', column_name,
        'data_type', data_type,
        'is_nullable', is_nullable,
        'column_default', column_default
    ) ORDER BY ordinal_position
) as estrutura_completa
FROM information_schema.columns 
WHERE table_name = 'planejamentos';
