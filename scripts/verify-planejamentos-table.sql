-- Verificar se a tabela planejamentos existe e sua estrutura

-- 1. Verificar se a tabela existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'planejamentos') 
        THEN 'Tabela planejamentos existe ✅'
        ELSE 'Tabela planejamentos NÃO existe ❌'
    END as status_tabela;

-- 2. Se existir, mostrar estrutura
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'planejamentos' 
ORDER BY ordinal_position;

-- 3. Contar registros se a tabela existir
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'planejamentos') THEN
        RAISE NOTICE 'Contando registros na tabela planejamentos...';
        PERFORM (SELECT COUNT(*) FROM planejamentos);
    ELSE
        RAISE NOTICE 'Tabela planejamentos não existe';
    END IF;
END $$;

-- 4. Mostrar alguns registros se existirem
SELECT * FROM planejamentos LIMIT 5;
