-- Script seguro para criar a tabela planejamento

-- 1. Verificar se a tabela empresas existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'empresas'
    ) THEN
        RAISE EXCEPTION 'Tabela empresas não existe. Crie primeiro a tabela empresas.';
    END IF;
END $$;

-- 2. Remover tabela planejamento se existir (para recriar limpa)
DROP TABLE IF EXISTS public.planejamento CASCADE;

-- 3. Criar a tabela planejamento
CREATE TABLE public.planejamento (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    mes_ano VARCHAR(7) NOT NULL CHECK (mes_ano ~ '^\d{4}-\d{2}$'),
    dias_uteis INTEGER NOT NULL CHECK (dias_uteis > 0 AND dias_uteis <= 31),
    horas_planejadas INTEGER NOT NULL DEFAULT 0 CHECK (horas_planejadas >= 0),
    horas_extra INTEGER DEFAULT 0 CHECK (horas_extra >= 0),
    horas_atraso INTEGER DEFAULT 0 CHECK (horas_atraso >= 0),
    horas_justificadas INTEGER DEFAULT 0 CHECK (horas_justificadas >= 0),
    horas_realizadas INTEGER DEFAULT 0,
    percentual_atendimento DECIMAL(5,2) DEFAULT 0,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para garantir que data_fim >= data_inicio
    CONSTRAINT check_data_periodo CHECK (data_fim >= data_inicio),
    
    -- Unique constraint para evitar duplicação
    CONSTRAINT unique_empresa_mes_ano UNIQUE(empresa_id, mes_ano)
);

-- 4. Adicionar foreign key constraint (separadamente para melhor controle de erro)
DO $$
BEGIN
    ALTER TABLE public.planejamento 
    ADD CONSTRAINT fk_planejamento_empresa 
    FOREIGN KEY (empresa_id) 
    REFERENCES public.empresas(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE 'Foreign key constraint adicionada com sucesso';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Erro ao adicionar foreign key: %', SQLERRM;
        -- Continuar mesmo se der erro na foreign key
END $$;

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_planejamento_empresa_id ON public.planejamento(empresa_id);
CREATE INDEX IF NOT EXISTS idx_planejamento_mes_ano ON public.planejamento(mes_ano);
CREATE INDEX IF NOT EXISTS idx_planejamento_data_inicio ON public.planejamento(data_inicio);
CREATE INDEX IF NOT EXISTS idx_planejamento_data_fim ON public.planejamento(data_fim);

-- 6. Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_planejamento_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Criar trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_planejamento_updated_at ON public.planejamento;
CREATE TRIGGER trigger_update_planejamento_updated_at
    BEFORE UPDATE ON public.planejamento
    FOR EACH ROW
    EXECUTE FUNCTION update_planejamento_updated_at();

-- 8. Inserir dados de exemplo (apenas se não existirem)
INSERT INTO public.planejamento (
    empresa_id, 
    mes_ano, 
    dias_uteis, 
    horas_planejadas, 
    horas_extra, 
    horas_atraso, 
    horas_justificadas,
    data_inicio, 
    data_fim
) 
SELECT * FROM (VALUES 
    (1, '2024-01', 22, 176, 8, 4, 2, '2024-01-01'::date, '2024-01-31'::date),
    (1, '2024-02', 20, 160, 12, 6, 3, '2024-02-01'::date, '2024-02-29'::date),
    (1, '2024-03', 21, 168, 5, 2, 1, '2024-03-01'::date, '2024-03-31'::date)
) AS dados(empresa_id, mes_ano, dias_uteis, horas_planejadas, horas_extra, horas_atraso, horas_justificadas, data_inicio, data_fim)
WHERE EXISTS (SELECT 1 FROM public.empresas WHERE id = dados.empresa_id)
ON CONFLICT (empresa_id, mes_ano) DO NOTHING;

-- 9. Atualizar campos calculados
UPDATE public.planejamento 
SET 
    horas_realizadas = horas_planejadas + COALESCE(horas_extra, 0) - COALESCE(horas_atraso, 0),
    percentual_atendimento = CASE 
        WHEN horas_planejadas > 0 THEN 
            ROUND(((horas_planejadas + COALESCE(horas_extra, 0) - COALESCE(horas_atraso, 0))::DECIMAL / horas_planejadas) * 100, 2)
        ELSE 0 
    END
WHERE horas_realizadas = 0 OR percentual_atendimento = 0;

-- 10. Verificar resultado final
SELECT 
    'Tabela criada com sucesso!' as status,
    COUNT(*) as total_registros
FROM public.planejamento;

-- 11. Mostrar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'planejamento'
ORDER BY ordinal_position;
