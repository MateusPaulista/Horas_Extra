-- Script para forçar correção da sequência centro_custos
-- Execute este script IMEDIATAMENTE no SQL Editor do Supabase

-- 1. Verificar estado atual
DO $$
DECLARE
    max_id INTEGER;
    seq_val INTEGER;
BEGIN
    -- Obter maior ID
    SELECT COALESCE(MAX(id), 0) INTO max_id FROM centro_custos;
    
    -- Obter valor atual da sequência
    SELECT last_value INTO seq_val FROM centro_custos_id_seq;
    
    RAISE NOTICE 'Maior ID na tabela: %', max_id;
    RAISE NOTICE 'Valor atual da sequência: %', seq_val;
    
    -- Forçar correção da sequência
    PERFORM SETVAL('centro_custos_id_seq', max_id + 1, false);
    
    -- Verificar correção
    SELECT last_value INTO seq_val FROM centro_custos_id_seq;
    RAISE NOTICE 'Novo valor da sequência: %', seq_val;
    
    RAISE NOTICE 'Sequência corrigida com sucesso!';
END $$;

-- 2. Criar função para correção automática (se não existir)
CREATE OR REPLACE FUNCTION fix_centro_custos_sequence()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    max_id INTEGER;
BEGIN
    SELECT COALESCE(MAX(id), 0) INTO max_id FROM centro_custos;
    PERFORM SETVAL('centro_custos_id_seq', max_id + 1, false);
END $$;

-- 3. Executar correção
SELECT fix_centro_custos_sequence();

-- 4. Verificar resultado final
SELECT 
    'VERIFICAÇÃO FINAL' as status,
    (SELECT MAX(id) FROM centro_custos) as max_id_tabela,
    (SELECT last_value FROM centro_custos_id_seq) as proximo_id_sequencia,
    CASE 
        WHEN (SELECT last_value FROM centro_custos_id_seq) > (SELECT COALESCE(MAX(id), 0) FROM centro_custos)
        THEN 'SEQUÊNCIA OK ✓'
        ELSE 'SEQUÊNCIA AINDA COM PROBLEMA ✗'
    END as resultado;

-- 5. Testar inserção (opcional - descomente para testar)
-- INSERT INTO centro_custos (nome, codigo, empresa_id) 
-- VALUES ('TESTE_SEQUENCIA', 'TST001', 1);
-- 
-- -- Remover teste
-- DELETE FROM centro_custos WHERE nome = 'TESTE_SEQUENCIA';
