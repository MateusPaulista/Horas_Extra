-- Script para debug completo da tabela turnos
SELECT 'INFORMAÇÕES DA TABELA TURNOS' as info;

-- 1. Estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'turnos' 
ORDER BY ordinal_position;

-- 2. Dados existentes
SELECT 'DADOS EXISTENTES' as info;
SELECT id, nome, hora_inicio, hora_fim, tempo_refeicao, empresa_id 
FROM turnos 
ORDER BY id;

-- 3. Informações de sequências
SELECT 'SEQUÊNCIAS RELACIONADAS' as info;
SELECT 
    schemaname,
    sequencename,
    last_value,
    start_value,
    increment_by,
    is_called
FROM pg_sequences 
WHERE sequencename LIKE '%turno%' OR sequencename LIKE '%turnos%';

-- 4. Constraints da tabela
SELECT 'CONSTRAINTS DA TABELA' as info;
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'turnos';

-- 5. Verificar se existe sequência associada
SELECT 'SEQUÊNCIA ASSOCIADA AO ID' as info;
SELECT pg_get_serial_sequence('turnos', 'id') as sequence_name;

-- 6. Próximo valor que seria gerado
DO $$
DECLARE
    seq_name TEXT;
    next_val BIGINT;
BEGIN
    SELECT pg_get_serial_sequence('turnos', 'id') INTO seq_name;
    
    IF seq_name IS NOT NULL THEN
        EXECUTE format('SELECT nextval(%L)', seq_name) INTO next_val;
        RAISE NOTICE 'Próximo valor da sequência seria: %', next_val;
        -- Reverter o nextval para não afetar a sequência
        EXECUTE format('SELECT setval(%L, %s, false)', seq_name, next_val - 1);
    ELSE
        RAISE NOTICE 'Nenhuma sequência encontrada para a coluna id';
    END IF;
END $$;
