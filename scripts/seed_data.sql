-- Inserção de dados iniciais para o sistema ClockFlow

-- Inserir empresas
INSERT INTO empresa (cod_estabel, descricao) VALUES
('EMP001', 'Empresa Alpha Ltda'),
('EMP002', 'Beta Soluções S.A.')
ON CONFLICT (cod_estabel) DO NOTHING;

-- Buscar IDs das empresas inseridas
DO $$
DECLARE
    empresa_alpha_id UUID;
    empresa_beta_id UUID;
BEGIN
    SELECT id_empresa INTO empresa_alpha_id FROM empresa WHERE cod_estabel = 'EMP001';
    SELECT id_empresa INTO empresa_beta_id FROM empresa WHERE cod_estabel = 'EMP002';

    -- Inserir turnos
    INSERT INTO turno (nome, hr_entrada, hr_saida, tempo_refeicao, id_empresa) VALUES
    ('Manhã', '08:00', '17:00', 60, empresa_alpha_id),
    ('Tarde', '14:00', '23:00', 60, empresa_alpha_id),
    ('Noite', '22:00', '06:00', 60, empresa_alpha_id),
    ('Manhã', '08:00', '17:00', 60, empresa_beta_id),
    ('Tarde', '14:00', '23:00', 60, empresa_beta_id)
    ON CONFLICT DO NOTHING;

    -- Inserir centros de custo
    INSERT INTO centro_custo (codigo, descricao, id_empresa) VALUES
    ('CC001', 'Tecnologia', empresa_alpha_id),
    ('CC002', 'Recursos Humanos', empresa_alpha_id),
    ('CC003', 'Financeiro', empresa_beta_id)
    ON CONFLICT DO NOTHING;
END $$;

-- Buscar IDs dos turnos e centros de custo
DO $$
DECLARE
    turno_manha_id UUID;
    turno_tarde_id UUID;
    cc_tecnologia_id UUID;
    cc_rh_id UUID;
BEGIN
    SELECT id_turno INTO turno_manha_id FROM turno WHERE nome = 'Manhã' LIMIT 1;
    SELECT id_turno INTO turno_tarde_id FROM turno WHERE nome = 'Tarde' LIMIT 1;
    SELECT id_centro INTO cc_tecnologia_id FROM centro_custo WHERE codigo = 'CC001';
    SELECT id_centro INTO cc_rh_id FROM centro_custo WHERE codigo = 'CC002';

    -- Inserir funcionários
    INSERT INTO funcionario (matricula, nome, email, id_turno, id_centro, data_adm) VALUES
    ('FUN001', 'João Silva', 'joao@empresa.com', turno_manha_id, cc_tecnologia_id, '2023-01-15'),
    ('FUN002', 'Maria Santos', 'maria@empresa.com', turno_tarde_id, cc_rh_id, '2023-02-10')
    ON CONFLICT DO NOTHING;
END $$;

-- Inserir parâmetros padrão
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Buscar um usuário admin (isso depende de você já ter criado um usuário com role = admin)
    SELECT id INTO admin_user_id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin' LIMIT 1;
    
    IF admin_user_id IS NULL THEN
        -- Se não encontrar um admin, usar o primeiro usuário disponível
        SELECT id INTO admin_user_id FROM auth.users LIMIT 1;
    END IF;
    
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO parametrizador (
            id_user, 
            limite_extra_dia, 
            limite_falta, 
            limite_extra_mes, 
            limite_atras_dia, 
            status
        ) VALUES (
            admin_user_id,
            2.0,  -- 2 horas extras por dia
            8.0,  -- 8 horas de falta
            40.0, -- 40 horas extras por mês
            0.5,  -- 30 minutos de atraso por dia
            TRUE
        )
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Inserir alguns registros de ponto para demonstração
DO $$
DECLARE
    func1_id UUID;
    func2_id UUID;
    turno1_id UUID;
    turno2_id UUID;
    cc1_id UUID;
    cc2_id UUID;
BEGIN
    SELECT id_matricula INTO func1_id FROM funcionario WHERE matricula = 'FUN001';
    SELECT id_matricula INTO func2_id FROM funcionario WHERE matricula = 'FUN002';
    SELECT id_turno INTO turno1_id FROM turno WHERE nome = 'Manhã' LIMIT 1;
    SELECT id_turno INTO turno2_id FROM turno WHERE nome = 'Tarde' LIMIT 1;
    SELECT id_centro INTO cc1_id FROM centro_custo WHERE codigo = 'CC001';
    SELECT id_centro INTO cc2_id FROM centro_custo WHERE codigo = 'CC002';
    
    IF func1_id IS NOT NULL AND turno1_id IS NOT NULL AND cc1_id IS NOT NULL THEN
        -- Inserir pontos para o primeiro funcionário
        INSERT INTO ponto (id_matricula, id_turno, id_centro, data, batida1, batida2, batida3, batida4) VALUES
        (func1_id, turno1_id, cc1_id, CURRENT_DATE - INTERVAL '1 day', '08:00', '12:00', '13:00', '17:00'),
        (func1_id, turno1_id, cc1_id, CURRENT_DATE - INTERVAL '2 day', '08:10', '12:00', '13:00', '17:30')
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF func2_id IS NOT NULL AND turno2_id IS NOT NULL AND cc2_id IS NOT NULL THEN
        -- Inserir pontos para o segundo funcionário
        INSERT INTO ponto (id_matricula, id_turno, id_centro, data, batida1, batida2, batida3, batida4) VALUES
        (func2_id, turno2_id, cc2_id, CURRENT_DATE - INTERVAL '1 day', '14:00', '18:00', '19:00', '23:00'),
        (func2_id, turno2_id, cc2_id, CURRENT_DATE - INTERVAL '2 day', '14:15', '18:00', '19:00', '22:45')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Inserir planejamento para o mês atual
DO $$
DECLARE
    func1_id UUID;
    func2_id UUID;
    mes_atual VARCHAR(7);
BEGIN
    SELECT id_matricula INTO func1_id FROM funcionario WHERE matricula = 'FUN001';
    SELECT id_matricula INTO func2_id FROM funcionario WHERE matricula = 'FUN002';
    mes_atual := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
    
    IF func1_id IS NOT NULL THEN
        INSERT INTO planejamento (id_matricula, mes, horas_planejadas, horas_realizadas, horas_extra, horas_falta) VALUES
        (func1_id, mes_atual, 176, 180, 4, 0)
        ON CONFLICT (id_matricula, mes) DO NOTHING;
    END IF;
    
    IF func2_id IS NOT NULL THEN
        INSERT INTO planejamento (id_matricula, mes, horas_planejadas, horas_realizadas, horas_extra, horas_falta) VALUES
        (func2_id, mes_atual, 176, 168, 0, 8)
        ON CONFLICT (id_matricula, mes) DO NOTHING;
    END IF;
END $$;
