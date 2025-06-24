"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  getFotoPerfilUrl, 
  verificarFotoPerfilExiste, 
  listarFotosPerfil,
  supabase 
} from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

export function DebugFotoPerfil() {
  const { user } = useAuth()
  const [testEmail, setTestEmail] = useState("")
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)
  const [fotoExiste, setFotoExiste] = useState<boolean | null>(null)
  const [bucketInfo, setBucketInfo] = useState<any>(null)
  const [fotos, setFotos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(message)
  }

  useEffect(() => {
    if (user?.email) {
      setTestEmail(user.email)
    }
  }, [user])

  const testarFotoPerfil = async () => {
    if (!testEmail) {
      addLog("❌ Email não fornecido")
      return
    }

    setLoading(true)
    setLogs([])
    
    try {
      const fileName = `${testEmail}.jpg`
      addLog(`🔍 Testando foto para: ${fileName}`)

      // Verificar se a foto existe
      addLog("📋 Verificando se a foto existe...")
      const existe = await verificarFotoPerfilExiste(fileName)
      setFotoExiste(existe)
      addLog(`📸 Foto existe: ${existe}`)

      if (existe) {
        // Obter URL da foto
        addLog("🔗 Obtendo URL da foto...")
        const url = await getFotoPerfilUrl(fileName)
        setFotoUrl(url)
        addLog(`🌐 URL obtida: ${url}`)

        if (url) {
          // Testar se a URL é acessível
          addLog("🌍 Testando acesso à URL...")
          try {
            const response = await fetch(url, { method: 'HEAD' })
            addLog(`📡 Status da resposta: ${response.status} ${response.statusText}`)
            addLog(`📊 Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`)
          } catch (fetchError) {
            addLog(`❌ Erro ao acessar URL: ${fetchError}`)
          }
        }
      } else {
        setFotoUrl(null)
        addLog("📷 Foto não encontrada no bucket")
      }

    } catch (error) {
      addLog(`❌ Erro durante o teste: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const verificarBucket = async () => {
    setLoading(true)
    addLog("🪣 Verificando informações do bucket...")
    
    try {
      // Listar buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
      
      if (bucketsError) {
        addLog(`❌ Erro ao listar buckets: ${bucketsError.message}`)
      } else {
        const fotosPerfilBucket = buckets?.find(b => b.id === 'fotosperfil')
        setBucketInfo(fotosPerfilBucket)
        addLog(`🪣 Bucket fotosperfil: ${fotosPerfilBucket ? 'Encontrado' : 'Não encontrado'}`)
        if (fotosPerfilBucket) {
          addLog(`📊 Bucket info: ${JSON.stringify(fotosPerfilBucket)}`)
        }
      }

      // Listar fotos no bucket
      addLog("📋 Listando fotos no bucket...")
      const fotosLista = await listarFotosPerfil()
      setFotos(fotosLista || [])
      addLog(`📸 Total de fotos encontradas: ${fotosLista?.length || 0}`)
      
      if (fotosLista && fotosLista.length > 0) {
        fotosLista.slice(0, 5).forEach((foto, index) => {
          addLog(`📷 Foto ${index + 1}: ${foto.name} (${foto.metadata?.size} bytes)`)
        })
      }

    } catch (error) {
      addLog(`❌ Erro ao verificar bucket: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const limparCache = () => {
    // Limpar localStorage se houver cache
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage).filter(key => key.includes('foto') || key.includes('cache'))
      keys.forEach(key => localStorage.removeItem(key))
      addLog(`🧹 Cache limpo: ${keys.length} itens removidos`)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🔧 Debug - Foto de Perfil</CardTitle>
        <CardDescription>
          Ferramenta para diagnosticar problemas com carregamento de fotos de perfil
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Teste de Email */}
        <div className="space-y-2">
          <Label htmlFor="test-email">Email para Teste</Label>
          <div className="flex gap-2">
            <Input
              id="test-email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="email@exemplo.com"
            />
            <Button onClick={testarFotoPerfil} disabled={loading}>
              {loading ? "Testando..." : "Testar Foto"}
            </Button>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={verificarBucket} disabled={loading} variant="outline">
            Verificar Bucket
          </Button>
          <Button onClick={limparCache} variant="outline">
            Limpar Cache
          </Button>
        </div>

        {/* Resultado Visual */}
        {fotoUrl && (
          <div className="space-y-2">
            <Label>Resultado Visual</Label>
            <div className="flex items-center gap-4 p-4 border rounded">
              <Avatar className="h-16 w-16">
                <AvatarImage 
                  src={fotoUrl} 
                  alt="Foto de teste"
                  onError={() => addLog("❌ Erro ao carregar imagem no Avatar")}
                  onLoad={() => addLog("✅ Imagem carregada com sucesso no Avatar")}
                />
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Status: {fotoExiste ? '✅ Existe' : '❌ Não existe'}</p>
                <p className="text-xs text-muted-foreground break-all">{fotoUrl}</p>
              </div>
            </div>
          </div>
        )}

        {/* Informações do Bucket */}
        {bucketInfo && (
          <div className="space-y-2">
            <Label>Informações do Bucket</Label>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto">
              {JSON.stringify(bucketInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Lista de Fotos */}
        {fotos.length > 0 && (
          <div className="space-y-2">
            <Label>Fotos no Bucket ({fotos.length})</Label>
            <div className="max-h-32 overflow-auto border rounded p-2">
              {fotos.map((foto, index) => (
                <div key={index} className="text-xs py-1 border-b last:border-b-0">
                  📷 {foto.name} ({foto.metadata?.size || 0} bytes)
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logs */}
        <div className="space-y-2">
          <Label>Logs de Debug</Label>
          <div className="max-h-64 overflow-auto bg-black text-green-400 p-3 rounded font-mono text-xs">
            {logs.length === 0 ? (
              <p className="text-gray-500">Nenhum log ainda...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}