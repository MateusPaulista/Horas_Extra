-- Script para resetar completamente a sequência de centro_custos
-- Execute este script no SQL Editor do Supabase

-- 1. Ver estado atual
SELECT 
    'ANTES DA CORREÇÃO' as momento,
    (SELECT MAX(id) FROM centro_custos) as max_id_tabela,
    (SELECT last_value FROM centro_custos_id_seq) as sequencia_atual,
    (SELECT is_called FROM centro_custos_id_seq) as sequencia_foi_chamada;

-- 2. Resetar a sequência para o valor correto
-- Isso garante que o próximo valor será maior que qualquer ID existente
SELECT SETVAL('centro_custos_id_seq', COALESCE((SELECT MAX(id) FROM centro_custos), 0) + 1, false);

-- 3. Ver estado após correção
SELECT 
    'APÓS CORREÇÃO' as momento,
    (SELECT MAX(id) FROM centro_custos) as max_id_tabela,
    (SELECT last_value FROM centro_custos_id_seq) as sequencia_atual,
    (SELECT is_called FROM centro_custos_id_seq) as sequencia_foi_chamada;

-- 4. Testar o próximo valor (isso vai incrementar a sequência)
SELECT 
    'TESTE - PRÓXIMO VALOR' as momento,
    nextval('centro_custos_id_seq') as proximo_id;

-- 5. Resetar novamente para o valor correto após o teste
SELECT SETVAL('centro_custos_id_seq', COALESCE((SELECT MAX(id) FROM centro_custos), 0) + 1, false);

-- 6. Estado final
SELECT 
    'ESTADO FINAL' as momento,
    (SELECT MAX(id) FROM centro_custos) as max_id_tabela,
    (SELECT last_value FROM centro_custos_id_seq) as proximo_id_disponivel,
    'Sequência pronta para uso' as status;

-- Opcional: Limpar registros duplicados se existirem
-- CUIDADO: Execute apenas se tiver certeza de que há duplicatas
-- DELETE FROM centro_custos 
-- WHERE id IN (
--     SELECT id FROM (
--         SELECT id, ROW_NUMBER() OVER (PARTITION BY nome, empresa_id ORDER BY id) as rn
--         FROM centro_custos
--     ) t WHERE rn > 1
-- );
