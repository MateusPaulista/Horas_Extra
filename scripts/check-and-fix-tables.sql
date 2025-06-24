-- Verificar e corrigir estrutura das tabelas

-- Verificar se as tabelas existem e suas colunas
DO $$
BEGIN
    -- Verificar tabela liberar_horas
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'liberar_horas') THEN
        CREATE TABLE liberar_horas (
            id SERIAL PRIMARY KEY,
            empresa_id INTEGER NOT NULL,
            centro_custo_id INTEGER NOT NULL,
            id_funcionario INTEGER NOT NULL,
            tipo_liberacao INTEGER NOT NULL CHECK (tipo_liberacao IN (1,2,3,4,5)),
            data_liberacao DATE NOT NULL,
            horas_lib DECIMAL(5,2) NOT NULL,
            motivo TEXT,
            ativo BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Adicionar coluna ativo se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'liberar_horas' AND column_name = 'ativo') THEN
        ALTER TABLE liberar_horas ADD COLUMN ativo BOOLEAN DEFAULT true;
    END IF;

    -- Verificar tabela afastados
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'afastados') THEN
        CREATE TABLE afastados (
            id SERIAL PRIMARY KEY,
            id_empresa INTEGER NOT NULL,
            id_funcionario INTEGER NOT NULL,
            data_inicio DATE NOT NULL,
            data_fim DATE NOT NULL,
            motivo TEXT NOT NULL,
            observacoes TEXT,
            ativo BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Adicionar coluna ativo se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'afastados' AND column_name = 'ativo') THEN
        ALTER TABLE afastados ADD COLUMN ativo BOOLEAN DEFAULT true;
    END IF;

    -- Verificar tabela horas_justificadas
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'horas_justificadas') THEN
        CREATE TABLE horas_justificadas (
            id SERIAL PRIMARY KEY,
            empresa_id INTEGER NOT NULL,
            centro_custo_id INTEGER NOT NULL,
            id_funcionario INTEGER NOT NULL,
            data_hora_ini TIMESTAMP WITH TIME ZONE NOT NULL,
            data_hora_fim TIMESTAMP WITH TIME ZONE NOT NULL,
            observacoes TEXT,
            ativo BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Adicionar coluna ativo se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'horas_justificadas' AND column_name = 'ativo') THEN
        ALTER TABLE horas_justificadas ADD COLUMN ativo BOOLEAN DEFAULT true;
    END IF;

    -- Verificar tabela eventos
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'eventos') THEN
        CREATE TABLE eventos (
            id SERIAL PRIMARY KEY,
            empresa_id INTEGER NOT NULL,
            centro_custo_id INTEGER NOT NULL,
            id_funcionario INTEGER NOT NULL,
            data_evento DATE NOT NULL,
            descricao VARCHAR(100) NOT NULL,
            qtd_horas DECIMAL(5,2) NOT NULL,
            tipo_horas INTEGER NOT NULL CHECK (tipo_horas IN (1,2)),
            ativo BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Adicionar coluna ativo se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'eventos' AND column_name = 'ativo') THEN
        ALTER TABLE eventos ADD COLUMN ativo BOOLEAN DEFAULT true;
    END IF;

    -- Adicionar coluna data_evento se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'eventos' AND column_name = 'data_evento') THEN
        ALTER TABLE eventos ADD COLUMN data_evento DATE NOT NULL DEFAULT CURRENT_DATE;
    END IF;

END $$;

-- Atualizar registros existentes para ativo = true se for null
UPDATE liberar_horas SET ativo = true WHERE ativo IS NULL;
UPDATE afastados SET ativo = true WHERE ativo IS NULL;
UPDATE horas_justificadas SET ativo = true WHERE ativo IS NULL;
UPDATE eventos SET ativo = true WHERE ativo IS NULL;
