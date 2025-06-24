-- Script para recriar completamente a sequência de funcionarios
DO $$
DECLARE
    max_id INTEGER;
    sequence_exists BOOLEAN;
BEGIN
    -- Buscar o maior ID na tabela
    SELECT COALESCE(MAX(id), 0) INTO max_id FROM funcionarios;
    RAISE NOTICE 'Maior ID na tabela funcionarios: %', max_id;

    -- Verificar se sequência existe
    SELECT EXISTS (
        SELECT 1 FROM pg_sequences 
        WHERE sequencename = 'funcionarios_id_seq'
    ) INTO sequence_exists;

    IF sequence_exists THEN
        RAISE NOTICE 'Removendo sequência existente...';
        DROP SEQUENCE IF EXISTS funcionarios_id_seq CASCADE;
    END IF;

    -- Criar nova sequência
    EXECUTE format('CREATE SEQUENCE funcionarios_id_seq START WITH %s INCREMENT BY 1', max_id + 1);
    RAISE NOTICE 'Nova sequência criada com início em: %', max_id + 1;

    -- Configurar como padrão para a coluna
    ALTER TABLE funcionarios ALTER COLUMN id SET DEFAULT nextval('funcionarios_id_seq');
    
    -- Definir ownership
    ALTER SEQUENCE funcionarios_id_seq OWNED BY funcionarios.id;
    
    RAISE NOTICE 'Sequência configurada como padrão para funcionarios.id';
    RAISE NOTICE 'Próximo ID será: %', max_id + 1;
END $$;

-- Testar a sequência
SELECT nextval('funcionarios_id_seq') as proximo_id;
SELECT setval('funcionarios_id_seq', (SELECT COALESCE(MAX(id), 0) FROM funcionarios) + 1, false);
