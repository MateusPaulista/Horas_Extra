### [15/01/2024] - Correção do Upload de Fotos de Funcionários
- Corrigido problema no upload de fotos de funcionários
- Alterado formato de arquivo de .jpg para .png conforme solicitado
- Arquivos modificados: `lib/supabase.ts` (funções uploadFotoFuncionario e getFotoFuncionarioUrl)
- Impacto: Upload de fotos agora funciona corretamente, salvando como matricula.png
- Observações: Necessário executar script create-storage-buckets.sql no Supabase