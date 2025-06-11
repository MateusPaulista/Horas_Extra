-- Script para testar a criação de usuários usando as funções

-- Criar um usuário de teste (execute apenas se você for admin)
SELECT create_user(
  'usuario@teste.com',
  'senha123',
  'Usuário Teste',
  'user'
);

-- Criar um gerente de teste
SELECT create_user(
  'gerente@teste.com',
  'senha123',
  'Gerente Teste',
  'manager'
);

-- Listar todos os usuários
SELECT * FROM list_users();

-- Verificar se os usuários foram criados corretamente
SELECT 
  'Usuários criados' as status,
  u.id,
  u.email,
  u.raw_user_meta_data,
  u.email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users u
WHERE u.email IN ('usuario@teste.com', 'gerente@teste.com', 'admin@clockflow.com')
ORDER BY u.created_at;
