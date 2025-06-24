-- Função para corrigir a sequência da tabela empresas
CREATE OR REPLACE FUNCTION fix_empresas_sequence()
RETURNS void AS $$
BEGIN
  -- Corrigir a sequência da tabela empresas
  PERFORM SETVAL('public.empresas_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.empresas));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função genérica para resetar sequências
CREATE OR REPLACE FUNCTION reset_sequence(table_name text, sequence_name text, next_value integer)
RETURNS void AS $$
BEGIN
  -- Resetar a sequência para o próximo valor disponível
  PERFORM SETVAL(sequence_name, next_value);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar o estado atual da sequência
SELECT 
  'empresas' as tabela,
  MAX(id) as maior_id,
  nextval('empresas_id_seq') as proximo_id_sequencia
FROM empresas;

-- Resetar a sequência para o valor correto (execute apenas se necessário)
-- SELECT SETVAL('public.empresas_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.empresas));
