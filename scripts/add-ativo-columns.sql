-- Adicionar coluna ativo nas tabelas que não têm
DO $$
BEGIN
    -- Verificar e adicionar coluna ativo na tabela horas_justificadas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'horas_justificadas' 
        AND column_name = 'ativo'
    ) THEN
        ALTER TABLE horas_justificadas ADD COLUMN ativo BOOLEAN DEFAULT true;
        UPDATE horas_justificadas SET ativo = true WHERE ativo IS NULL;
        RAISE NOTICE 'Coluna ativo adicionada na tabela horas_justificadas';
    ELSE
        RAISE NOTICE 'Coluna ativo já existe na tabela horas_justificadas';
    END IF;

    -- Verificar e adicionar coluna ativo na tabela eventos
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'eventos' 
        AND column_name = 'ativo'
    ) THEN
        ALTER TABLE eventos ADD COLUMN ativo BOOLEAN DEFAULT true;
        UPDATE eventos SET ativo = true WHERE ativo IS NULL;
        RAISE NOTICE 'Coluna ativo adicionada na tabela eventos';
    ELSE
        RAISE NOTICE 'Coluna ativo já existe na tabela eventos';
    END IF;

    -- Verificar e adicionar coluna ativo na tabela afastados
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'afastados' 
        AND column_name = 'ativo'
    ) THEN
        ALTER TABLE afastados ADD COLUMN ativo BOOLEAN DEFAULT true;
        UPDATE afastados SET ativo = true WHERE ativo IS NULL;
        RAISE NOTICE 'Coluna ativo adicionada na tabela afastados';
    ELSE
        RAISE NOTICE 'Coluna ativo já existe na tabela afastados';
    END IF;

    -- Verificar e adicionar coluna ativo na tabela liberar_horas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'liberar_horas' 
        AND column_name = 'ativo'
    ) THEN
        ALTER TABLE liberar_horas ADD COLUMN ativo BOOLEAN DEFAULT true;
        UPDATE liberar_horas SET ativo = true WHERE ativo IS NULL;
        RAISE NOTICE 'Coluna ativo adicionada na tabela liberar_horas';
    ELSE
        RAISE NOTICE 'Coluna ativo já existe na tabela liberar_horas';
    END IF;

END $$;

-- Verificar estrutura das tabelas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('horas_justificadas', 'eventos', 'afastados', 'liberar_horas')
AND column_name = 'ativo'
ORDER BY table_name, column_name;
