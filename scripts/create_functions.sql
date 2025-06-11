-- Funções para operações comuns no sistema

-- Função para calcular total de horas trabalhadas a partir das batidas
CREATE OR REPLACE FUNCTION calcular_horas_trabalhadas(
  b1 TIME, 
  b2 TIME, 
  b3 TIME, 
  b4 TIME, 
  b5 TIME, 
  b6 TIME, 
  b7 TIME, 
  b8 TIME
) RETURNS DECIMAL AS $$
DECLARE
  total DECIMAL(5,2) := 0;
  intervalo INTERVAL;
BEGIN
  -- Primeiro par de batidas (entrada e saída)
  IF b1 IS NOT NULL AND b2 IS NOT NULL THEN
    intervalo := b2 - b1;
    total := total + EXTRACT(EPOCH FROM intervalo) / 3600;
  END IF;
  
  -- Segundo par de batidas
  IF b3 IS NOT NULL AND b4 IS NOT NULL THEN
    intervalo := b4 - b3;
    total := total + EXTRACT(EPOCH FROM intervalo) / 3600;
  END IF;
  
  -- Terceiro par de batidas
  IF b5 IS NOT NULL AND b6 IS NOT NULL THEN
    intervalo := b6 - b5;
    total := total + EXTRACT(EPOCH FROM intervalo) / 3600;
  END IF;
  
  -- Quarto par de batidas
  IF b7 IS NOT NULL AND b8 IS NOT NULL THEN
    intervalo := b8 - b7;
    total := total + EXTRACT(EPOCH FROM intervalo) / 3600;
  END IF;
  
  RETURN ROUND(total::numeric, 2);
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar automaticamente o total de horas e status ao registrar/atualizar ponto
CREATE OR REPLACE FUNCTION atualizar_total_horas_ponto()
RETURNS TRIGGER AS $$
DECLARE
  total_calculado DECIMAL(5,2);
  horas_esperadas DECIMAL(5,2) := 8.0; -- Valor padrão, pode ser ajustado
  turno_info RECORD;
BEGIN
  -- Calcular total de horas
  total_calculado := calcular_horas_trabalhadas(
    NEW.batida1, NEW.batida2, NEW.batida3, NEW.batida4,
    NEW.batida5, NEW.batida6, NEW.batida7, NEW.batida8
  );
  
  -- Buscar informações do turno para saber horas esperadas
  SELECT INTO turno_info 
    EXTRACT(EPOCH FROM (hr_saida - hr_entrada)) / 3600 - (tempo_refeicao / 60.0) AS horas_turno
  FROM turno
  WHERE id_turno = NEW.id_turno;
  
  IF FOUND THEN
    horas_esperadas := turno_info.horas_turno;
  END IF;
  
  -- Atualizar total de horas
  NEW.total_horas := total_calculado;
  
  -- Definir status com base no total de horas vs esperado
  IF total_calculado >= horas_esperadas THEN
    NEW.status := 'positivo';
  ELSE
    NEW.status := 'negativo';
  END IF;
  
  -- Atualizar timestamp
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o trigger na tabela ponto
DROP TRIGGER IF EXISTS trigger_atualizar_total_horas_ponto ON ponto;
CREATE TRIGGER trigger_atualizar_total_horas_ponto
BEFORE INSERT OR UPDATE OF batida1, batida2, batida3, batida4, batida5, batida6, batida7, batida8
ON ponto
FOR EACH ROW
EXECUTE FUNCTION atualizar_total_horas_ponto();

-- Função para atualizar o planejamento com base nos pontos registrados
CREATE OR REPLACE FUNCTION atualizar_planejamento_do_mes()
RETURNS TRIGGER AS $$
DECLARE
  mes_ref VARCHAR(7);
  horas_realizadas_total DECIMAL(6,2) := 0;
  horas_planejadas_valor DECIMAL(6,2) := 0;
  horas_extra_valor DECIMAL(6,2) := 0;
  horas_falta_valor DECIMAL(6,2) := 0;
  planejamento_id UUID;
BEGIN
  -- Extrair o mês de referência no formato YYYY-MM
  mes_ref := TO_CHAR(NEW.data, 'YYYY-MM');
  
  -- Verificar se existe planejamento para este funcionário e mês
  SELECT id, horas_planejadas INTO planejamento_id, horas_planejadas_valor
  FROM planejamento
  WHERE id_matricula = NEW.id_matricula AND mes = mes_ref;
  
  -- Calcular total de horas realizadas no mês
  SELECT COALESCE(SUM(total_horas), 0) INTO horas_realizadas_total
  FROM ponto
  WHERE id_matricula = NEW.id_matricula 
    AND TO_CHAR(data, 'YYYY-MM') = mes_ref;
  
  -- Calcular horas extras e faltas
  IF horas_realizadas_total > horas_planejadas_valor THEN
    horas_extra_valor := horas_realizadas_total - horas_planejadas_valor;
    horas_falta_valor := 0;
  ELSE
    horas_extra_valor := 0;
    horas_falta_valor := horas_planejadas_valor - horas_realizadas_total;
  END IF;
  
  -- Se existe planejamento, atualizar
  IF planejamento_id IS NOT NULL THEN
    UPDATE planejamento
    SET 
      horas_realizadas = horas_realizadas_total,
      horas_extra = horas_extra_valor,
      horas_falta = horas_falta_valor,
      updated_at = NOW()
    WHERE id = planejamento_id;
  ELSE
    -- Se não existe, criar um novo (com valor padrão para horas planejadas)
    INSERT INTO planejamento (
      id_matricula, 
      mes, 
      horas_planejadas, 
      horas_realizadas, 
      horas_extra, 
      horas_falta
    ) VALUES (
      NEW.id_matricula,
      mes_ref,
      176, -- Valor padrão (22 dias x 8 horas)
      horas_realizadas_total,
      horas_extra_valor,
      horas_falta_valor
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o trigger para atualizar planejamento
DROP TRIGGER IF EXISTS trigger_atualizar_planejamento ON ponto;
CREATE TRIGGER trigger_atualizar_planejamento
AFTER INSERT OR UPDATE OF total_horas
ON ponto
FOR EACH ROW
EXECUTE FUNCTION atualizar_planejamento_do_mes();

-- Função para criar notificação quando houver excesso de horas extras ou faltas
CREATE OR REPLACE FUNCTION verificar_limites_e_notificar()
RETURNS TRIGGER AS $$
DECLARE
  parametros RECORD;
  mensagem TEXT;
  admin_users UUID[];
BEGIN
  -- Buscar parâmetros aplicáveis
  SELECT * INTO parametros
  FROM parametrizador
  WHERE id_centro = NEW.id_centro AND status = TRUE
  ORDER BY data_parametro DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    -- Se não encontrar parâmetros específicos para o centro de custo, buscar parâmetros gerais
    SELECT * INTO parametros
    FROM parametrizador
    WHERE id_centro IS NULL AND status = TRUE
    ORDER BY data_parametro DESC
    LIMIT 1;
  END IF;
  
  -- Se encontrou parâmetros, verificar limites
  IF FOUND THEN
    -- Verificar horas extras
    IF NEW.total_horas - 8 > parametros.limite_extra_dia THEN
      mensagem := 'Alerta: Funcionário ' || (SELECT nome FROM funcionario WHERE id_matricula = NEW.id_matricula) || 
                  ' excedeu o limite de horas extras diárias em ' || TO_CHAR(NEW.data, 'DD/MM/YYYY');
      
      -- Buscar usuários administradores para notificar
      SELECT ARRAY_AGG(id) INTO admin_users
      FROM auth.users
      WHERE raw_user_meta_data->>'role' = 'admin';
      
      -- Criar notificações para cada admin
      IF admin_users IS NOT NULL THEN
        FOREACH admin_user IN ARRAY admin_users
        LOOP
          INSERT INTO notificacoes (id_user, id_matricula, mensagem)
          VALUES (admin_user, NEW.id_matricula, mensagem);
        END LOOP;
      END IF;
    END IF;
    
    -- Verificar faltas/atrasos (se total de horas for menor que o esperado)
    IF 8 - NEW.total_horas > parametros.limite_atras_dia AND NEW.total_horas > 0 THEN
      mensagem := 'Alerta: Funcionário ' || (SELECT nome FROM funcionario WHERE id_matricula = NEW.id_matricula) || 
                  ' registrou atraso significativo em ' || TO_CHAR(NEW.data, 'DD/MM/YYYY');
      
      -- Buscar usuários administradores para notificar
      SELECT ARRAY_AGG(id) INTO admin_users
      FROM auth.users
      WHERE raw_user_meta_data->>'role' = 'admin';
      
      -- Criar notificações para cada admin
      IF admin_users IS NOT NULL THEN
        FOREACH admin_user IN ARRAY admin_users
        LOOP
          INSERT INTO notificacoes (id_user, id_matricula, mensagem)
          VALUES (admin_user, NEW.id_matricula, mensagem);
        END LOOP;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o trigger para verificar limites e notificar
DROP TRIGGER IF EXISTS trigger_verificar_limites ON ponto;
CREATE TRIGGER trigger_verificar_limites
AFTER INSERT OR UPDATE OF total_horas
ON ponto
FOR EACH ROW
EXECUTE FUNCTION verificar_limites_e_notificar();
