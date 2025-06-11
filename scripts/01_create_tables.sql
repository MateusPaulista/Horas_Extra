-- Criação das tabelas para o sistema ClockFlow no Supabase
-- Execute este script primeiro

-- Habilitar extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela Empresa
CREATE TABLE IF NOT EXISTS empresa (
  id_empresa UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cod_estabel VARCHAR(20) NOT NULL UNIQUE,
  descricao VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Turno
CREATE TABLE IF NOT EXISTS turno (
  id_turno UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  hr_entrada TIME NOT NULL,
  hr_saida TIME NOT NULL,
  tempo_refeicao INTEGER NOT NULL, -- em minutos
  id_empresa UUID NOT NULL REFERENCES empresa(id_empresa) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Centro_Custo
CREATE TABLE IF NOT EXISTS centro_custo (
  id_centro UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(20) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  id_empresa UUID NOT NULL REFERENCES empresa(id_empresa) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(codigo, id_empresa)
);

-- Tabela Parametrizador
CREATE TABLE IF NOT EXISTS parametrizador (
  id_parametro UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_user UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  limite_extra_dia DECIMAL(5,2) DEFAULT 2.0,
  limite_falta DECIMAL(5,2) DEFAULT 8.0,
  limite_extra_mes DECIMAL(5,2) DEFAULT 40.0,
  limite_atras_dia DECIMAL(5,2) DEFAULT 0.5,
  status BOOLEAN DEFAULT TRUE,
  data_parametro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  id_centro UUID REFERENCES centro_custo(id_centro),
  push_ativo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Funcionario
CREATE TABLE IF NOT EXISTS funcionario (
  id_matricula UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matricula VARCHAR(20) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  id_turno UUID NOT NULL REFERENCES turno(id_turno),
  id_centro UUID NOT NULL REFERENCES centro_custo(id_centro),
  data_adm DATE NOT NULL,
  data_demis DATE,
  foto_url VARCHAR(255),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(matricula, id_centro)
);

-- Tabela Ponto
CREATE TABLE IF NOT EXISTS ponto (
  id SERIAL PRIMARY KEY,
  id_matricula UUID NOT NULL REFERENCES funcionario(id_matricula) ON DELETE CASCADE,
  id_turno UUID NOT NULL REFERENCES turno(id_turno),
  id_centro UUID NOT NULL REFERENCES centro_custo(id_centro),
  data DATE NOT NULL,
  batida1 TIME,
  batida2 TIME,
  batida3 TIME,
  batida4 TIME,
  batida5 TIME,
  batida6 TIME,
  batida7 TIME,
  batida8 TIME,
  total_horas DECIMAL(5,2),
  status VARCHAR(20) CHECK (status IN ('positivo', 'negativo')),
  user_input UUID REFERENCES auth.users(id),
  user_input_alt UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id_matricula, data)
);

-- Tabela Notificacoes
CREATE TABLE IF NOT EXISTS notificacoes (
  id_notificacao UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_user UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id_parametro UUID REFERENCES parametrizador(id_parametro),
  id_matricula UUID REFERENCES funcionario(id_matricula),
  id_data_not TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Planejamento
CREATE TABLE IF NOT EXISTS planejamento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_matricula UUID NOT NULL REFERENCES funcionario(id_matricula) ON DELETE CASCADE,
  mes VARCHAR(7) NOT NULL, -- formato YYYY-MM
  horas_planejadas DECIMAL(6,2) NOT NULL,
  horas_realizadas DECIMAL(6,2) DEFAULT 0,
  horas_extra DECIMAL(6,2) DEFAULT 0,
  horas_falta DECIMAL(6,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id_matricula, mes)
);

-- Criação de índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_funcionario_centro ON funcionario(id_centro);
CREATE INDEX IF NOT EXISTS idx_funcionario_turno ON funcionario(id_turno);
CREATE INDEX IF NOT EXISTS idx_ponto_matricula ON ponto(id_matricula);
CREATE INDEX IF NOT EXISTS idx_ponto_data ON ponto(data);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user ON notificacoes(id_user);
CREATE INDEX IF NOT EXISTS idx_planejamento_matricula ON planejamento(id_matricula);
CREATE INDEX IF NOT EXISTS idx_planejamento_mes ON planejamento(mes);

-- Comentários nas tabelas
COMMENT ON TABLE empresa IS 'Tabela de empresas do sistema';
COMMENT ON TABLE turno IS 'Tabela de turnos de trabalho';
COMMENT ON TABLE centro_custo IS 'Tabela de centros de custo';
COMMENT ON TABLE parametrizador IS 'Tabela de parâmetros e limites do sistema';
COMMENT ON TABLE funcionario IS 'Tabela de funcionários';
COMMENT ON TABLE ponto IS 'Tabela de registros de ponto';
COMMENT ON TABLE notificacoes IS 'Tabela de notificações do sistema';
COMMENT ON TABLE planejamento IS 'Tabela de planejamento mensal de horas';
