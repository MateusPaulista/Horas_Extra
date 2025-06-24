-- Criar/atualizar tabela afastados
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

-- Criar/atualizar tabela horas_justificadas
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

-- Criar/atualizar tabela eventos
CREATE TABLE IF NOT EXISTS eventos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id),
    centro_custo_id INTEGER NOT NULL REFERENCES centro_custos(id),
    id_funcionario INTEGER NOT NULL REFERENCES funcionarios(id),
    descricao TEXT NOT NULL CHECK (descricao IN ('Pagamento de Ponte', 'Sábado de Hora Extra', 'Ponte', 'Feriado', 'Feriado Hora Extra', 'Abono de Horas')),
    qtd_horas DECIMAL(5,2) NOT NULL,
    tipo_horas INTEGER NOT NULL CHECK (tipo_horas IN (1, 2)), -- 1=Gerar como Extra, 2=Considerar como Dia Útil
    data_evento DATE NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_afastados_empresa ON afastados(id_empresa);
CREATE INDEX IF NOT EXISTS idx_afastados_funcionario ON afastados(id_funcionario);
CREATE INDEX IF NOT EXISTS idx_afastados_ativo ON afastados(ativo);

CREATE INDEX IF NOT EXISTS idx_horas_justificadas_empresa ON horas_justificadas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_horas_justificadas_centro_custo ON horas_justificadas(centro_custo_id);
CREATE INDEX IF NOT EXISTS idx_horas_justificadas_funcionario ON horas_justificadas(id_funcionario);
CREATE INDEX IF NOT EXISTS idx_horas_justificadas_ativo ON horas_justificadas(ativo);

CREATE INDEX IF NOT EXISTS idx_eventos_empresa ON eventos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_eventos_centro_custo ON eventos(centro_custo_id);
CREATE INDEX IF NOT EXISTS idx_eventos_funcionario ON eventos(id_funcionario);
CREATE INDEX IF NOT EXISTS idx_eventos_ativo ON eventos(ativo);

-- Comentários nas tabelas
COMMENT ON TABLE afastados IS 'Tabela para registrar afastamentos de funcionários';
COMMENT ON TABLE horas_justificadas IS 'Tabela para registrar justificativas de horas';
COMMENT ON TABLE eventos IS 'Tabela para registrar eventos especiais (ex-horas extras a pagar)';
