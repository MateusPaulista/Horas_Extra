-- Script para adicionar campo username na tabela auth.users
-- Este script adiciona um campo personalizado para armazenar o nome de usuário

-- Verificar se a coluna raw_user_meta_data existe e contém o campo username
-- O Supabase armazena metadados customizados em raw_user_meta_data como JSONB

-- Função para atualizar o username de um usuário
CREATE OR REPLACE FUNCTION update_user_username(user_id UUID, new_username TEXT)
RETURNS VOID AS $$
BEGIN
  -- Atualizar o raw_user_meta_data para incluir o username
  UPDATE auth.users 
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('username', new_username)
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter o username de um usuário
CREATE OR REPLACE FUNCTION get_user_username(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT raw_user_meta_data->>'username'
    FROM auth.users 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter o username pelo email
CREATE OR REPLACE FUNCTION get_username_by_email(user_email TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT raw_user_meta_data->>'username'
    FROM auth.users 
    WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política RLS para permitir que usuários vejam seus próprios dados
CREATE POLICY "Users can view own username" ON auth.users
  FOR SELECT USING (auth.uid() = id);

-- Política RLS para permitir que usuários atualizem seus próprios dados
CREATE POLICY "Users can update own username" ON auth.users
  FOR UPDATE USING (auth.uid() = id);

-- Comentários para documentação
COMMENT ON FUNCTION update_user_username(UUID, TEXT) IS 'Atualiza o nome de usuário no campo raw_user_meta_data';
COMMENT ON FUNCTION get_user_username(UUID) IS 'Obtém o nome de usuário do campo raw_user_meta_data';
COMMENT ON FUNCTION get_username_by_email(TEXT) IS 'Obtém o nome de usuário pelo email do usuário';

-- Exemplo de uso:
-- SELECT update_user_username('user-uuid-here', 'novo_username');
-- SELECT get_user_username('user-uuid-here');
-- SELECT get_username_by_email('user@example.com');