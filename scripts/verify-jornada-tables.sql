-- Verificar se as tabelas de jornada existem
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN (
    'liberacao_horas_extras',
    'afastamentos', 
    'horas_justificadas',
    'horas_extras_pagar'
)
ORDER BY tablename;

-- Verificar estrutura da tabela liberacao_horas_extras se existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'liberacao_horas_extras') THEN
        RAISE NOTICE 'Tabela liberacao_horas_extras existe. Verificando estrutura...';
        
        -- Mostrar colunas
        PERFORM column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'liberacao_horas_extras'
        ORDER BY ordinal_position;
        
    ELSE
        RAISE NOTICE 'Tabela liberacao_horas_extras NÃO existe!';
    END IF;
END $$;

-- Verificar foreign keys se a tabela existir
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'liberacao_horas_extras';
