-- Primeiro, vamos verificar se a tabela já existe e removê-la se necessário
DROP TABLE IF EXISTS planejamento CASCADE;

-- Criar a tabela planejamento com a foreign key correta
CREATE TABLE planejamento (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    mes_ano VARCHAR(7) NOT NULL, -- YYYY-MM
    dias_uteis INTEGER NOT NULL CHECK (dias_uteis > 0),
    horas_planejadas INTEGER NOT NULL DEFAULT 0,
    horas_extra INTEGER DEFAULT 0,
    horas_atraso INTEGER DEFAULT 0,
    horas_justificadas INTEGER DEFAULT 0,
    horas_realizadas INTEGER DEFAULT 0,
    percentual_atendimento DECIMAL(5,2) DEFAULT 0,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_planejamento_empresa 
        FOREIGN KEY (empresa_id) 
        REFERENCES empresas(id) 
        ON DELETE CASCADE,
    
    -- Unique constraint para evitar duplicação
    CONSTRAINT unique_empresa_mes_ano 
        UNIQUE(empresa_id, mes_ano)
);

-- Criar índices para melhor performance
CREATE INDEX idx_planejamento_empresa_id ON planejamento(empresa_id);
CREATE INDEX idx_planejamento_mes_ano ON planejamento(mes_ano);
CREATE INDEX idx_planejamento_data_inicio ON planejamento(data_inicio);

-- Inserir alguns dados de exemplo para teste
INSERT INTO planejamento (
    empresa_id, 
    mes_ano, 
    dias_uteis, 
    horas_planejadas, 
    horas_extra, 
    horas_atraso, 
    horas_justificadas,
    data_inicio, 
    data_fim
) VALUES 
(1, '2024-01', 22, 176, 8, 4, 2, '2024-01-01', '2024-01-31'),
(1, '2024-02', 20, 160, 12, 6, 3, '2024-02-01', '2024-02-29'),
(2, '2024-01', 21, 168, 5, 2, 1, '2024-01-01', '2024-01-31')
ON CONFLICT (empresa_id, mes_ano) DO NOTHING;

-- Atualizar campos calculados
UPDATE planejamento 
SET 
    horas_realizadas = horas_planejadas + horas_extra - horas_atraso,
    percentual_atendimento = CASE 
        WHEN horas_planejadas > 0 THEN 
            ROUND(((horas_planejadas + horas_extra - horas_atraso)::DECIMAL / horas_planejadas) * 100, 2)
        ELSE 0 
    END;
