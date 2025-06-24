-- Script para forçar correção da sequência de turnos
DO $$
DECLARE
    max_id INTEGER;
    current_seq_val INTEGER;
    sequence_name TEXT;
BEGIN
    -- Buscar o maior ID atual na tabela turnos
    SELECT COALESCE(MAX(id), 0) INTO max_id FROM turnos;
    RAISE NOTICE 'Maior ID encontrado na tabela turnos: %', max_id;
    
    -- Tentar encontrar a sequência
    SELECT pg_get_serial_sequence('turnos', 'id') INTO sequence_name;
    
    -- Se não encontrou, tentar nomes comuns
    IF sequence_name IS NULL THEN
        IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'turnos_id_seq') THEN
            sequence_name := 'turnos_id_seq';
        ELSIF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'turnos_seq') THEN
            sequence_name := 'turnos_seq';
        END IF;
    END IF;
    
    RAISE NOTICE 'Sequência encontrada: %', COALESCE(sequence_name, 'NENHUMA');
    
    -- Se encontrou a sequência
    IF sequence_name IS NOT NULL THEN
        -- Verificar valor atual da sequência
        EXECUTE format('SELECT last_value FROM %I', sequence_name) INTO current_seq_val;
        RAISE NOTICE 'Valor atual da sequência: %', current_seq_val;
        
        -- Forçar ajuste da sequência para o próximo valor correto
        EXECUTE format('SELECT setval(%L, %s, true)', sequence_name, max_id + 1);
        RAISE NOTICE 'Sequência ajustada para: %', max_id + 1;
        
        -- Verificar se o ajuste funcionou
        EXECUTE format('SELECT last_value FROM %I', sequence_name) INTO current_seq_val;
        RAISE NOTICE 'Novo valor da sequência: %', current_seq_val;
        
    ELSE
        RAISE NOTICE 'ATENÇÃO: Sequência não encontrada!';
        RAISE NOTICE 'A tabela pode não ter uma sequência associada ao campo ID.';
        
        -- Verificar se o campo ID tem default
        SELECT column_default 
        FROM information_schema.columns 
        WHERE table_name = 'turnos' AND column_name = 'id'
        INTO sequence_name;
        
        RAISE NOTICE 'Default do campo ID: %', COALESCE(sequence_name, 'NENHUM');
    END IF;
    
END $$;

-- Mostrar estado final
SELECT 
    'Estado da tabela turnos' as info,
    COUNT(*) as total_registros,
    COALESCE(MIN(id), 0) as menor_id,
    COALESCE(MAX(id), 0) as maior_id
FROM turnos;

-- Tentar mostrar próximo valor da sequência
DO $$
DECLARE
    sequence_name TEXT;
    next_val INTEGER;
BEGIN
    SELECT pg_get_serial_sequence('turnos', 'id') INTO sequence_name;
    
    IF sequence_name IS NOT NULL THEN
        -- Simular nextval sem consumir
        EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_val;
        RAISE NOTICE 'Próximo ID que será gerado: %', next_val;
        -- Reverter para não afetar a sequência
        EXECUTE format('SELECT setval(%L, %s, false)', sequence_name, next_val - 1);
    END IF;
END $$;
