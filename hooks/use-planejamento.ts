"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export interface Planejamento {
  id: number
  empresa_id: number
  dias_uteis: number
  descricao: string
  data_inicio: string
  data_fim: string
  status: string
  created_at?: string
  updated_at?: string
  // Dados da empresa (join)
  empresa_nome?: string
}

export interface PlanejamentoInput {
  empresa_id: number
  dias_uteis: number
  descricao: string
  data_inicio: string
  data_fim: string
  status: string
}

export function usePlanejamento() {
  const [planejamentos, setPlanejamentos] = useState<Planejamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState<boolean | null>(null)
  const [statusOptions, setStatusOptions] = useState<string[]>([])
  const [validInactiveStatus, setValidInactiveStatus] = useState<string>("inativo")
  const { toast } = useToast()

  // Verificar valores válidos para status e descobrir o valor correto para "inativo"
  const checkStatusOptions = async () => {
    try {
      console.log("🔍 Verificando opções de status...")

      // Primeiro, tentar buscar valores únicos existentes
      const { data: existingStatuses, error: statusError } = await supabase.from("planejamentos").select("status")

      if (!statusError && existingStatuses && existingStatuses.length > 0) {
        const uniqueStatuses = [...new Set(existingStatuses.map((p) => p.status).filter(Boolean))]
        console.log("📋 Status existentes encontrados:", uniqueStatuses)
        setStatusOptions(uniqueStatuses)

        // Tentar identificar qual é o status "inativo" correto
        const possibleInactiveValues = ["inativo", "Inativo", "INATIVO", "inactive", "desativado", "pausado"]
        const foundInactive = uniqueStatuses.find((status) =>
          possibleInactiveValues.some((possible) => status.toLowerCase().includes(possible.toLowerCase())),
        )

        if (foundInactive) {
          console.log("✅ Status inativo identificado:", foundInactive)
          setValidInactiveStatus(foundInactive)
        } else {
          // Se não encontrar, usar o segundo status da lista (assumindo que o primeiro é ativo)
          if (uniqueStatuses.length > 1) {
            console.log("⚠️ Usando segundo status como inativo:", uniqueStatuses[1])
            setValidInactiveStatus(uniqueStatuses[1])
          }
        }

        return uniqueStatuses
      }

      // Se não houver dados, tentar descobrir através de teste
      console.log("🧪 Testando valores de status...")
      const testValues = ["ativo", "inativo", "Ativo", "Inativo", "ATIVO", "INATIVO", "planejado", "concluido"]

      for (const testValue of testValues) {
        try {
          // Tentar fazer uma query que forçaria o erro se o valor não for válido
          const { error: testError } = await supabase
            .from("planejamentos")
            .select("id")
            .eq("status", testValue)
            .limit(1)

          if (!testError) {
            console.log("✅ Status válido encontrado:", testValue)
            // Não adicionar duplicatas
            setStatusOptions((prev) => (prev.includes(testValue) ? prev : [...prev, testValue]))

            // Se parece com "inativo", usar como padrão
            if (testValue.toLowerCase().includes("inativo") || testValue.toLowerCase().includes("inactive")) {
              setValidInactiveStatus(testValue)
            }
          }
        } catch (err) {
          console.log("❌ Status inválido:", testValue)
        }
      }

      // Fallback para valores muito básicos
      const basicStatuses = ["ativo", "inativo"]
      console.log("📋 Usando status padrão:", basicStatuses)
      setStatusOptions((prev) => (prev.length > 0 ? prev : basicStatuses))
      return statusOptions.length > 0 ? statusOptions : basicStatuses
    } catch (err) {
      console.error("❌ Erro ao verificar status:", err)
      // Fallback para valores muito básicos
      const basicStatuses = ["ativo", "inativo"]
      setStatusOptions(basicStatuses)
      return basicStatuses
    }
  }

  // Verificar se a tabela existe
  const checkTableExists = async (): Promise<boolean> => {
    try {
      console.log("🔍 Verificando tabela planejamentos...")

      const { error: tableError } = await supabase.from("planejamentos").select("id").limit(1)

      if (tableError) {
        console.log("❌ Tabela planejamentos não existe:", tableError.message)
        setTableExists(false)
        return false
      }

      console.log("✅ Tabela planejamentos existe!")
      setTableExists(true)

      // Verificar opções de status
      await checkStatusOptions()
      return true
    } catch (err) {
      console.error("❌ Erro ao verificar tabela:", err)
      setTableExists(false)
      return false
    }
  }

  // Buscar todos os planejamentos
  const fetchPlanejamentos = async () => {
    try {
      setLoading(true)
      setError(null)

      // Verificar se a tabela existe primeiro
      const exists = await checkTableExists()
      if (!exists) {
        setError("A tabela 'planejamentos' não existe no banco de dados.")
        setPlanejamentos([])
        return
      }

      console.log("📊 Buscando planejamentos...")

      // Buscar todos os dados
      const { data: planejamentosData, error: planejamentosError } = await supabase
        .from("planejamentos")
        .select("*")
        .order("data_inicio", { ascending: false })

      if (planejamentosError) {
        console.error("Erro ao buscar planejamentos:", planejamentosError)
        setError(planejamentosError.message)
        return
      }

      console.log(`📋 ${planejamentosData?.length || 0} planejamentos encontrados`)

      if (!planejamentosData || planejamentosData.length === 0) {
        setPlanejamentos([])
        return
      }

      // Buscar as empresas separadamente
      console.log("🏢 Buscando dados das empresas...")
      const { data: empresasData, error: empresasError } = await supabase.from("empresas").select("id, Estabelecimento")

      if (empresasError) {
        console.error("Aviso: Erro ao buscar empresas:", empresasError)
      }

      // Combinar os dados manualmente
      const planejamentosComEmpresa = planejamentosData.map((planejamento) => {
        const empresa = empresasData?.find((emp) => emp.id === planejamento.empresa_id)
        return {
          ...planejamento,
          empresa_nome: empresa?.Estabelecimento || `Empresa ID: ${planejamento.empresa_id}`,
        }
      })

      console.log("✅ Dados processados com sucesso")
      console.log("📋 Primeiro registro:", planejamentosComEmpresa[0])
      setPlanejamentos(planejamentosComEmpresa)
    } catch (err) {
      console.error("Erro inesperado:", err)
      setError("Erro inesperado ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  // Adicionar nova função para verificar planejamentos conflitantes
  const checkPlanejamentoConflito = async (
    empresa_id: number,
    data_inicio: string,
    data_fim: string,
    status: string,
    excludeId?: number,
  ): Promise<{ hasConflict: boolean; conflictingPlanejamentos: Planejamento[] }> => {
    try {
      console.log("🔍 Verificando conflitos de planejamento...")
      console.log("Parâmetros:", { empresa_id, data_inicio, data_fim, status, excludeId })

      // Se o status não for "ativo", não há conflito
      const normalizedStatus = status
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_")

      if (normalizedStatus !== "ativo") {
        return { hasConflict: false, conflictingPlanejamentos: [] }
      }

      // Buscar planejamentos ativos da mesma empresa no mesmo período
      let query = supabase
        .from("planejamentos")
        .select("*")
        .eq("empresa_id", empresa_id)
        .or(`data_inicio.lte.${data_fim},data_fim.gte.${data_inicio}`)

      // Excluir o planejamento atual se estiver editando
      if (excludeId) {
        query = query.neq("id", excludeId)
      }

      const { data: allConflicting, error } = await query

      if (error) {
        console.error("Erro ao verificar conflitos:", error)
        return { hasConflict: false, conflictingPlanejamentos: [] }
      }

      // Filtrar apenas os que têm status "ativo" (considerando diferentes formatos)
      const conflictingData = allConflicting?.filter((p) => {
        const pStatus = p.status
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "_")
        return pStatus === "ativo"
      })

      console.log(`📋 ${conflictingData?.length || 0} planejamentos conflitantes encontrados`)

      return {
        hasConflict: (conflictingData?.length || 0) > 0,
        conflictingPlanejamentos: conflictingData || [],
      }
    } catch (err) {
      console.error("Erro inesperado ao verificar conflitos:", err)
      return { hasConflict: false, conflictingPlanejamentos: [] }
    }
  }

  // Função melhorada para inativar planejamentos conflitantes
  const inativarPlanejamentosConflitantes = async (planejamentosIds: number[]): Promise<boolean> => {
    try {
      console.log("🔄 Inativando planejamentos conflitantes:", planejamentosIds)
      console.log("🔄 Usando status inativo:", validInactiveStatus)

      // Tentar diferentes valores para "inativo" até encontrar um que funcione
      const possibleInactiveValues = [
        validInactiveStatus,
        "inativo",
        "Inativo",
        "INATIVO",
        "inactive",
        "desativado",
        "pausado",
        // Se nenhum funcionar, tentar o segundo status da lista
        statusOptions.length > 1 ? statusOptions[1] : "inativo",
      ]

      let success = false
      let lastError = null

      for (const inactiveValue of possibleInactiveValues) {
        try {
          console.log(`🧪 Tentando inativar com status: "${inactiveValue}"`)

          const { error } = await supabase
            .from("planejamentos")
            .update({ status: inactiveValue })
            .in("id", planejamentosIds)

          if (!error) {
            console.log(`✅ Sucesso com status: "${inactiveValue}"`)
            setValidInactiveStatus(inactiveValue) // Salvar para próximas vezes
            success = true
            break
          } else {
            console.log(`❌ Falhou com status: "${inactiveValue}" - ${error.message}`)
            lastError = error
          }
        } catch (err) {
          console.log(`❌ Erro com status: "${inactiveValue}"`, err)
          lastError = err
        }
      }

      if (!success) {
        console.error("❌ Nenhum valor de status inativo funcionou. Último erro:", lastError)
        return false
      }

      console.log("✅ Planejamentos inativados com sucesso")
      return true
    } catch (err) {
      console.error("Erro inesperado ao inativar planejamentos:", err)
      return false
    }
  }

  // Criar novo planejamento
  const createPlanejamento = async (
    planejamentoData: PlanejamentoInput,
    inativarConflitantes = false,
  ): Promise<boolean> => {
    try {
      console.log("=== CRIANDO PLANEJAMENTO ===")
      console.log("Dados recebidos:", planejamentoData)
      console.log("Inativar conflitantes:", inativarConflitantes)

      // Verificar se a tabela existe
      const exists = await checkTableExists()
      if (!exists) {
        toast({
          title: "❌ Tabela não encontrada",
          description: "A tabela 'planejamentos' não existe.",
          variant: "destructive",
        })
        return false
      }

      // Normalizar o status
      const statusNormalizado = planejamentoData.status
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_")

      // Verificar conflitos apenas se o status for "ativo"
      if (statusNormalizado === "ativo") {
        const { hasConflict, conflictingPlanejamentos } = await checkPlanejamentoConflito(
          planejamentoData.empresa_id,
          planejamentoData.data_inicio,
          planejamentoData.data_fim,
          statusNormalizado,
        )

        if (hasConflict) {
          if (inativarConflitantes) {
            // Inativar planejamentos conflitantes
            const conflictingIds = conflictingPlanejamentos.map((p) => p.id)
            const inativadoComSucesso = await inativarPlanejamentosConflitantes(conflictingIds)

            if (!inativadoComSucesso) {
              toast({
                title: "❌ Erro ao inativar conflitos",
                description:
                  "Não foi possível inativar os planejamentos conflitantes. Verifique os valores de status aceitos.",
                variant: "destructive",
              })
              return false
            }

            toast({
              title: "ℹ️ Planejamentos inativados",
              description: `${conflictingIds.length} planejamento(s) conflitante(s) foram inativados.`,
            })
          } else {
            // Mostrar erro de conflito
            const periodos = conflictingPlanejamentos
              .map((p) => {
                const inicio = new Date(p.data_inicio)
                const fim = new Date(p.data_fim)
                if (inicio.getMonth() === fim.getMonth() && inicio.getFullYear() === fim.getFullYear()) {
                  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
                  return `${meses[inicio.getMonth()]}/${inicio.getFullYear()}`
                }
                return `${inicio.toLocaleDateString()} - ${fim.toLocaleDateString()}`
              })
              .join(", ")

            toast({
              title: "⚠️ Conflito de planejamento",
              description: `Já existe planejamento ativo para esta empresa no período: ${periodos}`,
              variant: "destructive",
            })
            return false
          }
        }
      }

      // Preparar dados para inserção
      const dadosParaInserir = {
        empresa_id: planejamentoData.empresa_id,
        dias_uteis: planejamentoData.dias_uteis,
        descricao: planejamentoData.descricao,
        data_inicio: planejamentoData.data_inicio,
        data_fim: planejamentoData.data_fim,
        status: statusNormalizado,
      }

      console.log("Dados finais para inserir:", dadosParaInserir)

      const { data, error } = await supabase.from("planejamentos").insert([dadosParaInserir]).select()

      if (error) {
        console.error("Erro ao criar:", error)

        if (error.message.includes("check constraint") && error.message.includes("status")) {
          toast({
            title: "❌ Erro de Status",
            description: `Status "${statusNormalizado}" não é válido. Valores aceitos: ${statusOptions.join(", ")}`,
          })
        } else {
          toast({
            title: "❌ Erro ao criar",
            description: error.message,
            variant: "destructive",
          })
        }
        return false
      }

      console.log("✅ Criado com sucesso:", data)
      toast({
        title: "✅ Sucesso",
        description: "Planejamento criado com sucesso",
      })

      // Recarregar lista
      await fetchPlanejamentos()
      return true
    } catch (err) {
      console.error("Erro inesperado:", err)
      toast({
        title: "❌ Erro inesperado",
        description: "Erro inesperado ao criar planejamento",
        variant: "destructive",
      })
      return false
    }
  }

  // Atualizar planejamento
  const updatePlanejamento = async (
    id: number,
    planejamentoData: Partial<PlanejamentoInput>,
    inativarConflitantes = false,
  ): Promise<boolean> => {
    try {
      console.log("=== ATUALIZANDO PLANEJAMENTO ===")
      console.log("ID:", id, "Dados:", planejamentoData)
      console.log("Inativar conflitantes:", inativarConflitantes)

      // Verificar se a tabela existe
      const exists = await checkTableExists()
      if (!exists) {
        toast({
          title: "❌ Tabela não encontrada",
          description: "A tabela 'planejamentos' não existe.",
          variant: "destructive",
        })
        return false
      }

      // Normalizar o status se fornecido
      const dadosParaAtualizar = { ...planejamentoData }
      if (dadosParaAtualizar.status) {
        dadosParaAtualizar.status = dadosParaAtualizar.status
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "_")
      }

      // Verificar conflitos apenas se o status for "ativo" e os dados necessários estiverem presentes
      if (
        dadosParaAtualizar.status === "ativo" &&
        dadosParaAtualizar.empresa_id &&
        dadosParaAtualizar.data_inicio &&
        dadosParaAtualizar.data_fim
      ) {
        const { hasConflict, conflictingPlanejamentos } = await checkPlanejamentoConflito(
          dadosParaAtualizar.empresa_id,
          dadosParaAtualizar.data_inicio,
          dadosParaAtualizar.data_fim,
          dadosParaAtualizar.status,
          id, // Excluir o planejamento atual da verificação
        )

        if (hasConflict) {
          if (inativarConflitantes) {
            // Inativar planejamentos conflitantes
            const conflictingIds = conflictingPlanejamentos.map((p) => p.id)
            const inativadoComSucesso = await inativarPlanejamentosConflitantes(conflictingIds)

            if (!inativadoComSucesso) {
              toast({
                title: "❌ Erro ao inativar conflitos",
                description:
                  "Não foi possível inativar os planejamentos conflitantes. Verifique os valores de status aceitos.",
                variant: "destructive",
              })
              return false
            }

            toast({
              title: "ℹ️ Planejamentos inativados",
              description: `${conflictingIds.length} planejamento(s) conflitante(s) foram inativados.`,
            })
          } else {
            // Mostrar erro de conflito
            const periodos = conflictingPlanejamentos
              .map((p) => {
                const inicio = new Date(p.data_inicio)
                const fim = new Date(p.data_fim)
                if (inicio.getMonth() === fim.getMonth() && inicio.getFullYear() === fim.getFullYear()) {
                  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
                  return `${meses[inicio.getMonth()]}/${inicio.getFullYear()}`
                }
                return `${inicio.toLocaleDateString()} - ${fim.toLocaleDateString()}`
              })
              .join(", ")

            toast({
              title: "⚠️ Conflito de planejamento",
              description: `Já existe planejamento ativo para esta empresa no período: ${periodos}`,
              variant: "destructive",
            })
            return false
          }
        }
      }

      const { data, error } = await supabase.from("planejamentos").update(dadosParaAtualizar).eq("id", id).select()

      if (error) {
        console.error("Erro ao atualizar:", error)

        if (error.message.includes("check constraint") && error.message.includes("status")) {
          toast({
            title: "❌ Erro de Status",
            description: `Status não é válido. Valores aceitos: ${statusOptions.join(", ")}`,
          })
        } else {
          toast({
            title: "❌ Erro ao atualizar",
            description: error.message,
            variant: "destructive",
          })
        }
        return false
      }

      console.log("✅ Atualizado com sucesso:", data)
      toast({
        title: "✅ Sucesso",
        description: "Planejamento atualizado com sucesso",
      })

      // Recarregar lista
      await fetchPlanejamentos()
      return true
    } catch (err) {
      console.error("Erro inesperado:", err)
      toast({
        title: "❌ Erro inesperado",
        description: "Erro inesperado ao atualizar",
        variant: "destructive",
      })
      return false
    }
  }

  // Deletar planejamento
  const deletePlanejamento = async (id: number): Promise<boolean> => {
    try {
      console.log("=== DELETANDO PLANEJAMENTO ===")

      // Verificar se a tabela existe
      const exists = await checkTableExists()
      if (!exists) {
        toast({
          title: "❌ Tabela não encontrada",
          description: "A tabela 'planejamentos' não existe.",
          variant: "destructive",
        })
        return false
      }

      const { error } = await supabase.from("planejamentos").delete().eq("id", id)

      if (error) {
        console.error("Erro ao deletar:", error)
        toast({
          title: "❌ Erro ao deletar",
          description: error.message,
          variant: "destructive",
        })
        return false
      }

      console.log("✅ Deletado com sucesso")
      toast({
        title: "✅ Sucesso",
        description: "Planejamento excluído com sucesso",
      })

      // Recarregar lista
      await fetchPlanejamentos()
      return true
    } catch (err) {
      console.error("Erro inesperado:", err)
      toast({
        title: "❌ Erro inesperado",
        description: "Erro inesperado ao deletar",
        variant: "destructive",
      })
      return false
    }
  }

  // Carregar dados na inicialização
  useEffect(() => {
    fetchPlanejamentos()
  }, [])

  return {
    planejamentos,
    loading,
    error,
    tableExists,
    statusOptions,
    validInactiveStatus,
    fetchPlanejamentos,
    createPlanejamento,
    updatePlanejamento,
    deletePlanejamento,
    checkPlanejamentoConflito,
    inativarPlanejamentosConflitantes,
  }
}
