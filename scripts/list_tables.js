// Script para listar todas as tabelas disponíveis no Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://njeztgeetwkskuqusuxd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZXp0Z2VldHdrc2t1cXVzdXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTE2NjYsImV4cCI6MjA2NTIyNzY2Nn0.Bv95TxZriyrZ2oRfcaIH2LRCXc3Y3RBE90ha9ZPRWLU";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listTables() {
  try {
    console.log('🔍 Conectando ao Supabase...');
    
    // Query para listar todas as tabelas do schema public
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');

    if (error) {
      console.error('❌ Erro ao buscar tabelas:', error.message);
      
      // Tentativa alternativa usando RPC
      console.log('\n🔄 Tentando método alternativo...');
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_tables');
      
      if (rpcError) {
        console.error('❌ Erro no método alternativo:', rpcError.message);
        
        // Lista as tabelas conhecidas baseadas no script SQL
        console.log('\n📋 Tabelas conhecidas baseadas no script SQL:');
        const knownTables = [
          'empresa',
          'turno', 
          'centro_custo',
          'parametrizador',
          'funcionario',
          'ponto',
          'notificacoes',
          'planejamento'
        ];
        
        knownTables.forEach((table, index) => {
          console.log(`${index + 1}. ${table}`);
        });
        
        // Testa conexão com cada tabela
        console.log('\n🧪 Testando conexão com cada tabela:');
        for (const table of knownTables) {
          try {
            const { data: testData, error: testError } = await supabase
              .from(table)
              .select('*')
              .limit(1);
            
            if (testError) {
              console.log(`❌ ${table}: ${testError.message}`);
            } else {
              console.log(`✅ ${table}: Conectado com sucesso (${testData?.length || 0} registros encontrados)`);
            }
          } catch (err) {
            console.log(`❌ ${table}: Erro de conexão - ${err.message}`);
          }
        }
        
        return;
      }
      
      console.log('✅ Tabelas encontradas via RPC:', rpcData);
      return;
    }

    if (data && data.length > 0) {
      console.log('\n✅ Tabelas encontradas no banco de dados:');
      data.forEach((table, index) => {
        console.log(`${index + 1}. ${table.table_name}`);
      });
      
      console.log(`\n📊 Total: ${data.length} tabelas`);
    } else {
      console.log('⚠️ Nenhuma tabela encontrada no schema public');
    }
    
  } catch (err) {
    console.error('💥 Erro geral:', err.message);
  }
}

// Função para testar uma tabela específica
async function testTable(tableName) {
  try {
    console.log(`\n🔍 Testando tabela: ${tableName}`);
    
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (error) {
      console.log(`❌ Erro: ${error.message}`);
      return;
    }
    
    console.log(`✅ Sucesso! Registros encontrados: ${count}`);
    if (data && data.length > 0) {
      console.log('📄 Primeiros registros:');
      console.log(JSON.stringify(data, null, 2));
    }
    
  } catch (err) {
    console.log(`❌ Erro ao testar tabela ${tableName}:`, err.message);
  }
}

// Executar o script
if (require.main === module) {
  listTables().then(() => {
    console.log('\n🏁 Script finalizado!');
    process.exit(0);
  });
}

module.exports = { listTables, testTable };