"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface HoraExtraPagar {
  id: number
  tipo: string
  data_evento: string
  empresa_id: number
  centro_custo_id?: number | null
  funcionario_id?: number | null
  horas_pagar: number
  observacoes?: string
  ativo: boolean
  created_at: string
  updated_at: string
  empresas?: {
    id: number
    Estabelecimento: string
    Descricao: string
  }
  centro_custos?: {
    id: number
    nome: string
    codigo: string
  }
  funcionarios?: {
    id: number
    matricula: string
    nome: string
  }
}

export function useHorasExtrasPagar() {
  const [horasExtras, setHorasExtras] = useState<HoraExtraPagar[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHorasExtras = async () => {
    try {
      setLoading(true)
      console.log("🔍 Buscando horas extras a pagar...")

      // Buscar dados básicos
      const { data: basicData, error: basicError } = await supabase
        .from("horas_extras_pagar")
        .select("*")
        .eq("ativo", true)
        .order("data_evento", { ascending: false })

      if (basicError) {
        console.error("❌ Erro na consulta básica:", basicError)
        throw basicError
      }

      console.log("✅ Dados básicos encontrados:", basicData?.length || 0)

      if (!basicData || basicData.length === 0) {
        setHorasExtras([])
        return
      }

      // Buscar dados relacionados manualmente
      const empresaIds = [...new Set(basicData.map((item) => item.empresa_id))]
      const centroCustoIds = [
        ...new Set(basicData.filter((item) => item.centro_custo_id).map((item) => item.centro_custo_id!)),
      ]
      const funcionarioIds = [
        ...new Set(basicData.filter((item) => item.funcionario_id).map((item) => item.funcionario_id!)),
      ]

      // Buscar empresas
      const { data: empresas } = await supabase
        .from("empresas")
        .select("id, Estabelecimento, Descricao")
        .in("id", empresaIds)

      // Buscar centros de custo (se houver)
      let centrosCusto: any[] = []
      if (centroCustoIds.length > 0) {
        const { data } = await supabase.from("centro_custos").select("id, nome, codigo").in("id", centroCustoIds)
        centrosCusto = data || []
      }

      // Buscar funcionários (se houver)
      let funcionarios: any[] = []
      if (funcionarioIds.length > 0) {
        const { data } = await supabase.from("funcionarios").select("id, matricula, nome").in("id", funcionarioIds)
        funcionarios = data || []
      }

      // Combinar dados
      const horasCompletas = basicData.map((hora) => ({
        ...hora,
        empresas: empresas?.find((e) => e.id === hora.empresa_id),
        centro_custos: hora.centro_custo_id ? centrosCusto?.find((cc) => cc.id === hora.centro_custo_id) : undefined,
        funcionarios: hora.funcionario_id ? funcionarios?.find((f) => f.id === hora.funcionario_id) : undefined,
      }))

      console.log("✅ Horas extras completas:", horasCompletas.length)
      setHorasExtras(horasCompletas)
    } catch (error) {
      console.error("❌ Erro ao buscar horas extras:", error)
      toast.error("Erro ao carregar horas extras a pagar")
      setHorasExtras([])
    } finally {
      setLoading(false)
    }
  }

  const createHoraExtra = async (hora: Omit<HoraExtraPagar, "id" | "created_at" | "updated_at">) => {
    try {
      console.log("➕ Criando nova hora extra:", hora)

      const { data, error } = await supabase.from("horas_extras_pagar").insert([hora]).select().single()

      if (error) {
        console.error("❌ Erro ao inserir:", error)
        throw error
      }

      console.log("✅ Hora extra criada:", data)

      // Recarregar dados
      await fetchHorasExtras()

      toast.success("Hora extra criada com sucesso!")
      return data
    } catch (error) {
      console.error("❌ Erro ao criar hora extra:", error)
      toast.error("Erro ao criar hora extra")
      throw error
    }
  }

  const updateHoraExtra = async (id: number, updates: Partial<HoraExtraPagar>) => {
    try {
      console.log("✏️ Atualizando hora extra:", id, updates)

      const { data, error } = await supabase.from("horas_extras_pagar").update(updates).eq("id", id).select().single()

      if (error) {
        console.error("❌ Erro ao atualizar:", error)
        throw error
      }

      console.log("✅ Hora extra atualizada:", data)

      // Recarregar dados
      await fetchHorasExtras()

      toast.success("Hora extra atualizada com sucesso!")
      return data
    } catch (error) {
      console.error("❌ Erro ao atualizar hora extra:", error)
      toast.error("Erro ao atualizar hora extra")
      throw error
    }
  }

  const deleteHoraExtra = async (id: number) => {
    try {
      console.log("🗑️ Removendo hora extra:", id)

      const { error } = await supabase.from("horas_extras_pagar").update({ ativo: false }).eq("id", id)

      if (error) {
        console.error("❌ Erro ao remover:", error)
        throw error
      }

      console.log("✅ Hora extra removida")

      // Recarregar dados
      await fetchHorasExtras()

      toast.success("Hora extra removida com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao remover hora extra:", error)
      toast.error("Erro ao remover hora extra")
      throw error
    }
  }

  useEffect(() => {
    fetchHorasExtras()
  }, [])

  return {
    horasExtras,
    loading,
    createHoraExtra,
    updateHoraExtra,
    deleteHoraExtra,
    refetch: fetchHorasExtras,
  }
}
