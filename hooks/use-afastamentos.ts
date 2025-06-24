"use client"

import { useState, useEffect } from "react"
import { supabase, type Afastamento } from "@/lib/supabase"
import { toast } from "sonner"

export function useAfastamentos() {
  const [afastamentos, setAfastamentos] = useState<Afastamento[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAfastamentos = async () => {
    try {
      setLoading(true)
      console.log("🔍 Buscando afastamentos...")

      // Buscar dados básicos
      const { data: basicData, error: basicError } = await supabase
        .from("afastamentos")
        .select("*")
        .eq("ativo", true)
        .order("created_at", { ascending: false })

      if (basicError) {
        console.error("❌ Erro na consulta básica:", basicError)
        throw basicError
      }

      console.log("✅ Dados básicos encontrados:", basicData?.length || 0)

      if (!basicData || basicData.length === 0) {
        setAfastamentos([])
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
      const afastamentosCompletos = basicData.map((afastamento) => ({
        ...afastamento,
        empresas: empresas?.find((e) => e.id === afastamento.empresa_id),
        centro_custos: centrosCusto?.find((cc) => cc.id === afastamento.centro_custo_id),
        funcionarios: funcionarios?.find((f) => f.id === afastamento.funcionario_id),
      }))

      console.log("✅ Afastamentos completos:", afastamentosCompletos.length)
      setAfastamentos(afastamentosCompletos)
    } catch (error) {
      console.error("❌ Erro ao buscar afastamentos:", error)
      toast.error("Erro ao carregar afastamentos")
      setAfastamentos([])
    } finally {
      setLoading(false)
    }
  }

  const createAfastamento = async (afastamento: Omit<Afastamento, "id" | "created_at" | "updated_at">) => {
    try {
      console.log("➕ Criando novo afastamento:", afastamento)

      const { data, error } = await supabase.from("afastamentos").insert([afastamento]).select().single()

      if (error) {
        console.error("❌ Erro ao inserir:", error)
        throw error
      }

      console.log("✅ Afastamento criado:", data)

      // Recarregar dados
      await fetchAfastamentos()

      toast.success("Afastamento criado com sucesso!")
      return data
    } catch (error) {
      console.error("❌ Erro ao criar afastamento:", error)
      toast.error("Erro ao criar afastamento")
      throw error
    }
  }

  const updateAfastamento = async (id: number, updates: Partial<Afastamento>) => {
    try {
      console.log("✏️ Atualizando afastamento:", id, updates)

      const { data, error } = await supabase.from("afastamentos").update(updates).eq("id", id).select().single()

      if (error) {
        console.error("❌ Erro ao atualizar:", error)
        throw error
      }

      console.log("✅ Afastamento atualizado:", data)

      // Recarregar dados
      await fetchAfastamentos()

      toast.success("Afastamento atualizado com sucesso!")
      return data
    } catch (error) {
      console.error("❌ Erro ao atualizar afastamento:", error)
      toast.error("Erro ao atualizar afastamento")
      throw error
    }
  }

  const deleteAfastamento = async (id: number) => {
    try {
      console.log("🗑️ Removendo afastamento:", id)

      const { error } = await supabase.from("afastamentos").update({ ativo: false }).eq("id", id)

      if (error) {
        console.error("❌ Erro ao remover:", error)
        throw error
      }

      console.log("✅ Afastamento removido")

      // Recarregar dados
      await fetchAfastamentos()

      toast.success("Afastamento removido com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao remover afastamento:", error)
      toast.error("Erro ao remover afastamento")
      throw error
    }
  }

  useEffect(() => {
    fetchAfastamentos()
  }, [])

  return {
    afastamentos,
    loading,
    createAfastamento,
    updateAfastamento,
    deleteAfastamento,
    refetch: fetchAfastamentos,
  }
}
