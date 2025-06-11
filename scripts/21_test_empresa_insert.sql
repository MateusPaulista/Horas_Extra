-- Testar se agora conseguimos inserir uma empresa
INSERT INTO empresa (cod_estabel, descricao) 
VALUES ('TEST001', 'Empresa de Teste')
ON CONFLICT (cod_estabel) DO UPDATE SET 
    descricao = EXCLUDED.descricao,
    updated_at = NOW();

-- Verificar se a inserção funcionou
SELECT * FROM empresa WHERE cod_estabel = 'TEST001';

-- Limpar o teste
DELETE FROM empresa WHERE cod_estabel = 'TEST001';
