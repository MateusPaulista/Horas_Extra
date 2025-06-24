-- Correção manual da sequência de centro_custos
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar o estado atual
SELECT 
    'Estado Atual' as status,
    (SELECT MAX(id) FROM centro_custos) as maior_id_tabela,
    (SELECT last_value FROM centro_custos_id_seq) as ultimo_valor_sequencia;

-- 2. Corrigir a sequência
SELECT SETVAL('centro_custos_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM centro_custos));

-- 3. Verificar após correção
SELECT 
    'Após Correção' as status,
    (SELECT MAX(id) FROM centro_custos) as maior_id_tabela,
    (SELECT last_value FROM centro_custos_id_seq) as ultimo_valor_sequencia;

-- 4. Testar a sequência
SELECT 
    'Teste da Sequência' as status,
    nextval('centro_custos_id_seq') as proximo_id;

-- 5. Resetar a sequência para o valor correto após o teste
SELECT SETVAL('centro_custos_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM centro_custos));

-- Mostrar resultado final
SELECT 
    'Resultado Final' as status,
    (SELECT MAX(id) FROM centro_custos) as maior_id_tabela,
    (SELECT last_value FROM centro_custos_id_seq) as proximo_id_disponivel;
