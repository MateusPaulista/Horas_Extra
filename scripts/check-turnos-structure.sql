-- Verificar a estrutura da tabela turnos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'turnos' 
ORDER BY ordinal_position;

-- Verificar dados existentes na tabela turnos
SELECT * FROM turnos LIMIT 5;

-- Verificar se existe algum campo que deveria ser inteiro mas está recebendo string
\d turnos;
