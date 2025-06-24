-- Script para corrigir completamente a tabela turnos
DO $$
DECLARE
    max_id INTEGER;
    sequence_name TEXT;
    next_safe_id INTEGER;
BEGIN
    RAISE NOTICE '=== INICIANDO CORREÇÃO COMPLETA DA TABELA TURNOS ===';
    
    -- 1. Encontrar maior ID atual
    SELECT COALESCE(MAX(id), 0) INTO max_id FROM turnos;
    RAISE NOTICE '1. Maior ID atual na tabela: %', max_id;
    
    -- 2. Definir próximo ID seguro
    next_safe_id := max_id + 1;
    RAISE NOTICE '2. Próximo ID seguro calculado: %', next_safe_id;
    
    -- 3. Tentar encontrar e corrigir sequência existente
    SELECT pg_get_serial_sequence('turnos', 'id') INTO sequence_name;
    
    IF sequence_name IS NULL THEN
        -- Tentar nomes comuns de sequência
        IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'turnos_id_seq' AND relkind = 'S') THEN
            sequence_name := 'turnos_id_seq';
        ELSIF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'turnos_seq' AND relkind = 'S') THEN
            sequence_name := 'turnos_seq';
        END IF;
    END IF;
    
    IF sequence_name IS NOT NULL THEN
        RAISE NOTICE '3. Sequência encontrada: %', sequence_name;
        
        -- Corrigir sequência existente
        EXECUTE format('SELECT setval(%L, %s, true)', sequence_name, next_safe_id);
        RAISE NOTICE '4. Sequência corrigida para valor: %', next_safe_id;
        
    ELSE
        RAISE NOTICE '3. Nenhuma sequência encontrada, criando nova...';
        
        -- Criar nova sequência
        EXECUTE format('CREATE SEQUENCE IF NOT EXISTS turnos_id_seq START WITH %s', next_safe_id);
        
        -- Remover default atual se existir
        ALTER TABLE turnos ALTER COLUMN id DROP DEFAULT;
        
        -- Definir novo default
        ALTER TABLE turnos ALTER COLUMN id SET DEFAULT nextval('turnos_id_seq');
        
        -- Definir ownership
        ALTER SEQUENCE turnos_id_seq OWNED BY turnos.id;
        
        RAISE NOTICE '4. Nova sequência criada e configurada';
    END IF;
    
    -- 5. Verificar se a correção funcionou
    DECLARE
        current_val INTEGER;
    BEGIN
        IF sequence_name IS NOT NULL THEN
            EXECUTE format('SELECT last_value FROM %I', sequence_name) INTO current_val;
        ELSE
            SELECT last_value FROM turnos_id_seq INTO current_val;
        END IF;
        
        RAISE NOTICE '5. Valor atual da sequência após correção: %', current_val;
        
        IF current_val >= next_safe_id THEN
            RAISE NOTICE '✅ CORREÇÃO REALIZADA COM SUCESSO!';
        ELSE
            RAISE NOTICE '❌ CORREÇÃO PODE TER FALHADO - Valor ainda incorreto';
        END IF;
    END;
    
    RAISE NOTICE '=== CORREÇÃO COMPLETA FINALIZADA ===';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERRO DURANTE CORREÇÃO: %', SQLERRM;
        RAISE NOTICE 'Tentando abordagem alternativa...';
        
        -- Abordagem alternativa: recriar sequência do zero
        DROP SEQUENCE IF EXISTS turnos_id_seq CASCADE;
        EXECUTE format('CREATE SEQUENCE turnos_id_seq START WITH %s', max_id + 1);
        ALTER TABLE turnos ALTER COLUMN id SET DEFAULT nextval('turnos_id_seq');
        ALTER SEQUENCE turnos_id_seq OWNED BY turnos.id;
        
        RAISE NOTICE '✅ SEQUÊNCIA RECRIADA COM ABORDAGEM ALTERNATIVA';
END $$;

-- Verificar resultado final
SELECT 
    'VERIFICAÇÃO FINAL' as status,
    sequencename,
    last_value,
    start_value
FROM pg_sequences 
WHERE sequencename LIKE '%turno%';
