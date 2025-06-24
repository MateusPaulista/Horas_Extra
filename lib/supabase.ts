import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://tagumuhncrpvfqvvpeac.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhZ3VtdWhuY3JwdmZxdnZwZWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MzYxMDksImV4cCI6MjA2NTQxMjEwOX0.s-j-5rgAxg7vf89RS5hJpJp-HVI4kOndZy_-gUaOekc"

// Criar cliente Supabase com opções de persistência de sessão
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    storageKey: "supabase-auth",
    storage: {
      getItem: (key) => {
        if (typeof window !== "undefined") {
          return window.localStorage.getItem(key)
        }
        return null
      },
      setItem: (key, value) => {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, value)
        }
      },
      removeItem: (key) => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(key)
        }
      },
    },
  },
})

// Tipos baseados no schema real do banco (com nomes corretos das colunas)
export interface Empresa {
  id: number
  Estabelecimento: string // Nome correto da coluna
  Descricao: string // Nome correto da coluna
  created_at: string
  updated_at: string
}

export interface CentroCusto {
  id: number
  empresa_id: number
  nome: string
  codigo: string
  created_at: string
  updated_at: string
  empresas?: Empresa
}

export interface Turno {
  id: number
  empresa_id: number
  nome: string
  hora_inicio: string
  hora_fim: string
  tempo_refeicao: string
  created_at: string
  updated_at: string
  empresas?: Empresa
}

export interface Funcionario {
  id: number
  centro_custo_id: number
  turno_id: number
  matricula: string
  nome: string
  data_admissao: string
  data_demissao?: string
  ativo: boolean
  origem?: string
  observacoes?: string
  latitude?: number
  longitude?: number
  created_at: string
  updated_at: string
  centro_custos?: CentroCusto
  turnos?: Turno
}

// Interface corrigida para batidas de ponto com nomes corretos das colunas
export interface BatidaPonto {
  id: number
  funcionario_id: number
  centro_custo_id: number
  B1?: string // timestampz - MAIÚSCULA
  B2?: string // timestampz - MAIÚSCULA
  B3?: string // timestampz - MAIÚSCULA
  B4?: string // timestampz - MAIÚSCULA
  B5?: string // timestampz - MAIÚSCULA
  B6?: string // timestampz - MAIÚSCULA
  B7?: string // timestampz - MAIÚSCULA
  B8?: string // timestampz - MAIÚSCULA
  created_at?: string
  updated_at?: string
  // Relacionamentos
  funcionarios?: Funcionario
  centro_custos?: CentroCusto
}

// Vamos adicionar a interface Planejamento ao arquivo de tipos

export interface Planejamento {
  id: number
  empresa_id: number
  mes_ano: string
  dias_uteis: number
  horas_planejadas: number
  horas_extra: number
  horas_atraso: number
  horas_justificadas: number
  horas_realizadas: number
  percentual_atendimento: number
  data_inicio: string
  data_fim: string
  created_at: string
  updated_at: string
  // Dados da empresa (join manual)
  empresa_nome?: string
}

export interface Parametro {
  id: number
  user_id: string
  nome: string
  configuracao: any
  descricao?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface Notificacao {
  id: number
  parametro_id: number
  user_id: string
  titulo: string
  mensagem: string
  tipo: string
  lida: boolean
  data_envio: string
  data_leitura?: string
  created_at: string
  updated_at: string
  parametros?: Parametro
}

// Novas interfaces atualizadas conforme especificação

// Interface para tabela afastados
export interface Afastado {
  id: number
  id_empresa: number
  id_funcionario: number
  data_inicio: string
  data_fim: string
  motivo: string
  observacoes?: string
  created_at: string
  updated_at: string
  // Relacionamentos
  empresas?: Empresa
  funcionarios?: Funcionario
}

// Interface para tabela horas_justificadas
export interface HoraJustificada {
  id: number
  empresa_id: number
  centro_custo_id: number
  id_funcionario: number
  data_hora_ini: string
  data_hora_fim: string
  observacoes?: string
  ativo: boolean
  created_at: string
  updated_at: string
  // Relacionamentos
  empresas?: Empresa
  centro_custos?: CentroCusto
  funcionarios?: Funcionario
}

// Interface para tabela eventos
export interface Evento {
  id: number
  empresa_id: number
  centro_custo_id: number
  id_funcionario: number
  descricao: string
  qtd_horas: number
  tipo_horas: number // 1=Gerar como Extra, 2=Considerar como Dia Útil
  data_evento: string
  ativo: boolean
  created_at: string
  updated_at: string
  // Relacionamentos
  empresas?: Empresa
  centro_custos?: CentroCusto
  funcionarios?: Funcionario
}

// Nova interface para liberação de horas extras conforme especificação
export interface LiberarHoras {
  id: number
  empresa_id: number
  centro_custo_id: number
  id_funcionario: number
  tipo_liberacao: number // 1=Dia, 2=Semana, 3=Mês, 4=Ano, 5=Todos os dias
  data_liberacao: string
  horas_lib: number
  motivo?: string
  ativo: boolean
  created_at: string
  updated_at: string
  // Relacionamentos
  empresas?: Empresa
  centro_custos?: CentroCusto
  funcionarios?: Funcionario
}

// Interfaces antigas mantidas para compatibilidade
export interface LiberacaoHorasExtras {
  id: number
  empresa_id: number
  centro_custo_id: number
  funcionario_id: number
  data_inicio: string
  data_fim: string
  ativo: boolean
  observacoes?: string
  created_at: string
  updated_at: string
  // Relacionamentos
  empresas?: Empresa
  centro_custos?: CentroCusto
  funcionarios?: Funcionario
}

export interface Afastamento {
  id: number
  empresa_id: number
  centro_custo_id: number
  funcionario_id: number
  motivo: string
  data_inicio: string
  data_fim: string
  ativo: boolean
  observacoes?: string
  created_at: string
  updated_at: string
  // Relacionamentos
  empresas?: Empresa
  centro_custos?: CentroCusto
  funcionarios?: Funcionario
}

export interface HoraExtraPagar {
  id: number
  tipo: string // 'Feriado', 'Sábado', 'Ponte', 'Outros'
  data_evento: string
  empresa_id: number
  centro_custo_id?: number
  funcionario_id?: number
  quantidade_horas: number
  descricao?: string
  ativo: boolean
  created_at: string
  updated_at: string
  // Relacionamentos
  empresas?: Empresa
  centro_custos?: CentroCusto
  funcionarios?: Funcionario
}

// Funções melhoradas para upload de imagens
export const uploadFotoFuncionario = async (matricula: string, file: File) => {
  try {
    console.log(`📸 Iniciando upload da foto para matrícula: ${matricula}`)

    // Validar arquivo
    if (!file) {
      throw new Error("Arquivo não fornecido")
    }

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Tipo de arquivo não permitido: ${file.type}. Use: ${allowedTypes.join(", ")}`)
    }

    // Validar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error(`Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Máximo: 5MB`)
    }

    const fileName = `${matricula}.jpg`
    console.log(`📁 Nome do arquivo: ${fileName}`)

    const { data, error } = await supabase.storage.from("fotosfuncionarios").upload(fileName, file, {
      upsert: true,
      contentType: file.type,
    })

    if (error) {
      console.error("❌ Erro no upload:", error)
      throw error
    }

    console.log("✅ Upload realizado com sucesso:", data)
    return data
  } catch (error) {
    console.error("❌ Erro no uploadFotoFuncionario:", error)
    throw error
  }
}

export const uploadFotoPerfil = async (file: File, fileName: string) => {
  try {
    console.log(`📸 Iniciando upload da foto de perfil: ${fileName}`)

    // Validar arquivo
    if (!file) {
      throw new Error("Arquivo não fornecido")
    }

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Tipo de arquivo não permitido: ${file.type}. Use: ${allowedTypes.join(", ")}`)
    }

    // Validar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error(`Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Máximo: 5MB`)
    }

    console.log(`📁 Nome do arquivo: ${fileName}`)

    const { data, error } = await supabase.storage.from("fotosperfil").upload(fileName, file, {
      upsert: true,
      contentType: file.type,
    })

    if (error) {
      console.error("❌ Erro no upload:", error)
      throw error
    }

    console.log("✅ Upload realizado com sucesso:", data)
    return data
  } catch (error) {
    console.error("❌ Erro no uploadFotoPerfil:", error)
    throw error
  }
}

// Função melhorada para obter URL da foto do funcionário
// Cache global para URLs das fotos
const fotoUrlCache = new Map<string, { url: string; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export const getFotoFuncionarioUrl = (matricula: string) => {
  if (!matricula) {
    console.warn("⚠️ Matrícula não fornecida para getFotoFuncionarioUrl")
    return null
  }

  try {
    const now = Date.now()
    const cached = fotoUrlCache.get(matricula)
    
    // Verificar se temos cache válido
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log(`📋 URL em cache para matrícula ${matricula}: ${cached.url}`)
      return cached.url
    }

    const fileName = `${matricula}.jpg`
    const { data } = supabase.storage.from("fotosfuncionarios").getPublicUrl(fileName)

    const publicUrl = data.publicUrl
    console.log(`🔗 URL gerada para matrícula ${matricula}: ${publicUrl}`)

    // Usar timestamp mais estável para cache (renovado a cada 5 minutos)
    const cacheTimestamp = Math.floor(now / CACHE_DURATION) * CACHE_DURATION
    const urlWithTimestamp = `${publicUrl}?v=${cacheTimestamp}`

    // Armazenar no cache
    fotoUrlCache.set(matricula, { url: urlWithTimestamp, timestamp: now })

    return urlWithTimestamp
  } catch (error) {
    console.error(`❌ Erro ao obter URL da foto para matrícula ${matricula}:`, error)
    return null
  }
}

// Cache global para URLs das fotos de perfil
const fotoPerfilUrlCache = new Map<string, { url: string; timestamp: number }>();

export const getFotoPerfilUrl = async (fileName: string) => {
  if (!fileName) {
    console.warn("⚠️ Nome do arquivo não fornecido para getFotoPerfilUrl")
    return null
  }

  try {
    console.log(`🔍 Buscando URL para foto de perfil: ${fileName}`)
    
    const now = Date.now()
    const cached = fotoPerfilUrlCache.get(fileName)
    
    // Verificar se temos cache válido
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log(`📋 URL em cache para arquivo ${fileName}: ${cached.url}`)
      return cached.url
    }
    
    // Verificar se o arquivo existe antes de gerar a URL
    const fotoExiste = await verificarFotoPerfilExiste(fileName)
    if (!fotoExiste) {
      console.log(`📷 Arquivo ${fileName} não encontrado no bucket fotosperfil`)
      return null
    }
    
    const { data } = supabase.storage.from("fotosperfil").getPublicUrl(fileName)

    if (!data || !data.publicUrl) {
      console.error(`❌ Erro ao gerar URL pública para ${fileName}: dados inválidos`)
      return null
    }

    const publicUrl = data.publicUrl
    console.log(`🔗 URL gerada para arquivo ${fileName}: ${publicUrl}`)

    // Verificar se a URL é válida
    if (!publicUrl.includes('fotosperfil')) {
      console.error(`❌ URL gerada não contém o bucket correto: ${publicUrl}`)
      return null
    }

    // Usar timestamp mais estável para cache (renovado a cada 5 minutos)
    const cacheTimestamp = Math.floor(now / CACHE_DURATION) * CACHE_DURATION
    const urlWithTimestamp = `${publicUrl}?v=${cacheTimestamp}`
    
    // Armazenar no cache
    fotoPerfilUrlCache.set(fileName, { url: urlWithTimestamp, timestamp: now })

    console.log(`✅ URL final para ${fileName}: ${urlWithTimestamp}`)
    return urlWithTimestamp
  } catch (error) {
    console.error(`❌ Erro ao obter URL da foto para arquivo ${fileName}:`, error)
    return null
  }
}

// Função melhorada para verificar se a foto existe no bucket
export const verificarFotoExiste = async (matricula: string) => {
  if (!matricula) {
    console.warn("⚠️ Matrícula não fornecida para verificarFotoExiste")
    return false
  }

  try {
    const fileName = `${matricula}.jpg`
    console.log(`🔍 Verificando existência da foto: ${fileName}`)

    const { data, error } = await supabase.storage.from("fotosfuncionarios").list("", {
      search: fileName,
      limit: 1,
    })

    if (error) {
      console.error(`❌ Erro ao verificar foto da matrícula ${matricula}:`, error)
      return false
    }

    const fotoExiste = data && data.length > 0
    console.log(`📸 Foto da matrícula ${matricula} existe: ${fotoExiste}`)

    if (fotoExiste && data[0]) {
      console.log(`📊 Detalhes da foto:`, {
        nome: data[0].name,
        tamanho: data[0].metadata?.size,
        tipo: data[0].metadata?.mimetype,
        criado: data[0].created_at,
        atualizado: data[0].updated_at,
      })
    }

    return fotoExiste
  } catch (error) {
    console.error(`❌ Erro ao verificar foto da matrícula ${matricula}:`, error)
    return false
  }
}

// Função para verificar se foto de perfil existe
export const verificarFotoPerfilExiste = async (fileName: string) => {
  if (!fileName) {
    console.warn("⚠️ Nome do arquivo não fornecido para verificarFotoPerfilExiste")
    return false
  }

  try {
    console.log(`🔍 Verificando existência da foto de perfil: ${fileName}`)

    const { data, error } = await supabase.storage.from("fotosperfil").list("", {
      search: fileName,
      limit: 1,
    })

    if (error) {
      console.error(`❌ Erro ao verificar foto de perfil ${fileName}:`, error)
      return false
    }

    const fotoExiste = data && data.length > 0
    console.log(`📸 Foto de perfil ${fileName} existe: ${fotoExiste}`)

    return fotoExiste
  } catch (error) {
    console.error(`❌ Erro ao verificar foto de perfil ${fileName}:`, error)
    return false
  }
}

// Função melhorada para listar todas as fotos no bucket
export const listarFotosFuncionarios = async () => {
  try {
    console.log("📋 Listando fotos de funcionários...")

    const { data, error } = await supabase.storage.from("fotosfuncionarios").list("", {
      limit: 100,
      sortBy: { column: "name", order: "asc" },
    })

    if (error) {
      console.error("❌ Erro ao listar fotos:", error)
      return []
    }

    console.log(`📊 Fotos encontradas no bucket: ${data?.length || 0}`)

    if (data && data.length > 0) {
      console.log(
        "📸 Primeiras 5 fotos:",
        data.slice(0, 5).map((f) => ({
          nome: f.name,
          tamanho: f.metadata?.size,
          criado: f.created_at,
        })),
      )
    }

    return data || []
  } catch (error) {
    console.error("❌ Erro ao listar fotos:", error)
    return []
  }
}

// Função para listar fotos de perfil
export const listarFotosPerfil = async () => {
  try {
    console.log("📋 Listando fotos de perfil...")

    const { data, error } = await supabase.storage.from("fotosperfil").list("", {
      limit: 100,
      sortBy: { column: "name", order: "asc" },
    })

    if (error) {
      console.error("❌ Erro ao listar fotos de perfil:", error)
      return []
    }

    console.log(`📊 Fotos de perfil encontradas: ${data?.length || 0}`)
    return data || []
  } catch (error) {
    console.error("❌ Erro ao listar fotos de perfil:", error)
    return []
  }
}

// Função para testar conectividade com storage
export const testarStorage = async () => {
  try {
    console.log("🧪 Testando conectividade com storage...")

    // Listar buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error("❌ Erro ao listar buckets:", bucketsError)
      return false
    }

    console.log(
      "📦 Buckets disponíveis:",
      buckets?.map((b) => ({
        id: b.id,
        name: b.name,
        public: b.public,
      })),
    )

    // Verificar bucket fotosfuncionarios
    const fotosFuncionarios = buckets?.find((b) => b.id === "fotosfuncionarios")
    const fotosPerfil = buckets?.find((b) => b.id === "fotosperfil")

    console.log("📸 Bucket fotosfuncionarios:", fotosFuncionarios ? "✅ Existe" : "❌ Não existe")
    console.log("👤 Bucket fotosperfil:", fotosPerfil ? "✅ Existe" : "❌ Não existe")

    return true
  } catch (error) {
    console.error("❌ Erro no teste de storage:", error)
    return false
  }
}
