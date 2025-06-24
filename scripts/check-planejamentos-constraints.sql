-- Verificar todas as constraints da tabela planejamentos
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'planejamentos'::regclass 
AND contype = 'c';

-- Verificar valores únicos existentes na coluna status
SELECT 
    status,
    COUNT(*) as quantidade
FROM planejamentos 
GROUP BY status 
ORDER BY quantidade DESC;

-- Verificar estrutura da coluna status
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'planejamentos' 
AND column_name = 'status';

-- Verificar se existe um tipo ENUM para status
SELECT 
    t.typname,
    e.enumlabel
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname LIKE '%status%' OR t.typname LIKE '%planejamento%'
ORDER BY t.typname, e.enumsortorder;

-- Tentar inserir valores de teste para descobrir quais são aceitos
-- (Este comando pode falhar, mas nos dará informações sobre os valores aceitos)
DO $$
DECLARE
    test_values text[] := ARRAY['ativo', 'inativo', 'Ativo', 'Inativo', 'ATIVO', 'INATIVO', 'planejado', 'concluido', 'pendente', 'em_andamento'];
    val text;
    result_msg text := '';
BEGIN
    FOREACH val IN ARRAY test_values
    LOOP
        BEGIN
            -- Tentar inserir um registro de teste
            INSERT INTO planejamentos (empresa_id, dias_uteis, descricao, data_inicio, data_fim, status)
            VALUES (1, 22, 'Teste de status: ' || val, '2024-01-01', '2024-01-31', val);
            
            result_msg := result_msg || 'ACEITO: ' || val || E'\n';
            
            -- Remover o registro de teste
            DELETE FROM planejamentos WHERE descricao = 'Teste de status: ' || val;
            
        EXCEPTION WHEN OTHERS THEN
            result_msg := result_msg || 'REJEITADO: ' || val || ' - ' || SQLERRM || E'\n';
        END;
    END LOOP;
    
    RAISE NOTICE '%', result_msg;
END $$;
