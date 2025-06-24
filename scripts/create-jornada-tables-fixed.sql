-- Criação das tabelas para controle de jornada (versão corrigida)

-- 1. Tabela para Liberação de Horas Extras
CREATE TABLE IF NOT EXISTS liberacao_horas_extras (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    centro_custo_id INTEGER NOT NULL,
    funcionario_id INTEGER NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    ativo BOOLEAN DEFAULT true,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign keys (sem REFERENCES para evitar erro se tabelas não existirem)
    CONSTRAINT fk_liberacao_empresa 
        FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    CONSTRAINT fk_liberacao_centro_custo 
        FOREIGN KEY (centro_custo_id) REFERENCES centro_custos(id) ON DELETE CASCADE,
    CONSTRAINT fk_liberacao_funcionario 
        FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id) ON DELETE CASCADE
);

-- 2. Tabela para Afastamentos
CREATE TABLE IF NOT EXISTS afastamentos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    centro_custo_id INTEGER NOT NULL,
    funcionario_id INTEGER NOT NULL,
    motivo TEXT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    ativo BOOLEAN DEFAULT true,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_afastamento_empresa 
        FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    CONSTRAINT fk_afastamento_centro_custo 
        FOREIGN KEY (centro_custo_id) REFERENCES centro_custos(id) ON DELETE CASCADE,
    CONSTRAINT fk_afastamento_funcionario 
        FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id) ON DELETE CASCADE
);

-- 3. Tabela para Horas Justificadas
CREATE TABLE IF NOT EXISTS horas_justificadas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    centro_custo_id INTEGER NOT NULL,
    funcionario_id INTEGER NOT NULL,
    tipo_justificativa VARCHAR(100) NOT NULL,
    documento TEXT,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    horas_abonadas DECIMAL(5,2) DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_horas_justificadas_empresa 
        FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    CONSTRAINT fk_horas_justificadas_centro_custo 
        FOREIGN KEY (centro_custo_id) REFERENCES centro_custos(id) ON DELETE CASCADE,
    CONSTRAINT fk_horas_justificadas_funcionario 
        FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id) ON DELETE CASCADE
);

-- 4. Tabela para Horas Extra / Horas a Pagar
CREATE TABLE IF NOT EXISTS horas_extras_pagar (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    data_evento DATE NOT NULL,
    empresa_id INTEGER NOT NULL,
    centro_custo_id INTEGER,
    funcionario_id INTEGER,
    quantidade_horas DECIMAL(5,2) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_horas_extras_empresa 
        FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    CONSTRAINT fk_horas_extras_centro_custo 
        FOREIGN KEY (centro_custo_id) REFERENCES centro_custos(id) ON DELETE SET NULL,
    CONSTRAINT fk_horas_extras_funcionario 
        FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id) ON DELETE SET NULL
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

-- Inserir dados de exemplo (opcional)
INSERT INTO liberacao_horas_extras (empresa_id, centro_custo_id, funcionario_id, data_inicio, data_fim, observacoes)
SELECT 
    e.id as empresa_id,
    cc.id as centro_custo_id,
    f.id as funcionario_id,
    CURRENT_DATE as data_inicio,
    CURRENT_DATE + INTERVAL '30 days' as data_fim,
    'Liberação automática para teste'
FROM empresas e
JOIN centro_custos cc ON cc.empresa_id = e.id
JOIN funcionarios f ON f.centro_custo_id = cc.id
WHERE f.ativo = true
LIMIT 3
ON CONFLICT DO NOTHING;

SELECT 'Tabelas de jornada criadas com sucesso!' as resultado;
