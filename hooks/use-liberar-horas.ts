"use client"

import { useState, useEffect } from "react"
import { supabase, type LiberarHoras } from "@/lib/supabase"
import { toast } from "sonner"

export function useLiberarHoras() {
  const [liberacoes, setLiberacoes] = useState<LiberarHoras[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLiberacoes = async () => {
    try {
      setLoading(true)
      console.log("🔍 Buscando liberações de horas...")
      console.log("📍 Passo 1: Verificando cliente Supabase")
      
      if (!supabase) {
        throw new Error("Cliente Supabase não inicializado")
      }
      
      console.log("📍 Passo 2: Verificando autenticação")
      // Verificar autenticação
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error("❌ Erro de autenticação:", authError)
        throw new Error(`Erro de autenticação: ${authError.message}`)
      }
      
      if (!user) {
        console.error("❌ Usuário não autenticado")
        throw new Error("Usuário não autenticado")
      }
      
      console.log("✅ Usuário autenticado:", user.email)
      console.log("📍 Passo 3: Executando query de teste")

      // Primeiro, vamos testar uma query simples
      console.log("🧪 Testando conexão com query simples...")
      const { data: testData, error: testError } = await supabase
        .from('liberar_horas')
        .select('id')
        .limit(1)

      if (testError) {
        console.error("❌ Erro na query de teste:", {
          message: testError.message,
          details: testError.details,
          hint: testError.hint,
          code: testError.code
        })
        throw testError
      }

      console.log("✅ Conexão OK, executando query completa...")
      console.log("📍 Passo 4: Construindo query principal")

      // Query otimizada com joins diretos do Supabase
      console.log("📍 Passo 5: Executando query com joins")
      const { data, error } = await supabase
        .from('liberar_horas')
        .select(`
          id,
          empresa_id,
          centro_custo_id,
          id_funcionario,
          data_liberacao,
          horas_lib,
          tipo_liberacao,
          motivo,
          created_at,
          funcionarios (
            id,
            nome,
            matricula
          ),
          empresas (
            id,
            Estabelecimento,
            Descricao
          ),
          centro_custos (
            id,
            nome,
            codigo
          )
        `)        .order('created_at', { ascending: false })
        
      console.log("📍 Passo 6: Verificando resultado da query")

      if (error) {
        console.error("❌ Erro ao buscar liberações:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log("✅ Liberações encontradas:", data?.length || 0)
      if (data && data.length > 0) {
        console.log("📊 Primeira liberação:", data[0])
      }

      // Os dados já vêm com os relacionamentos corretos do Supabase
      setLiberacoes(data || [])
    } catch (error) {
      console.error("❌ Erro ao buscar liberações - Tipo:", typeof error)
      console.error("❌ Erro ao buscar liberações - É Error:", error instanceof Error)
      
      // Log detalhado do erro
      if (error instanceof Error) {
        console.error("❌ Error.message:", error.message)
        console.error("❌ Error.name:", error.name)
        console.error("❌ Error.stack:", error.stack)
      }
      
      // Tentar serializar o erro completo
      try {
        console.error("❌ Erro serializado:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
      } catch (serializationError) {
        console.error("❌ Erro ao serializar erro:", serializationError)
        console.error("❌ Erro original (toString):", String(error))
      }
      
      // Verificar propriedades específicas do Supabase
      if (error && typeof error === 'object') {
        const errorObj = error as any
        
        // Listar todas as propriedades do objeto de erro
        console.error("❌ Todas as propriedades do erro:", Object.keys(errorObj))
        console.error("❌ Todas as propriedades (incluindo não-enumeráveis):", Object.getOwnPropertyNames(errorObj))
        
        // Verificar propriedades específicas
        console.error("❌ Propriedades do erro:", {
          message: errorObj.message || 'N/A',
          details: errorObj.details || 'N/A',
          hint: errorObj.hint || 'N/A',
          code: errorObj.code || 'N/A',
          status: errorObj.status || 'N/A',
          statusText: errorObj.statusText || 'N/A',
          name: errorObj.name || 'N/A',
          stack: errorObj.stack ? 'Presente' : 'N/A'
        })
        
        // Verificar se é um erro customizado nosso
        if (errorObj.message && typeof errorObj.message === 'string') {
          console.error("❌ Mensagem do erro:", errorObj.message)
          if (errorObj.message.includes('Erro de autenticação') || errorObj.message.includes('não autenticado')) {
            console.error("🔍 Este é um erro de autenticação customizado")
          }
        }
      }
      
      toast.error("Erro ao carregar liberações de horas")
      setLiberacoes([])
    } finally {
      setLoading(false)
    }
  }

  const createLiberacao = async (liberacao: Omit<LiberarHoras, "id" | "created_at" | "updated_at">) => {
    try {
      console.log("➕ Criando nova liberação:", liberacao)

      // Validar se as referências existem antes de inserir
      const { data: empresaExists } = await supabase
        .from("empresas")
        .select("id")
        .eq("id", liberacao.empresa_id)
        .single()

      if (!empresaExists) {
        throw new Error(`Empresa com ID ${liberacao.empresa_id} não encontrada`)
      }

      const { data: centroCustoExists } = await supabase
        .from("centro_custos")
        .select("id")
        .eq("id", liberacao.centro_custo_id)
        .single()

      if (!centroCustoExists) {
        throw new Error(`Centro de custo com ID ${liberacao.centro_custo_id} não encontrado`)
      }

      const { data: funcionarioExists } = await supabase
        .from("funcionarios")
        .select("id")
        .eq("id", liberacao.id_funcionario)
        .single()

      if (!funcionarioExists) {
        throw new Error(`Funcionário com ID ${liberacao.id_funcionario} não encontrado`)
      }

      const dadosParaInserir = {
        ...liberacao
      }

      console.log("✅ Todas as referências validadas, inserindo dados:", dadosParaInserir)

      const { data, error } = await supabase.from("liberar_horas").insert([dadosParaInserir]).select().single()

      if (error) {
        console.error("❌ Erro ao inserir - Detalhes completos:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          errorObject: error
        })
        console.error("❌ Dados que causaram o erro:", dadosParaInserir)
        throw error
      }

      console.log("✅ Liberação criada:", data)
      await fetchLiberacoes()
      toast.success("Liberação de horas criada com sucesso!")
      return data
    } catch (error: any) {
      console.error("❌ Erro ao criar liberação - Detalhes completos:", {
        message: error?.message || 'Erro desconhecido',
        details: error?.details || 'Sem detalhes',
        hint: error?.hint || 'Sem dicas',
        code: error?.code || 'Sem código',
        stack: error?.stack || 'Sem stack trace',
        fullError: error
      })
      
      // Log específico para diferentes tipos de erro
      if (error?.code) {
        console.error(`❌ Código do erro: ${error.code}`)
      }
      
      if (error?.message?.includes('violates check constraint')) {
        console.error('❌ Violação de constraint detectada - verifique os valores dos campos')
        toast.error('Erro: Valores inválidos nos campos do formulário')
      } else if (error?.message?.includes('foreign key')) {
        console.error('❌ Erro de chave estrangeira detectado')
        toast.error('Erro: Referência inválida nos dados')
      } else {
        toast.error(`Erro ao criar liberação: ${error?.message || 'Erro desconhecido'}`)
      }
      
      throw new Error(`❌ Erro ao inserir - Detalhes completos: ${JSON.stringify({
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      })}`)
    }
  }

  const updateLiberacao = async (id: number, updates: Partial<LiberarHoras>) => {
    try {
      console.log("✏️ Atualizando liberação:", id, updates)

      const { data, error } = await supabase.from("liberar_horas").update(updates).eq("id", id).select().single()

      if (error) {
        console.error("❌ Erro ao atualizar:", error)
        throw error
      }

      console.log("✅ Liberação atualizada:", data)
      await fetchLiberacoes()
      toast.success("Liberação atualizada com sucesso!")
      return data
    } catch (error) {
      console.error("❌ Erro ao atualizar liberação:", error)
      toast.error("Erro ao atualizar liberação")
      throw error
    }
  }

  const deleteLiberacao = async (id: number) => {
    try {
      console.log("🗑️ Removendo liberação:", id)

      const { error } = await supabase.from("liberar_horas").delete().eq("id", id)

      if (error) {
        console.error("❌ Erro ao remover:", error)
        throw error
      }

      console.log("✅ Liberação removida")
      await fetchLiberacoes()
      toast.success("Liberação removida com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao remover liberação:", error)
      toast.error("Erro ao remover liberação")
      throw error
    }
  }

  useEffect(() => {
    const initializeLiberacoes = async () => {
      try {
        console.log("🚀 Inicializando hook useLiberarHoras...")
        await fetchLiberacoes()
      } catch (error) {
        console.error("❌ Erro na inicialização do hook:", error)
        setLoading(false)
        // Não relançar o erro para evitar quebrar o componente
      }
    }
    
    initializeLiberacoes()
  }, [])

  return {
    liberacoes,
    loading,
    createLiberacao,
    updateLiberacao,
    deleteLiberacao,
    refetch: fetchLiberacoes,
  }
}
