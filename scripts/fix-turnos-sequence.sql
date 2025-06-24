-- Corrigir sequência da tabela turnos
DO $$
DECLARE
    max_id INTEGER;
    sequence_name TEXT;
BEGIN
    -- Buscar o maior ID atual na tabela turnos
    SELECT COALESCE(MAX(id), 0) INTO max_id FROM turnos;
    
    -- Nome da sequência (pode variar)
    SELECT pg_get_serial_sequence('turnos', 'id') INTO sequence_name;
    
    -- Se não encontrou a sequência, tentar nomes comuns
    IF sequence_name IS NULL THEN
        -- Tentar nomes de sequência comuns
        IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'turnos_id_seq') THEN
            sequence_name := 'turnos_id_seq';
        ELSIF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'turnos_seq') THEN
            sequence_name := 'turnos_seq';
        END IF;
    END IF;
    
    -- Log do que foi encontrado
    RAISE NOTICE 'Maior ID na tabela turnos: %', max_id;
    RAISE NOTICE 'Nome da sequência: %', sequence_name;
    
    -- Se encontrou a sequência, ajustar
    IF sequence_name IS NOT NULL THEN
        -- Definir o próximo valor da sequência
        EXECUTE format('SELECT setval(%L, %s)', sequence_name, max_id + 1);
        RAISE NOTICE 'Sequência % ajustada para próximo valor: %', sequence_name, max_id + 1;
    ELSE
        RAISE NOTICE 'Sequência não encontrada. Verificando estrutura da tabela...';
        
        -- Mostrar informações da tabela
        FOR sequence_name IN 
            SELECT column_name || ' (' || data_type || ')' as info
            FROM information_schema.columns 
            WHERE table_name = 'turnos' 
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE 'Coluna: %', sequence_name;
        END LOOP;
    END IF;
    
END $$;

-- Verificar o estado atual
SELECT 
    'turnos' as tabela,
    COUNT(*) as total_registros,
    COALESCE(MAX(id), 0) as maior_id
FROM turnos;

-- Tentar mostrar informações das sequências relacionadas
SELECT 
    schemaname,
    sequencename,
    last_value,
    start_value,
    increment_by
FROM pg_sequences 
WHERE sequencename LIKE '%turno%';
