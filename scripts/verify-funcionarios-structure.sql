-- Verificar estrutura da tabela funcionarios
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'funcionarios'
ORDER BY ordinal_position;

-- Verificar sequência da tabela funcionarios
SELECT 
    sequencename,
    last_value,
    start_value,
    increment_by
FROM pg_sequences 
WHERE sequencename LIKE '%funcionario%';

-- Verificar constraints e foreign keys
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'funcionarios';

-- Verificar dados existentes
SELECT 
    id,
    nome,
    matricula,
    data_admissao,
    ativo,
    turno_id,
    centro_custo_id,
    created_at
FROM funcionarios 
ORDER BY id DESC 
LIMIT 5;

-- Verificar próximo ID que será gerado
SELECT nextval(pg_get_serial_sequence('funcionarios', 'id')) as proximo_id;
-- Resetar sequência (desfazer o nextval acima)
SELECT setval(pg_get_serial_sequence('funcionarios', 'id'), 
              COALESCE((SELECT MAX(id) FROM funcionarios), 0));
