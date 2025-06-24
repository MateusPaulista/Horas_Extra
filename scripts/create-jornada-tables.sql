-- Criação das tabelas para controle de jornada

-- 1. Tabela para Liberação de Horas Extras
CREATE TABLE IF NOT EXISTS liberacao_horas_extras (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id),
    centro_custo_id INTEGER NOT NULL REFERENCES centro_custos(id),
    funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id),
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    ativo BOOLEAN DEFAULT true,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela para Afastamentos
CREATE TABLE IF NOT EXISTS afastamentos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id),
    centro_custo_id INTEGER NOT NULL REFERENCES centro_custos(id),
    funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id),
    motivo TEXT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    ativo BOOLEAN DEFAULT true,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela para Horas Justificadas
CREATE TABLE IF NOT EXISTS horas_justificadas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id),
    centro_custo_id INTEGER NOT NULL REFERENCES centro_custos(id),
    funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id),
    tipo_justificativa VARCHAR(100) NOT NULL,
    documento TEXT, -- pode ser URL do arquivo ou texto
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    horas_abonadas DECIMAL(5,2) DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela para Horas Extra / Horas a Pagar
CREATE TABLE IF NOT EXISTS horas_extras_pagar (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL, -- 'Feriado', 'Sábado', 'Ponte', 'Outros'
    data_evento DATE NOT NULL,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id),
    centro_custo_id INTEGER REFERENCES centro_custos(id), -- opcional
    funcionario_id INTEGER REFERENCES funcionarios(id), -- opcional
    quantidade_horas DECIMAL(5,2) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_liberacao_horas_extras_empresa ON liberacao_horas_extras(empresa_id);
CREATE INDEX IF NOT EXISTS idx_liberacao_horas_extras_funcionario ON liberacao_horas_extras(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_liberacao_horas_extras_periodo ON liberacao_horas_extras(data_inicio, data_fim);

CREATE INDEX IF NOT EXISTS idx_afastamentos_empresa ON afastamentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_afastamentos_funcionario ON afastamentos(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_afastamentos_periodo ON afastamentos(data_inicio, data_fim);

CREATE INDEX IF NOT EXISTS idx_horas_justificadas_empresa ON horas_justificadas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_horas_justificadas_funcionario ON horas_justificadas(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_horas_justificadas_periodo ON horas_justificadas(data_inicio, data_fim);

CREATE INDEX IF NOT EXISTS idx_horas_extras_pagar_empresa ON horas_extras_pagar(empresa_id);
CREATE INDEX IF NOT EXISTS idx_horas_extras_pagar_data ON horas_extras_pagar(data_evento);
CREATE INDEX IF NOT EXISTS idx_horas_extras_pagar_tipo ON horas_extras_pagar(tipo);

-- Comentários nas tabelas
COMMENT ON TABLE liberacao_horas_extras IS 'Funcionários autorizados a realizar horas extras';
COMMENT ON TABLE afastamentos IS 'Registro de afastamentos de funcionários';
COMMENT ON TABLE horas_justificadas IS 'Justificativas de ausência com documentos';
COMMENT ON TABLE horas_extras_pagar IS 'Registro de horas extras em feriados, sábados, etc.';
