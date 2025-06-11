'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Database, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

interface TableInfo {
  name: string
  status: 'loading' | 'success' | 'error'
  count?: number
  error?: string
  sampleData?: any[]
}

export default function TestSupabasePage() {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')

  const knownTables = [
    'empresa',
    'turno',
    'centro_custo', 
    'parametrizador',
    'funcionario',
    'ponto',
    'notificacoes',
    'planejamento'
  ]

  const testConnection = async () => {
    setIsLoading(true)
    setConnectionStatus('connecting')
    
    const supabase = createClient()
    
    // Inicializar tabelas com status loading
    const initialTables: TableInfo[] = knownTables.map(name => ({
      name,
      status: 'loading'
    }))
    setTables(initialTables)

    try {
      // Testar conexão básica
      const { data: authData, error: authError } = await supabase.auth.getSession()
      
      if (authError) {
        console.log('Auth info:', authError.message)
      }
      
      setConnectionStatus('connected')
      
      // Testar cada tabela
      const updatedTables = await Promise.all(
        knownTables.map(async (tableName) => {
          try {
            const { data, error, count } = await supabase
              .from(tableName)
              .select('*', { count: 'exact' })
              .limit(3)
            
            if (error) {
              return {
                name: tableName,
                status: 'error' as const,
                error: error.message
              }
            }
            
            return {
              name: tableName,
              status: 'success' as const,
              count: count || 0,
              sampleData: data || []
            }
          } catch (err) {
            return {
              name: tableName,
              status: 'error' as const,
              error: err instanceof Error ? err.message : 'Erro desconhecido'
            }
          }
        })
      )
      
      setTables(updatedTables)
    } catch (err) {
      setConnectionStatus('error')
      console.error('Erro de conexão:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  const getStatusIcon = (status: TableInfo['status']) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: TableInfo['status']) => {
    switch (status) {
      case 'loading':
        return <Badge variant="secondary">Carregando...</Badge>
      case 'success':
        return <Badge variant="default" className="bg-green-500">Conectado</Badge>
      case 'error':
        return <Badge variant="destructive">Erro</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Teste de Conexão Supabase
          </h1>
          <p className="text-muted-foreground mt-2">
            Verificando conectividade e listando tabelas disponíveis
          </p>
        </div>
        <Button onClick={testConnection} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Status da Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {connectionStatus === 'connecting' && <Loader2 className="h-5 w-5 animate-spin" />}
            {connectionStatus === 'connected' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {connectionStatus === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
            Status da Conexão
          </CardTitle>
          <CardDescription>
            {connectionStatus === 'connecting' && 'Conectando ao Supabase...'}
            {connectionStatus === 'connected' && 'Conectado com sucesso ao Supabase'}
            {connectionStatus === 'error' && 'Erro ao conectar com o Supabase'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Lista de Tabelas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tables.map((table) => (
          <Card key={table.name}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  {getStatusIcon(table.status)}
                  {table.name}
                </span>
                {getStatusBadge(table.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {table.status === 'success' && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>Registros:</strong> {table.count}
                  </p>
                  {table.sampleData && table.sampleData.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Dados de exemplo:</p>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                        {JSON.stringify(table.sampleData[0], null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
              {table.status === 'error' && (
                <div className="text-sm text-red-600">
                  <strong>Erro:</strong> {table.error}
                </div>
              )}
              {table.status === 'loading' && (
                <div className="text-sm text-muted-foreground">
                  Verificando tabela...
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Projeto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>URL do Supabase:</strong> https://njeztgeetwkskuqusuxd.supabase.co</p>
          <p><strong>Total de Tabelas:</strong> {knownTables.length}</p>
          <p><strong>Tabelas Conectadas:</strong> {tables.filter(t => t.status === 'success').length}</p>
          <p><strong>Tabelas com Erro:</strong> {tables.filter(t => t.status === 'error').length}</p>
        </CardContent>
      </Card>
    </div>
  )
}