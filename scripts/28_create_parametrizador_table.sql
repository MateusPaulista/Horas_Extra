-- Criar tabela parametrizador se não existir
CREATE TABLE IF NOT EXISTS parametrizador (
  id SERIAL PRIMARY KEY,
  chave VARCHAR(100) NOT NULL UNIQUE,
  valor TEXT NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50) DEFAULT 'string',
  categoria VARCHAR(50) DEFAULT 'geral',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir parâmetros padrão se não existirem
INSERT INTO parametrizador (chave, valor, descricao, tipo, categoria) VALUES
('tolerancia_entrada', '15', 'Tolerância para entrada em minutos', 'number', 'ponto'),
('tolerancia_saida', '15', 'Tolerância para saída em minutos', 'number', 'ponto'),
('horas_extras_automaticas', 'true', 'Calcular horas extras automaticamente', 'boolean', 'ponto'),
('banco_horas_ativo', 'true', 'Sistema de banco de horas ativo', 'boolean', 'ponto'),
('limite_banco_horas', '40', 'Limite de horas no banco de horas', 'number', 'ponto'),
('notificacao_atraso', 'true', 'Notificar atrasos automaticamente', 'boolean', 'notificacao'),
('email_rh', 'rh@empresa.com', 'Email do departamento de RH', 'email', 'notificacao'),
('dias_backup', '30', 'Dias para manter backup dos dados', 'number', 'sistema'),
('maximo_tentativas_login', '5', 'Máximo de tentativas de login', 'number', 'seguranca'),
('tempo_sessao', '480', 'Tempo de sessão em minutos', 'number', 'seguranca')
ON CONFLICT (chave) DO NOTHING;

-- Criar políticas RLS
ALTER TABLE parametrizador ENABLE ROW LEVEL SECURITY;

-- Política para SELECT (todos os usuários autenticados podem ler)
CREATE POLICY parametrizador_select ON parametrizador 
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Política para INSERT/UPDATE/DELETE (apenas admins)
CREATE POLICY parametrizador_insert ON parametrizador 
FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY parametrizador_update ON parametrizador 
FOR UPDATE USING (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY parametrizador_delete ON parametrizador 
FOR DELETE USING (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  )
);

-- Verificar se a tabela foi criada
SELECT 'Tabela parametrizador criada com sucesso!' as resultado;
SELECT COUNT(*) as total_parametros FROM parametrizador;
