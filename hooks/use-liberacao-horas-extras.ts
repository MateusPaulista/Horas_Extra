"use client"

import { useState, useEffect } from "react"
import { supabase, type LiberacaoHorasExtras } from "@/lib/supabase"
import { toast } from "sonner"

export function useLiberacaoHorasExtras() {
  const [liberacoes, setLiberacoes] = useState<LiberacaoHorasExtras[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLiberacoes = async () => {
    try {
      setLoading(true)
      console.log("🔍 Buscando liberações de horas extras...")

      // Primeiro, tentar buscar apenas os dados básicos
      const { data: basicData, error: basicError } = await supabase
        .from("liberacao_horas_extras")
        .select("*")
        .eq("ativo", true)
        .order("created_at", { ascending: false })

      if (basicError) {
        console.error("❌ Erro na consulta básica:", basicError)
        throw basicError
      }

      console.log("✅ Dados básicos encontrados:", basicData?.length || 0)

      if (!basicData || basicData.length === 0) {
        setLiberacoes([])
        return
      }

      // Buscar dados relacionados manualmente
      const empresaIds = [...new Set(basicData.map((item) => item.empresa_id))]
      const centroCustoIds = [...new Set(basicData.map((item) => item.centro_custo_id))]
      const funcionarioIds = [...new Set(basicData.map((item) => item.funcionario_id))]

      // Buscar empresas
      const { data: empresas } = await supabase
        .from("empresas")
        .select("id, Estabelecimento, Descricao")
        .in("id", empresaIds)

      // Buscar centros de custo
      const { data: centrosCusto } = await supabase
        .from("centro_custos")
        .select("id, nome, codigo")
        .in("id", centroCustoIds)

      // Buscar funcionários
      const { data: funcionarios } = await supabase
        .from("funcionarios")
        .select("id, matricula, nome")
        .in("id", funcionarioIds)

      // Combinar dados
      const liberacoesCompletas = basicData.map((liberacao) => ({
        ...liberacao,
        empresas: empresas?.find((e) => e.id === liberacao.empresa_id),
        centro_custos: centrosCusto?.find((cc) => cc.id === liberacao.centro_custo_id),
        funcionarios: funcionarios?.find((f) => f.id === liberacao.funcionario_id),
      }))

      console.log("✅ Liberações completas:", liberacoesCompletas.length)
      setLiberacoes(liberacoesCompletas)
    } catch (error) {
      console.error("❌ Erro ao buscar liberações:", JSON.stringify({
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        error: error instanceof Error ? error.stack : String(error)
      }, null, 2))
      toast.error("Erro ao carregar liberações de horas extras")
      setLiberacoes([])
    } finally {
      setLoading(false)
    }
  }

  const createLiberacao = async (liberacao: Omit<LiberacaoHorasExtras, "id" | "created_at" | "updated_at">) => {
    try {
      console.log("➕ Criando nova liberação:", liberacao)

      const { data, error } = await supabase.from("liberacao_horas_extras").insert([liberacao]).select().single()

      if (error) {
        console.error("❌ Erro ao inserir:", error)
        throw error
      }

      console.log("✅ Liberação criada:", data)

      // Recarregar dados
      await fetchLiberacoes()

      toast.success("Liberação de horas extras criada com sucesso!")
      return data
    } catch (error) {
      console.error("❌ Erro ao criar liberação:", error)
      toast.error("Erro ao criar liberação de horas extras")
      throw error
    }
  }

  const updateLiberacao = async (id: number, updates: Partial<LiberacaoHorasExtras>) => {
    try {
      console.log("✏️ Atualizando liberação:", id, updates)

      const { data, error } = await supabase
        .from("liberacao_horas_extras")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("❌ Erro ao atualizar:", error)
        throw error
      }

      console.log("✅ Liberação atualizada:", data)

      // Recarregar dados
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

      const { error } = await supabase.from("liberacao_horas_extras").update({ ativo: false }).eq("id", id)

      if (error) {
        console.error("❌ Erro ao remover:", error)
        throw error
      }

      console.log("✅ Liberação removida")

      // Recarregar dados
      await fetchLiberacoes()

      toast.success("Liberação removida com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao remover liberação:", error)
      toast.error("Erro ao remover liberação")
      throw error
    }
  }

  useEffect(() => {
    fetchLiberacoes()
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
