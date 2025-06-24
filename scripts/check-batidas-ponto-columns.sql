-- Verificar a estrutura completa da tabela batidas_ponto
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'batidas_ponto' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se existe campo 'data' ou similar
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'batidas_ponto' 
  AND table_schema = 'public'
  AND column_name LIKE '%data%';

-- Verificar alguns registros de exemplo
SELECT 
  id,
  funcionario_id,
  created_at,
  B1, B2, B3, B4, B5, B6, B7, B8
FROM batidas_ponto 
ORDER BY created_at DESC 
LIMIT 5;
