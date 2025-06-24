"use client"

import { useState, useEffect } from "react"
import { supabase, type HoraJustificada } from "@/lib/supabase"
import { toast } from "sonner"

export function useHorasJustificadasNew() {
  const [horasJustificadas, setHorasJustificadas] = useState<HoraJustificada[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHorasJustificadas = async () => {
    try {
      setLoading(true)
      console.log("🔍 Buscando horas justificadas...")

      // Buscar dados básicos
      const { data: basicData, error: basicError } = await supabase
        .from("horas_justificadas")
        .select("*")
        .eq("ativo", true)
        .order("created_at", { ascending: false })

      if (basicError) {
        console.error("❌ Erro na consulta básica:", basicError)
        throw basicError
      }

      console.log("✅ Dados básicos encontrados:", basicData?.length || 0)

      if (!basicData || basicData.length === 0) {
        setHorasJustificadas([])
        return
      }

      // Buscar dados relacionados manualmente
      const empresaIds = [...new Set(basicData.map((item) => item.empresa_id))]
      const centroCustoIds = [...new Set(basicData.map((item) => item.centro_custo_id))]
      const funcionarioIds = [...new Set(basicData.map((item) => item.id_funcionario))]

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
      const horasCompletas = basicData.map((hora) => ({
        ...hora,
        empresas: empresas?.find((e) => e.id === hora.empresa_id),
        centro_custos: centrosCusto?.find((cc) => cc.id === hora.centro_custo_id),
        funcionarios: funcionarios?.find((f) => f.id === hora.id_funcionario),
      }))

      console.log("✅ Horas justificadas completas:", horasCompletas.length)
      setHorasJustificadas(horasCompletas)
    } catch (error) {
      console.error("❌ Erro ao buscar horas justificadas:", error)
      toast.error("Erro ao carregar horas justificadas")
      setHorasJustificadas([])
    } finally {
      setLoading(false)
    }
  }

  const createHoraJustificada = async (hora: Omit<HoraJustificada, "id" | "created_at" | "updated_at">) => {
    try {
      console.log("➕ Criando nova hora justificada:", hora)

      // Incluir ativo: true explicitamente
      const dadosParaInserir = {
        ...hora,
        ativo: true,
      }

      const { data, error } = await supabase.from("horas_justificadas").insert([dadosParaInserir]).select().single()

      if (error) {
        console.error("❌ Erro ao inserir:", error)
        throw error
      }

      console.log("✅ Hora justificada criada:", data)
      await fetchHorasJustificadas()
      toast.success("Justificativa registrada com sucesso!")
      return data
    } catch (error) {
      console.error("❌ Erro ao criar hora justificada:", error)
      toast.error("Erro ao registrar justificativa")
      throw error
    }
  }

  const updateHoraJustificada = async (id: number, updates: Partial<HoraJustificada>) => {
    try {
      console.log("✏️ Atualizando hora justificada:", id, updates)

      const { data, error } = await supabase.from("horas_justificadas").update(updates).eq("id", id).select().single()

      if (error) {
        console.error("❌ Erro ao atualizar:", error)
        throw error
      }

      console.log("✅ Hora justificada atualizada:", data)
      await fetchHorasJustificadas()
      toast.success("Justificativa atualizada com sucesso!")
      return data
    } catch (error) {
      console.error("❌ Erro ao atualizar hora justificada:", error)
      toast.error("Erro ao atualizar justificativa")
      throw error
    }
  }

  const deleteHoraJustificada = async (id: number) => {
    try {
      console.log("🗑️ Removendo hora justificada:", id)

      const { error } = await supabase.from("horas_justificadas").update({ ativo: false }).eq("id", id)

      if (error) {
        console.error("❌ Erro ao remover:", error)
        throw error
      }

      console.log("✅ Hora justificada removida")
      await fetchHorasJustificadas()
      toast.success("Justificativa removida com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao remover hora justificada:", error)
      toast.error("Erro ao remover justificativa")
      throw error
    }
  }

  useEffect(() => {
    fetchHorasJustificadas()
  }, [])

  return {
    horasJustificadas,
    loading,
    createHoraJustificada,
    updateHoraJustificada,
    deleteHoraJustificada,
    refetch: fetchHorasJustificadas,
  }
}
