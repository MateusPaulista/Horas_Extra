-- Verificar estrutura completa da tabela planejamentos

-- 1. Verificar se a tabela existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'planejamentos') 
        THEN 'Tabela planejamentos existe ✅'
        ELSE 'Tabela planejamentos NÃO existe ❌'
    END as status_tabela;

-- 2. Mostrar todas as colunas da tabela
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'planejamentos' 
ORDER BY ordinal_position;

-- 3. Mostrar alguns registros para entender a estrutura
SELECT * FROM planejamentos LIMIT 3;

-- 4. Verificar se existe coluna mes_ano especificamente
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'planejamentos' AND column_name = 'mes_ano'
        ) 
        THEN 'Coluna mes_ano existe ✅'
        ELSE 'Coluna mes_ano NÃO existe ❌'
    END as status_mes_ano;

-- 5. Listar colunas que podem ser relacionadas a data/mês
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'planejamentos' 
AND (
    column_name ILIKE '%mes%' OR 
    column_name ILIKE '%ano%' OR 
    column_name ILIKE '%data%' OR 
    column_name ILIKE '%date%' OR
    column_name ILIKE '%periodo%'
)
ORDER BY column_name;
