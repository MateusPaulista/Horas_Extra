-- Verificar e corrigir estrutura das tabelas

-- 1. Verificar se as tabelas existem e suas colunas
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('liberar_horas', 'afastados', 'horas_justificadas', 'eventos')
ORDER BY table_name, ordinal_position;

-- 2. Adicionar coluna ativo se não existir
DO $$ 
BEGIN
    -- liberar_horas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'liberar_horas' AND column_name = 'ativo') THEN
        ALTER TABLE liberar_horas ADD COLUMN ativo BOOLEAN DEFAULT true;
    END IF;
    
    -- afastados
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'afastados' AND column_name = 'ativo') THEN
        ALTER TABLE afastados ADD COLUMN ativo BOOLEAN DEFAULT true;
    END IF;
    
    -- horas_justificadas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'horas_justificadas' AND column_name = 'ativo') THEN
        ALTER TABLE horas_justificadas ADD COLUMN ativo BOOLEAN DEFAULT true;
    END IF;
    
    -- eventos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos' AND column_name = 'ativo') THEN
        ALTER TABLE eventos ADD COLUMN ativo BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 3. Atualizar registros existentes para ativo = true
UPDATE liberar_horas SET ativo = true WHERE ativo IS NULL;
UPDATE afastados SET ativo = true WHERE ativo IS NULL;
UPDATE horas_justificadas SET ativo = true WHERE ativo IS NULL;
UPDATE eventos SET ativo = true WHERE ativo IS NULL;
