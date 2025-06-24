-- Script para corrigir sequência da tabela funcionarios
DO $$
DECLARE
    max_id INTEGER;
    sequence_name TEXT;
    current_value INTEGER;
BEGIN
    -- Buscar o maior ID na tabela funcionarios
    SELECT COALESCE(MAX(id), 0) INTO max_id FROM funcionarios;
    RAISE NOTICE 'Maior ID encontrado na tabela funcionarios: %', max_id;

    -- Encontrar o nome da sequência
    SELECT pg_get_serial_sequence('funcionarios', 'id') INTO sequence_name;
    
    IF sequence_name IS NULL THEN
        RAISE NOTICE 'Sequência não encontrada para funcionarios.id';
        
        -- Criar sequência se não existir
        EXECUTE format('CREATE SEQUENCE funcionarios_id_seq START WITH %s', max_id + 1);
        ALTER TABLE funcionarios ALTER COLUMN id SET DEFAULT nextval('funcionarios_id_seq');
        ALTER SEQUENCE funcionarios_id_seq OWNED BY funcionarios.id;
        
        RAISE NOTICE 'Nova sequência funcionarios_id_seq criada com valor inicial: %', max_id + 1;
    ELSE
        RAISE NOTICE 'Sequência encontrada: %', sequence_name;
        
        -- Verificar valor atual da sequência
        EXECUTE format('SELECT last_value FROM %I', sequence_name) INTO current_value;
        RAISE NOTICE 'Valor atual da sequência: %', current_value;
        
        -- Ajustar sequência para o próximo valor correto
        EXECUTE format('SELECT setval(%L, %s, true)', sequence_name, max_id + 1);
        RAISE NOTICE 'Sequência % ajustada para próximo valor: %', sequence_name, max_id + 1;
        
        -- Verificar novo valor
        EXECUTE format('SELECT last_value FROM %I', sequence_name) INTO current_value;
        RAISE NOTICE 'Novo valor da sequência: %', current_value;
    END IF;
    
    RAISE NOTICE 'Próximo ID que será gerado: %', max_id + 1;
END $$;

-- Verificar resultado
SELECT 
    schemaname,
    sequencename,
    last_value,
    start_value,
    increment_by
FROM pg_sequences 
WHERE sequencename LIKE '%funcionario%';

-- Mostrar alguns registros da tabela
SELECT id, nome, matricula FROM funcionarios ORDER BY id DESC LIMIT 5;
