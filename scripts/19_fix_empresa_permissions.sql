-- Primeiro, vamos verificar se o usuário atual existe e tem role definida
DO $$
DECLARE
    current_user_id uuid;
    user_role text;
BEGIN
    -- Obter o ID do usuário atual
    current_user_id := auth.uid();
    
    IF current_user_id IS NOT NULL THEN
        -- Verificar se o usuário tem role definida
        SELECT raw_user_meta_data->>'role' INTO user_role
        FROM auth.users 
        WHERE id = current_user_id;
        
        -- Se não tem role definida, definir como admin
        IF user_role IS NULL OR user_role = '' THEN
            UPDATE auth.users 
            SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
            WHERE id = current_user_id;
            
            RAISE NOTICE 'Role admin definida para o usuário %', current_user_id;
        ELSE
            RAISE NOTICE 'Usuário % já tem role: %', current_user_id, user_role;
        END IF;
    ELSE
        RAISE NOTICE 'Nenhum usuário autenticado encontrado';
    END IF;
END $$;

-- Verificar o resultado
SELECT 
    id,
    email,
    raw_user_meta_data,
    (raw_user_meta_data->>'role') as user_role
FROM auth.users 
WHERE id = auth.uid();
