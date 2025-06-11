-- Inserção de dados iniciais para o sistema ClockFlow
-- Execute este script por último

-- Inserir empresas
INSERT INTO empresa (cod_estabel, descricao) VALUES
('EMP001', 'Empresa Alpha Ltda'),
('EMP002', 'Beta Soluções S.A.'),
('EMP003', 'Gamma Tecnologia LTDA')
ON CONFLICT (cod_estabel) DO NOTHING;

-- Buscar IDs das empresas inseridas e inserir turnos e centros de custo
DO $$
DECLARE
    empresa_alpha_id UUID;
    empresa_beta_id UUID;
    empresa_gamma_id UUID;
    turno_manha_alpha_id UUID;
    turno_tarde_alpha_id UUID;
    turno_noite_alpha_id UUID;
    turno_manha_beta_id UUID;
    turno_tarde_beta_id UUID;
    cc_tecnologia_id UUID;
    cc_rh_id UUID;
    cc_financeiro_id UUID;
    cc_operacoes_id UUID;
    func1_id UUID;
    func2_id UUID;
    func3_id UUID;
    func4_id UUID;
BEGIN
    -- Buscar IDs das empresas
    SELECT id_empresa INTO empresa_alpha_id FROM empresa WHERE cod_estabel = 'EMP001';
    SELECT id_empresa INTO empresa_beta_id FROM empresa WHERE cod_estabel = 'EMP002';
    SELECT id_empresa INTO empresa_gamma_id FROM empresa WHERE cod_estabel = 'EMP003';

    -- Inserir turnos
    INSERT INTO turno (nome, hr_entrada, hr_saida, tempo_refeicao, id_empresa) VALUES
    ('Manhã', '08:00', '17:00', 60, empresa_alpha_id),
    ('Tarde', '14:00', '23:00', 60, empresa_alpha_id),
    ('Noite', '22:00', '06:00', 60, empresa_alpha_id),
    ('Manhã', '08:00', '17:00', 60, empresa_beta_id),
    ('Tarde', '14:00', '23:00', 60, empresa_beta_id),
    ('Comercial', '09:00', '18:00', 60, empresa_gamma_id)
    ON CONFLICT DO NOTHING;

    -- Buscar IDs dos turnos
    SELECT id_turno INTO turno_manha_alpha_id FROM turno WHERE nome = 'Manhã' AND id_empresa = empresa_alpha_id;
    SELECT id_turno INTO turno_tarde_alpha_id FROM turno WHERE nome = 'Tarde' AND id_empresa = empresa_alpha_id;
    SELECT id_turno INTO turno_noite_alpha_id FROM turno WHERE nome = 'Noite' AND id_empresa = empresa_alpha_id;
    SELECT id_turno INTO turno_manha_beta_id FROM turno WHERE nome = 'Manhã' AND id_empresa = empresa_beta_id;
    SELECT id_turno INTO turno_tarde_beta_id FROM turno WHERE nome = 'Tarde' AND id_empresa = empresa_beta_id;

    -- Inserir centros de custo
    INSERT INTO centro_custo (codigo, descricao, id_empresa) VALUES
    ('CC001', 'Tecnologia', empresa_alpha_id),
    ('CC002', 'Recursos Humanos', empresa_alpha_id),
    ('CC003', 'Financeiro', empresa_beta_id),
    ('CC004', 'Operações', empresa_beta_id),
    ('CC005', 'Desenvolvimento', empresa_gamma_id)
    ON CONFLICT DO NOTHING;

    -- Buscar IDs dos centros de custo
    SELECT id_centro INTO cc_tecnologia_id FROM centro_custo WHERE codigo = 'CC001';
    SELECT id_centro INTO cc_rh_id FROM centro_custo WHERE codigo = 'CC002';
    SELECT id_centro INTO cc_financeiro_id FROM centro_custo WHERE codigo = 'CC003';
    SELECT id_centro INTO cc_operacoes_id FROM centro_custo WHERE codigo = 'CC004';

    -- Inserir funcionários
    INSERT INTO funcionario (matricula, nome, email, id_turno, id_centro, data_adm) VALUES
    ('FUN001', 'João Silva', 'joao.silva@empresa.com', turno_manha_alpha_id, cc_tecnologia_id, '2023-01-15'),
    ('FUN002', 'Maria Santos', 'maria.santos@empresa.com', turno_tarde_alpha_id, cc_rh_id, '2023-02-10'),
    ('FUN003', 'Pedro Costa', 'pedro.costa@empresa.com', turno_manha_beta_id, cc_financeiro_id, '2023-03-05'),
    ('FUN004', 'Ana Oliveira', 'ana.oliveira@empresa.com', turno_tarde_beta_id, cc_operacoes_id, '2023-04-20'),
    ('FUN005', 'Carlos Ferreira', 'carlos.ferreira@empresa.com', turno_noite_alpha_id, cc_tecnologia_id, '2023-05-12')
    ON CONFLICT DO NOTHING;

    -- Buscar IDs dos funcionários
    SELECT id_matricula INTO func1_id FROM funcionario WHERE matricula = 'FUN001';
    SELECT id_matricula INTO func2_id FROM funcionario WHERE matricula = 'FUN002';
    SELECT id_matricula INTO func3_id FROM funcionario WHERE matricula = 'FUN003';
    SELECT id_matricula INTO func4_id FROM funcionario WHERE matricula = 'FUN004';

    -- Inserir alguns registros de ponto para demonstração (últimos 5 dias)
    IF func1_id IS NOT NULL AND turno_manha_alpha_id IS NOT NULL AND cc_tecnologia_id IS NOT NULL THEN
        INSERT INTO ponto (id_matricula, id_turno, id_centro, data, batida1, batida2, batida3, batida4) VALUES
        (func1_id, turno_manha_alpha_id, cc_tecnologia_id, CURRENT_DATE - INTERVAL '1 day', '08:00', '12:00', '13:00', '17:00'),
        (func1_id, turno_manha_alpha_id, cc_tecnologia_id, CURRENT_DATE - INTERVAL '2 day', '08:10', '12:00', '13:00', '17:30'),
        (func1_id, turno_manha_alpha_id, cc_tecnologia_id, CURRENT_DATE - INTERVAL '3 day', '07:55', '12:00', '13:00', '17:00'),
        (func1_id, turno_manha_alpha_id, cc_tecnologia_id, CURRENT_DATE - INTERVAL '4 day', '08:05', '12:00', '13:00', '17:15'),
        (func1_id, turno_manha_alpha_id, cc_tecnologia_id, CURRENT_DATE - INTERVAL '5 day', '08:00', '12:00', '13:00', '17:00')
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF func2_id IS NOT NULL AND turno_tarde_alpha_id IS NOT NULL AND cc_rh_id IS NOT NULL THEN
        INSERT INTO ponto (id_matricula, id_turno, id_centro, data, batida1, batida2, batida3, batida4) VALUES
        (func2_id, turno_tarde_alpha_id, cc_rh_id, CURRENT_DATE - INTERVAL '1 day', '14:00', '18:00', '19:00', '23:00'),
        (func2_id, turno_tarde_alpha_id, cc_rh_id, CURRENT_DATE - INTERVAL '2 day', '14:15', '18:00', '19:00', '22:45'),
        (func2_id, turno_tarde_alpha_id, cc_rh_id, CURRENT_DATE - INTERVAL '3 day', '14:00', '18:00', '19:00', '23:00'),
        (func2_id, turno_tarde_alpha_id, cc_rh_id, CURRENT_DATE - INTERVAL '4 day', '14:10', '18:00', '19:00', '22:50'),
        (func2_id, turno_tarde_alpha_id, cc_rh_id, CURRENT_DATE - INTERVAL '5 day', '14:00', '18:00', '19:00', '23:00')
        ON CONFLICT DO NOTHING;
    END IF;

    IF func3_id IS NOT NULL AND turno_manha_beta_id IS NOT NULL AND cc_financeiro_id IS NOT NULL THEN
        INSERT INTO ponto (id_matricula, id_turno, id_centro, data, batida1, batida2, batida3, batida4) VALUES
        (func3_id, turno_manha_beta_id, cc_financeiro_id, CURRENT_DATE - INTERVAL '1 day', '08:00', '12:00', '13:00', '17:00'),
        (func3_id, turno_manha_beta_id, cc_financeiro_id, CURRENT_DATE - INTERVAL '2 day', '08:20', '12:00', '13:00', '16:40'),
        (func3_id, turno_manha_beta_id, cc_financeiro_id, CURRENT_DATE - INTERVAL '3 day', '08:00', '12:00', '13:00', '17:00'),
        (func3_id, turno_manha_beta_id, cc_financeiro_id, CURRENT_DATE - INTERVAL '4 day', '08:15', '12:00', '13:00', '16:45'),
        (func3_id, turno_manha_beta_id, cc_financeiro_id, CURRENT_DATE - INTERVAL '5 day', '08:00', '12:00', '13:00', '17:00')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Inserir planejamento para o mês atual
    DECLARE
        mes_atual VARCHAR(7) := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
    BEGIN
        IF func1_id IS NOT NULL THEN
            INSERT INTO planejamento (id_matricula, mes, horas_planejadas, horas_realizadas, horas_extra, horas_falta) VALUES
            (func1_id, mes_atual, 176, 0, 0, 0)
            ON CONFLICT (id_matricula, mes) DO NOTHING;
        END IF;
        
        IF func2_id IS NOT NULL THEN
            INSERT INTO planejamento (id_matricula, mes, horas_planejadas, horas_realizadas, horas_extra, horas_falta) VALUES
            (func2_id, mes_atual, 176, 0, 0, 0)
            ON CONFLICT (id_matricula, mes) DO NOTHING;
        END IF;

        IF func3_id IS NOT NULL THEN
            INSERT INTO planejamento (id_matricula, mes, horas_planejadas, horas_realizadas, horas_extra, horas_falta) VALUES
            (func3_id, mes_atual, 176, 0, 0, 0)
            ON CONFLICT (id_matricula, mes) DO NOTHING;
        END IF;

        IF func4_id IS NOT NULL THEN
            INSERT INTO planejamento (id_matricula, mes, horas_planejadas, horas_realizadas, horas_extra, horas_falta) VALUES
            (func4_id, mes_atual, 176, 0, 0, 0)
            ON CONFLICT (id_matricula, mes) DO NOTHING;
        END IF;
    END;
END $$;

-- Inserir parâmetros padrão (será executado quando houver usuários no sistema)
-- Este bloco será executado apenas se existir pelo menos um usuário
DO $$
DECLARE
    first_user_id UUID;
    cc_geral_id UUID;
BEGIN
    -- Buscar o primeiro usuário disponível
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;
    
    -- Buscar um centro de custo para associar
    SELECT id_centro INTO cc_geral_id FROM centro_custo LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        -- Inserir parâmetros gerais (sem centro de custo específico)
        INSERT INTO parametrizador (
            id_user, 
            limite_extra_dia, 
            limite_falta, 
            limite_extra_mes, 
            limite_atras_dia, 
            status,
            id_centro,
            push_ativo
        ) VALUES (
            first_user_id,
            2.0,  -- 2 horas extras por dia
            8.0,  -- 8 horas de falta
            40.0, -- 40 horas extras por mês
            0.5,  -- 30 minutos de atraso por dia
            TRUE,
            NULL, -- Parâmetro geral (não específico para um centro)
            FALSE
        )
        ON CONFLICT DO NOTHING;

        -- Inserir parâmetros específicos para um centro de custo (se existir)
        IF cc_geral_id IS NOT NULL THEN
            INSERT INTO parametrizador (
                id_user, 
                limite_extra_dia, 
                limite_falta, 
                limite_extra_mes, 
                limite_atras_dia, 
                status,
                id_centro,
                push_ativo
            ) VALUES (
                first_user_id,
                1.5,  -- 1.5 horas extras por dia (mais restritivo)
                4.0,  -- 4 horas de falta
                30.0, -- 30 horas extras por mês
                0.25, -- 15 minutos de atraso por dia
                TRUE,
                cc_geral_id,
                TRUE
            )
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
END $$;

-- Inserir algumas notificações de exemplo (será executado quando houver usuários)
DO $$
DECLARE
    first_user_id UUID;
    func_exemplo_id UUID;
BEGIN
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;
    SELECT id_matricula INTO func_exemplo_id FROM funcionario LIMIT 1;
    
    IF first_user_id IS NOT NULL AND func_exemplo_id IS NOT NULL THEN
        INSERT INTO notificacoes (id_user, id_matricula, mensagem, lida) VALUES
        (first_user_id, func_exemplo_id, 'Bem-vindo ao sistema ClockFlow! Configuração inicial concluída.', FALSE),
        (first_user_id, NULL, 'Sistema configurado com sucesso. Todos os módulos estão funcionais.', FALSE)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Atualizar estatísticas das tabelas
ANALYZE empresa;
ANALYZE turno;
ANALYZE centro_custo;
ANALYZE funcionario;
ANALYZE ponto;
ANALYZE planejamento;
ANALYZE parametrizador;
ANALYZE notificacoes;
