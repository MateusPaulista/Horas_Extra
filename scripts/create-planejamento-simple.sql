-- Script simples e direto para criar a tabela planejamento

-- 1. Verificar se a tabela empresas existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'empresas') 
        THEN 'Tabela empresas existe ✅'
        ELSE 'Tabela empresas NÃO existe ❌'
    END as status_empresas;

-- 2. Criar a tabela planejamento (DROP se existir)
DROP TABLE IF EXISTS planejamento;

CREATE TABLE planejamento (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    mes_ano VARCHAR(7) NOT NULL,
    dias_uteis INTEGER NOT NULL,
    horas_planejadas INTEGER NOT NULL DEFAULT 0,
    horas_extra INTEGER DEFAULT 0,
    horas_atraso INTEGER DEFAULT 0,
    horas_justificadas INTEGER DEFAULT 0,
    horas_realizadas INTEGER DEFAULT 0,
    percentual_atendimento DECIMAL(5,2) DEFAULT 0,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Adicionar foreign key se a tabela empresas existir
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'empresas') THEN
        ALTER TABLE planejamento 
        ADD CONSTRAINT fk_planejamento_empresa 
        FOREIGN KEY (empresa_id) REFERENCES empresas(id);
        
        RAISE NOTICE 'Foreign key adicionada ✅';
    ELSE
        RAISE NOTICE 'Tabela empresas não existe, foreign key não adicionada ⚠️';
    END IF;
END $$;

-- 4. Criar índices
CREATE INDEX idx_planejamento_empresa_id ON planejamento(empresa_id);
CREATE INDEX idx_planejamento_mes_ano ON planejamento(mes_ano);

-- 5. Inserir dados de exemplo
INSERT INTO planejamento (
    empresa_id, mes_ano, dias_uteis, horas_planejadas, 
    horas_extra, horas_atraso, horas_justificadas,
    data_inicio, data_fim
) VALUES 
(1, '2024-01', 22, 176, 8, 4, 2, '2024-01-01', '2024-01-31'),
(1, '2024-02', 20, 160, 12, 6, 3, '2024-02-01', '2024-02-29'),
(1, '2024-03', 21, 168, 5, 2, 1, '2024-03-01', '2024-03-31');

-- 6. Atualizar campos calculados
UPDATE planejamento 
SET 
    horas_realizadas = horas_planejadas + horas_extra - horas_atraso,
    percentual_atendimento = ROUND(((horas_planejadas + horas_extra - horas_atraso)::DECIMAL / horas_planejadas) * 100, 2);

-- 7. Verificar resultado
SELECT 'Tabela criada com sucesso! ✅' as status;
SELECT COUNT(*) as total_registros FROM planejamento;
SELECT * FROM planejamento ORDER BY mes_ano DESC;
