-- Este script habilita o provedor de autenticação por email/senha no Supabase
-- Execute este script se o login por email/senha não estiver funcionando

-- Verificar se o provedor de email está habilitado
DO $$
DECLARE
  email_provider_enabled BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM auth.providers 
    WHERE provider = 'email' AND enabled = true
  ) INTO email_provider_enabled;
  
  IF NOT email_provider_enabled THEN
    -- Habilitar o provedor de email se não estiver habilitado
    UPDATE auth.providers 
    SET enabled = true 
    WHERE provider = 'email';
    
    RAISE NOTICE 'Provedor de autenticação por email habilitado com sucesso!';
  ELSE
    RAISE NOTICE 'Provedor de autenticação por email já está habilitado.';
  END IF;
END $$;

-- Verificar configurações de autenticação
SELECT * FROM auth.providers WHERE provider = 'email';
