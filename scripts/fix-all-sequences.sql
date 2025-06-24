-- Função genérica para corrigir sequências de todas as tabelas
CREATE OR REPLACE FUNCTION fix_all_sequences()
RETURNS void AS $$
BEGIN
  -- Corrigir sequência da tabela empresas
  PERFORM SETVAL('public.empresas_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.empresas));
  
  -- Corrigir sequência da tabela centro_custos
  PERFORM SETVAL('public.centro_custos_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.centro_custos));
  
  -- Corrigir sequência da tabela funcionarios
  PERFORM SETVAL('public.funcionarios_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.funcionarios));
  
  -- Corrigir sequência da tabela turnos
  PERFORM SETVAL('public.turnos_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.turnos));
  
  -- Corrigir sequência da tabela batidas_ponto
  PERFORM SETVAL('public.batidas_ponto_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.batidas_ponto));
  
  -- Corrigir sequência da tabela parametros
  PERFORM SETVAL('public.parametros_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.parametros));
  
  -- Corrigir sequência da tabela notificacoes
  PERFORM SETVAL('public.notificacoes_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.notificacoes));
  
  RAISE NOTICE 'Todas as sequências foram corrigidas com sucesso!';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função específica para centro de custos
CREATE OR REPLACE FUNCTION fix_centro_custos_sequence()
RETURNS void AS $$
BEGIN
  PERFORM SETVAL('public.centro_custos_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.centro_custos));
  RAISE NOTICE 'Sequência de centro_custos corrigida!';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar estado atual de todas as sequências
SELECT 
  'empresas' as tabela,
  (SELECT MAX(id) FROM empresas) as maior_id,
  currval('empresas_id_seq') as sequencia_atual
UNION ALL
SELECT 
  'centro_custos' as tabela,
  (SELECT MAX(id) FROM centro_custos) as maior_id,
  currval('centro_custos_id_seq') as sequencia_atual
UNION ALL
SELECT 
  'funcionarios' as tabela,
  (SELECT MAX(id) FROM funcionarios) as maior_id,
  currval('funcionarios_id_seq') as sequencia_atual
UNION ALL
SELECT 
  'turnos' as tabela,
  (SELECT MAX(id) FROM turnos) as maior_id,
  currval('turnos_id_seq') as sequencia_atual;

-- Executar correção de todas as sequências (descomente para executar)
-- SELECT fix_all_sequences();
