-- Correção simples e direta da sequência de centro_custos
DO $$
DECLARE
    max_id INTEGER;
BEGIN
    -- Obter o maior ID atual
    SELECT COALESCE(MAX(id), 0) INTO max_id FROM centro_custos;
    
    -- Definir a sequência para o próximo valor
    PERFORM SETVAL('centro_custos_id_seq', max_id + 1);
    
    -- Mostrar informações
    RAISE NOTICE 'Maior ID encontrado: %', max_id;
    RAISE NOTICE 'Sequência definida para: %', max_id + 1;
    RAISE NOTICE 'Sequência de centro_custos corrigida com sucesso!';
END $$;

-- Verificar o resultado
SELECT 
    'centro_custos' as tabela,
    (SELECT MAX(id) FROM centro_custos) as maior_id_tabela,
    currval('centro_custos_id_seq') as proximo_id_sequencia;

-- Criar função RPC para correção automática
CREATE OR REPLACE FUNCTION fix_centro_custos_sequence()
RETURNS void AS $$
DECLARE
    max_id INTEGER;
BEGIN
    SELECT COALESCE(MAX(id), 0) INTO max_id FROM centro_custos;
    PERFORM SETVAL('centro_custos_id_seq', max_id + 1);
    RAISE NOTICE 'Sequência de centro_custos corrigida! Próximo ID: %', max_id + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função auxiliar para setval (caso não exista)
CREATE OR REPLACE FUNCTION setval(sequence_name text, new_value bigint)
RETURNS bigint AS $$
BEGIN
    RETURN SETVAL(sequence_name, new_value);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
