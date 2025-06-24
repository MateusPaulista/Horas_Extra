-- Verificar se a tabela planejamento existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'planejamento'
) as table_exists;

-- Verificar estrutura da tabela empresas para garantir compatibilidade
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'empresas'
ORDER BY ordinal_position;
