-- Criar todas as tabelas necessárias para o sistema de jornada

-- 1. Tabela liberar_horas
CREATE TABLE IF NOT EXISTS liberar_horas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id),
    centro_custo_id INTEGER NOT NULL REFERENCES centro_custos(id),
    id_funcionario INTEGER NOT NULL REFERENCES funcionarios(id),
    tipo_liberacao INTEGER NOT NULL CHECK (tipo_liberacao IN (1,2,3,4,5)),
    data_liberacao DATE NOT NULL,
    horas_lib DECIMAL(5,2) NOT NULL,
    motivo TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela afastados
CREATE TABLE IF NOT EXISTS afastados (
    id SERIAL PRIMARY KEY,
    id_empresa INTEGER NOT NULL REFERENCES empresas(id),
    id_funcionario INTEGER NOT NULL REFERENCES funcionarios(id),
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    motivo TEXT NOT NULL,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela horas_justificadas
CREATE TABLE IF NOT EXISTS horas_justificadas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id),
    centro_custo_id INTEGER NOT NULL REFERENCES centro_custos(id),
    id_funcionario INTEGER NOT NULL REFERENCES funcionarios(id),
    data_hora_ini TIMESTAMP WITH TIME ZONE NOT NULL,
    data_hora_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela eventos
CREATE TABLE IF NOT EXISTS eventos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id),
    centro_custo_id INTEGER NOT NULL REFERENCES centro_custos(id),
    id_funcionario INTEGER NOT NULL REFERENCES funcionarios(id),
    data_evento DATE NOT NULL,
    descricao VARCHAR(100) NOT NULL,
    qtd_horas DECIMAL(5,2) NOT NULL,
    tipo_horas INTEGER NOT NULL CHECK (tipo_horas IN (1,2)),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_liberar_horas_empresa ON liberar_horas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_liberar_horas_funcionario ON liberar_horas(id_funcionario);
CREATE INDEX IF NOT EXISTS idx_liberar_horas_data ON liberar_horas(data_liberacao);

CREATE INDEX IF NOT EXISTS idx_afastados_empresa ON afastados(id_empresa);
CREATE INDEX IF NOT EXISTS idx_afastados_funcionario ON afastados(id_funcionario);
CREATE INDEX IF NOT EXISTS idx_afastados_periodo ON afastados(data_inicio, data_fim);

CREATE INDEX IF NOT EXISTS idx_horas_justificadas_empresa ON horas_justificadas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_horas_justificadas_funcionario ON horas_justificadas(id_funcionario);
CREATE INDEX IF NOT EXISTS idx_horas_justificadas_periodo ON horas_justificadas(data_hora_ini, data_hora_fim);

CREATE INDEX IF NOT EXISTS idx_eventos_empresa ON eventos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_eventos_funcionario ON eventos(id_funcionario);
CREATE INDEX IF NOT EXISTS idx_eventos_data ON eventos(data_evento);

-- Comentários nas tabelas
COMMENT ON TABLE liberar_horas IS 'Liberações de horas extras para funcionários';
COMMENT ON TABLE afastados IS 'Registro de funcionários afastados';
COMMENT ON TABLE horas_justificadas IS 'Justificativas de ausência com documentos';
COMMENT ON TABLE eventos IS 'Eventos especiais e horas extras';
