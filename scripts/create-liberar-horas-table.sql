-- Criar tabela liberar_horas conforme especificação
CREATE TABLE IF NOT EXISTS liberar_horas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id),
    centro_custo_id INTEGER NOT NULL REFERENCES centro_custos(id),
    id_funcionario INTEGER NOT NULL REFERENCES funcionarios(id),
    tipo_liberacao INTEGER NOT NULL CHECK (tipo_liberacao IN (1, 2, 3, 4, 5)),
    data_liberacao DATE NOT NULL,
    horas_lib DECIMAL(5,2) NOT NULL,
    motivo TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_liberar_horas_empresa ON liberar_horas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_liberar_horas_centro_custo ON liberar_horas(centro_custo_id);
CREATE INDEX IF NOT EXISTS idx_liberar_horas_funcionario ON liberar_horas(id_funcionario);
CREATE INDEX IF NOT EXISTS idx_liberar_horas_data ON liberar_horas(data_liberacao);
CREATE INDEX IF NOT EXISTS idx_liberar_horas_ativo ON liberar_horas(ativo);

-- Comentários para documentação
COMMENT ON TABLE liberar_horas IS 'Tabela para controle de liberação de horas extras';
COMMENT ON COLUMN liberar_horas.tipo_liberacao IS '1=Dia, 2=Semana, 3=Mês, 4=Ano, 5=Todos os dias';
COMMENT ON COLUMN liberar_horas.horas_lib IS 'Quantidade de horas liberadas para trabalho extra';
