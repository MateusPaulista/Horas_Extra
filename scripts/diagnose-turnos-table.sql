-- Script completo de diagnóstico da tabela turnos
SELECT 'DIAGNÓSTICO COMPLETO DA TABELA TURNOS' as titulo;

-- 1. Estrutura da tabela
SELECT 
    'ESTRUTURA DA TABELA' as secao,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'turnos'
ORDER BY ordinal_position;

-- 2. Dados existentes
SELECT 'DADOS EXISTENTES' as secao;
SELECT 
    id,
    nome,
    hora_inicio,
    hora_fim,
    tempo_refeicao,
    empresa_id,
    created_at
FROM turnos 
ORDER BY id;

-- 3. Análise de IDs
SELECT 
    'ANÁLISE DE IDs' as secao,
    COUNT(*) as total_registros,
    MIN(id) as menor_id,
    MAX(id) as maior_id,
    MAX(id) - MIN(id) + 1 as range_ids,
    COUNT(*) - (MAX(id) - MIN(id) + 1) as gaps_detectados
FROM turnos;

-- 4. Verificar sequências
SELECT 
    'SEQUÊNCIAS RELACIONADAS' as secao,
    schemaname,
    sequencename,
    last_value,
    start_value,
    increment_by,
    max_value,
    min_value,
    cache_value,
    is_cycled
FROM pg_sequences 
WHERE sequencename LIKE '%turno%';

-- 5. Verificar constraints
SELECT 
    'CONSTRAINTS' as secao,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'turnos'::regclass;

-- 6. Verificar default da coluna ID
SELECT 
    'DEFAULT DA COLUNA ID' as secao,
    column_name,
    column_default,
    data_type
FROM information_schema.columns 
WHERE table_name = 'turnos' AND column_name = 'id';

-- 7. Tentar encontrar próximo ID seguro
DO $$
DECLARE
    max_id INTEGER;
    safe_next_id INTEGER;
    test_id INTEGER;
    id_exists BOOLEAN;
BEGIN
    -- Encontrar maior ID
    SELECT COALESCE(MAX(id), 0) INTO max_id FROM turnos;
    
    -- Começar a partir do maior ID + 1
    safe_next_id := max_id + 1;
    
    -- Verificar se o ID está realmente livre (até 10 tentativas)
    FOR i IN 1..10 LOOP
        test_id := safe_next_id + i - 1;
        
        SELECT EXISTS(SELECT 1 FROM turnos WHERE id = test_id) INTO id_exists;
        
        IF NOT id_exists THEN
            RAISE NOTICE 'PRÓXIMO ID SEGURO ENCONTRADO: %', test_id;
            EXIT;
        END IF;
    END LOOP;
    
    IF id_exists THEN
        RAISE NOTICE 'ATENÇÃO: Não foi possível encontrar ID seguro nos próximos 10 números!';
    END IF;
END $$;
