"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Turno } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export function useTurnos() {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchTurnos = async () => {
    try {
      setLoading(true)
      console.log("Buscando turnos...")

      const { data, error } = await supabase
        .from("turnos")
        .select(`
          *,
          empresas:empresa_id (
            id,
            Estabelecimento,
            Descricao
          )
        `)
        .order("nome")

      if (error) {
        console.error("Erro ao buscar turnos:", error)
        throw error
      }

      console.log("Turnos carregados:", data)
      setTurnos(data || [])
    } catch (error) {
      console.error("Erro ao carregar turnos:", error)
      setTurnos([])
    } finally {
      setLoading(false)
    }
  }

  // Função para encontrar próximo ID disponível de forma robusta
  const findNextAvailableId = async (): Promise<number> => {
    try {
      console.log("🔍 Buscando próximo ID disponível...")

      // Buscar todos os IDs existentes
      const { data: existingIds, error } = await supabase.from("turnos").select("id").order("id", { ascending: true })

      if (error) {
        console.error("Erro ao buscar IDs existentes:", error)
        return 1 // Fallback para ID 1
      }

      if (!existingIds || existingIds.length === 0) {
        console.log("📝 Tabela vazia, usando ID 1")
        return 1
      }

      const ids = existingIds.map((item) => item.id).sort((a, b) => a - b)
      console.log("📊 IDs existentes ordenados:", ids)

      // Procurar primeiro gap
      for (let i = 0; i < ids.length; i++) {
        const expectedId = i + 1
        if (ids[i] !== expectedId) {
          console.log(`🎯 Gap encontrado! Próximo ID disponível: ${expectedId}`)
          return expectedId
        }
      }

      // Se não há gaps, usar max + 1
      const maxId = Math.max(...ids)
      const nextId = maxId + 1
      console.log(`➡️ Sem gaps, próximo ID: ${nextId}`)
      return nextId
    } catch (error) {
      console.error("Erro ao calcular próximo ID:", error)
      return Date.now() % 1000000 // Fallback com timestamp
    }
  }

  // Função para tentar inserção com múltiplas estratégias
  const attemptInsertWithStrategies = async (baseData: any): Promise<any> => {
    console.log("🚀 Iniciando tentativas de inserção com múltiplas estratégias")

    // Converter tempo se necessário
    const convertTimeToMinutes = (timeString: string): number => {
      if (!timeString) return 0
      const [hours, minutes] = timeString.split(":").map(Number)
      return hours * 60 + minutes
    }

    // Estratégia 1: Inserção sem ID (deixar banco gerar)
    console.log("📝 Estratégia 1: Inserção automática")
    try {
      const { data, error } = await supabase
        .from("turnos")
        .insert([baseData])
        .select(`
          *,
          empresas:empresa_id (
            id,
            Estabelecimento,
            Descricao
          )
        `)

      if (!error) {
        console.log("✅ Estratégia 1 funcionou!")
        return data[0]
      }

      console.log("❌ Estratégia 1 falhou:", error.message)
    } catch (e) {
      console.log("❌ Estratégia 1 com exceção:", e)
    }

    // Estratégia 2: ID calculado manualmente
    console.log("📝 Estratégia 2: ID calculado")
    try {
      const nextId = await findNextAvailableId()
      const dataWithId = { id: nextId, ...baseData }

      const { data, error } = await supabase
        .from("turnos")
        .insert([dataWithId])
        .select(`
          *,
          empresas:empresa_id (
            id,
            Estabelecimento,
            Descricao
          )
        `)

      if (!error) {
        console.log("✅ Estratégia 2 funcionou com ID:", nextId)
        return data[0]
      }

      console.log("❌ Estratégia 2 falhou:", error.message)
    } catch (e) {
      console.log("❌ Estratégia 2 com exceção:", e)
    }

    // Estratégia 3: Tentativas múltiplas com IDs sequenciais
    console.log("📝 Estratégia 3: Tentativas múltiplas")
    try {
      const baseId = await findNextAvailableId()

      for (let attempt = 0; attempt < 20; attempt++) {
        const testId = baseId + attempt
        console.log(`🔄 Tentativa ${attempt + 1}/20 com ID: ${testId}`)

        const dataWithTestId = { id: testId, ...baseData }

        const { data, error } = await supabase
          .from("turnos")
          .insert([dataWithTestId])
          .select(`
            *,
            empresas:empresa_id (
              id,
              Estabelecimento,
              Descricao
            )
          `)

        if (!error) {
          console.log(`✅ Estratégia 3 funcionou na tentativa ${attempt + 1} com ID: ${testId}`)
          return data[0]
        }

        // Se não é erro de chave duplicada, parar
        if (!error.message.includes("duplicate key")) {
          console.log("❌ Erro diferente de chave duplicada:", error.message)
          break
        }
      }
    } catch (e) {
      console.log("❌ Estratégia 3 com exceção:", e)
    }

    // Estratégia 4: Conversão de tempo + ID aleatório
    console.log("📝 Estratégia 4: Conversão de tempo + ID aleatório")
    try {
      const dataWithMinutes = {
        id: Date.now() % 1000000, // ID baseado em timestamp
        ...baseData,
        tempo_refeicao: convertTimeToMinutes(baseData.tempo_refeicao),
      }

      const { data, error } = await supabase
        .from("turnos")
        .insert([dataWithMinutes])
        .select(`
          *,
          empresas:empresa_id (
            id,
            Estabelecimento,
            Descricao
          )
        `)

      if (!error) {
        console.log("✅ Estratégia 4 funcionou com ID:", dataWithMinutes.id)
        return data[0]
      }

      console.log("❌ Estratégia 4 falhou:", error.message)
    } catch (e) {
      console.log("❌ Estratégia 4 com exceção:", e)
    }

    // Se todas as estratégias falharam
    throw new Error(
      "Todas as estratégias de inserção falharam. Verifique a estrutura da tabela e execute os scripts de diagnóstico.",
    )
  }

  const createTurno = async (turnoData: any) => {
    try {
      console.log("=== CRIANDO TURNO COM SISTEMA ROBUSTO ===")
      console.log("Dados recebidos:", turnoData)

      // Preparar dados base (sem ID)
      const baseData = {
        nome: turnoData.nome,
        hora_inicio: turnoData.hora_inicio,
        hora_fim: turnoData.hora_fim,
        tempo_refeicao: turnoData.tempo_refeicao,
        empresa_id: turnoData.empresa_id,
      }

      console.log("Dados base preparados:", baseData)

      // Tentar inserção com múltiplas estratégias
      const result = await attemptInsertWithStrategies(baseData)

      console.log("✅ Turno criado com sucesso:", result)
      toast({
        title: "Sucesso",
        description: "Turno criado com sucesso",
      })

      await fetchTurnos() // Recarrega a lista
      return result
    } catch (error) {
      console.error("❌ ERRO FINAL ao criar turno:", error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar turno",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateTurno = async (id: number, turnoData: any) => {
    try {
      console.log("=== ATUALIZANDO TURNO ===")
      console.log("ID:", id, "Dados:", turnoData)

      // Converter tempo de refeição se necessário
      const convertTimeToMinutes = (timeString: string): number => {
        if (!timeString) return 0
        const [hours, minutes] = timeString.split(":").map(Number)
        return hours * 60 + minutes
      }

      // Preparar dados para atualização
      const dataToUpdate = {
        nome: turnoData.nome,
        hora_inicio: turnoData.hora_inicio,
        hora_fim: turnoData.hora_fim,
        tempo_refeicao: turnoData.tempo_refeicao,
        empresa_id: turnoData.empresa_id,
      }

      console.log("Dados preparados para atualização:", dataToUpdate)

      let { data, error } = await supabase
        .from("turnos")
        .update(dataToUpdate)
        .eq("id", id)
        .select(`
          *,
          empresas:empresa_id (
            id,
            Estabelecimento,
            Descricao
          )
        `)

      // Se der erro de tipo inteiro, tentar converter tempo_refeicao
      if (error && error.message.includes("invalid input syntax for type integer")) {
        console.log("Convertendo tempo_refeicao para minutos...")

        const dataWithMinutes = {
          ...dataToUpdate,
          tempo_refeicao: convertTimeToMinutes(turnoData.tempo_refeicao),
        }

        const result = await supabase
          .from("turnos")
          .update(dataWithMinutes)
          .eq("id", id)
          .select(`
            *,
            empresas:empresa_id (
              id,
              Estabelecimento,
              Descricao
            )
          `)

        data = result.data
        error = result.error
      }

      if (error) {
        console.error("Erro ao atualizar turno:", error)
        throw error
      }

      console.log("Turno atualizado com sucesso:", data)
      toast({
        title: "Sucesso",
        description: "Turno atualizado com sucesso",
      })

      await fetchTurnos()
      return data[0]
    } catch (error) {
      console.error("Erro ao atualizar turno:", error)
      toast({
        title: "Erro",
        description: `Erro ao atualizar turno: ${error.message}`,
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteTurno = async (id: number) => {
    try {
      console.log("Deletando turno:", id)

      const { error } = await supabase.from("turnos").delete().eq("id", id)

      if (error) {
        console.error("Erro ao deletar turno:", error)
        throw error
      }

      console.log("Turno deletado:", id)
      toast({
        title: "Sucesso",
        description: "Turno excluído com sucesso",
      })

      await fetchTurnos()
    } catch (error) {
      console.error("Erro ao deletar turno:", error)
      toast({
        title: "Erro",
        description: "Erro ao excluir turno",
        variant: "destructive",
      })
      throw error
    }
  }

  useEffect(() => {
    fetchTurnos()
  }, [])

  return {
    turnos,
    loading,
    createTurno,
    updateTurno,
    deleteTurno,
    refetch: fetchTurnos,
  }
}
