-- Script para limpar dados de teste e manter apenas estrutura real

-- Limpar dados de teste das tabelas principais
DELETE FROM ponto WHERE id_matricula IN (
  SELECT id_matricula FROM funcionario WHERE matricula LIKE 'FUN%'
);

DELETE FROM planejamento WHERE id_matricula IN (
  SELECT id_matricula FROM funcionario WHERE matricula LIKE 'FUN%'
);

DELETE FROM funcionario WHERE matricula LIKE 'FUN%';

DELETE FROM centro_custo WHERE codigo LIKE 'CC%';

DELETE FROM turno WHERE nome IN ('Manhã', 'Tarde', 'Noite');

DELETE FROM empresa WHERE cod_estabel LIKE 'EMP%';

-- Resetar sequências se necessário
-- ALTER SEQUENCE IF EXISTS empresa_id_empresa_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS centro_custo_id_centro_custo_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS turno_id_turno_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS funcionario_id_matricula_seq RESTART WITH 1;

-- Verificar se as tabelas estão vazias
SELECT 'empresa' as tabela, COUNT(*) as registros FROM empresa
UNION ALL
SELECT 'centro_custo' as tabela, COUNT(*) as registros FROM centro_custo
UNION ALL
SELECT 'turno' as tabela, COUNT(*) as registros FROM turno
UNION ALL
SELECT 'funcionario' as tabela, COUNT(*) as registros FROM funcionario
UNION ALL
SELECT 'planejamento' as tabela, COUNT(*) as registros FROM planejamento
UNION ALL
SELECT 'ponto' as tabela, COUNT(*) as registros FROM ponto;

-- Confirmar que as tabelas estão prontas para dados reais
SELECT 'Dados de teste removidos. Sistema pronto para dados reais.' as status;
