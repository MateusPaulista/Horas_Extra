-- Script para recriar a sequência se necessário
DO $$
DECLARE
    max_id INTEGER;
    sequence_exists BOOLEAN := false;
BEGIN
    -- Verificar se existe sequência
    SELECT EXISTS(
        SELECT 1 FROM pg_class 
        WHERE relname = 'turnos_id_seq' AND relkind = 'S'
    ) INTO sequence_exists;
    
    RAISE NOTICE 'Sequência turnos_id_seq existe: %', sequence_exists;
    
    -- Buscar maior ID
    SELECT COALESCE(MAX(id), 0) INTO max_id FROM turnos;
    RAISE NOTICE 'Maior ID na tabela: %', max_id;
    
    -- Se não existe sequência, criar
    IF NOT sequence_exists THEN
        RAISE NOTICE 'Criando nova sequência...';
        
        -- Criar sequência
        EXECUTE format('CREATE SEQUENCE turnos_id_seq START WITH %s', max_id + 1);
        
        -- Associar à coluna
        ALTER TABLE turnos ALTER COLUMN id SET DEFAULT nextval('turnos_id_seq');
        
        -- Definir ownership
        ALTER SEQUENCE turnos_id_seq OWNED BY turnos.id;
        
        RAISE NOTICE 'Sequência criada e associada com sucesso!';
    ELSE
        RAISE NOTICE 'Sequência já existe, apenas ajustando valor...';
        EXECUTE format('SELECT setval(''turnos_id_seq'', %s, true)', max_id + 1);
    END IF;
    
END $$;

-- Verificar resultado
SELECT 
    schemaname,
    sequencename,
    last_value,
    start_value,
    increment_by
FROM pg_sequences 
WHERE sequencename = 'turnos_id_seq';
