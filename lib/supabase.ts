import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Verificar se as variáveis estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL e Anon Key são obrigatórios")
}

// Cria um cliente Supabase para uso no lado do cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Cria um cliente Supabase para uso no lado do servidor
export const createServerSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

// Tipos para as tabelas do Supabase
export type Tables = {
  empresa: {
    id_empresa: string
    cod_estabel: string
    descricao: string
    created_at: string
    updated_at: string
  }
  turno: {
    id_turno: string
    nome: string
    hr_entrada: string
    hr_saida: string
    tempo_refeicao: number
    id_empresa: string
    created_at: string
    updated_at: string
  }
  centro_custo: {
    id_centro: string
    codigo: string
    descricao: string
    id_empresa: string
    created_at: string
    updated_at: string
  }
  funcionario: {
    id_matricula: string
    matricula: string
    nome: string
    email: string | null
    id_turno: string
    id_centro: string
    data_adm: string
    data_demis: string | null
    foto_url: string | null
    ativo: boolean
    created_at: string
    updated_at: string
  }
  ponto: {
    id: number
    id_matricula: string
    id_turno: string
    id_centro: string
    data: string
    batida1: string | null
    batida2: string | null
    batida3: string | null
    batida4: string | null
    batida5: string | null
    batida6: string | null
    batida7: string | null
    batida8: string | null
    total_horas: number | null
    status: "positivo" | "negativo" | null
    user_input: string | null
    user_input_alt: string | null
    created_at: string
    updated_at: string
  }
  planejamento: {
    id: string
    id_matricula: string
    mes: string
    horas_planejadas: number
    horas_realizadas: number
    horas_extra: number
    horas_falta: number
    created_at: string
    updated_at: string
  }
  parametrizador: {
    id_parametro: string
    id_user: string
    limite_extra_dia: number
    limite_falta: number
    limite_extra_mes: number
    limite_atras_dia: number
    status: boolean
    data_parametro: string
    id_centro: string | null
    push_ativo: boolean
    created_at: string
    updated_at: string
  }
  notificacoes: {
    id_notificacao: string
    id_user: string
    id_parametro: string | null
    id_matricula: string | null
    id_data_not: string
    mensagem: string
    lida: boolean
    created_at: string
    updated_at: string
  }
}

// Tipos para as views do Supabase
export type Views = {
  vw_funcionarios: {
    id_matricula: string
    matricula: string
    nome: string
    email: string | null
    ativo: boolean
    data_adm: string
    data_demis: string | null
    foto_url: string | null
    id_empresa: string
    empresa_codigo: string
    empresa_nome: string
    id_centro: string
    centro_codigo: string
    centro_nome: string
    id_turno: string
    turno_nome: string
    hr_entrada: string
    hr_saida: string
    tempo_refeicao: number
  }
  vw_pontos: {
    id: number
    data: string
    batida1: string | null
    batida2: string | null
    batida3: string | null
    batida4: string | null
    batida5: string | null
    batida6: string | null
    batida7: string | null
    batida8: string | null
    total_horas: number | null
    status: "positivo" | "negativo" | null
    id_matricula: string
    matricula: string
    funcionario_nome: string
    id_centro: string
    centro_nome: string
    id_turno: string
    turno_nome: string
    id_empresa: string
    empresa_nome: string
    registrado_por: string | null
    alterado_por: string | null
  }
  vw_planejamento: {
    id: string
    mes: string
    horas_planejadas: number
    horas_realizadas: number
    horas_extra: number
    horas_falta: number
    id_matricula: string
    matricula: string
    funcionario_nome: string
    id_centro: string
    centro_nome: string
    id_empresa: string
    empresa_nome: string
  }
  vw_notificacoes: {
    id_notificacao: string
    mensagem: string
    lida: boolean
    id_data_not: string
    usuario_email: string
    funcionario_nome: string | null
    matricula: string | null
  }
}
