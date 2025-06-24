"use client"

import { useState, useEffect } from "react"
import { supabase, type Evento } from "@/lib/supabase"
import { toast } from "sonner"

export function useEventos() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEventos = async () => {
    try {
      setLoading(true)
      console.log("🔍 Buscando eventos...")

      // Buscar dados básicos
      const { data: basicData, error: basicError } = await supabase
        .from("eventos")
        .select("*")
        .eq("ativo", true)
        .order("created_at", { ascending: false })

      if (basicError) {
        console.error("❌ Erro na consulta básica:", basicError)
        throw basicError
      }

      console.log("✅ Dados básicos encontrados:", basicData?.length || 0)

      if (!basicData || basicData.length === 0) {
        setEventos([])
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
      const eventosCompletos = basicData.map((evento) => ({
        ...evento,
        empresas: empresas?.find((e) => e.id === evento.empresa_id),
        centro_custos: centrosCusto?.find((cc) => cc.id === evento.centro_custo_id),
        funcionarios: funcionarios?.find((f) => f.id === evento.id_funcionario),
      }))

      console.log("✅ Eventos completos:", eventosCompletos.length)
      setEventos(eventosCompletos)
    } catch (error) {
      console.error("❌ Erro ao buscar eventos:", error)
      toast.error("Erro ao carregar eventos")
      setEventos([])
    } finally {
      setLoading(false)
    }
  }

  const createEvento = async (evento: Omit<Evento, "id" | "created_at" | "updated_at">) => {
    try {
      console.log("➕ Criando novo evento:", evento)

      // Incluir ativo: true explicitamente
      const dadosParaInserir = {
        ...evento,
        ativo: true,
      }

      const { data, error } = await supabase.from("eventos").insert([dadosParaInserir]).select().single()

      if (error) {
        console.error("❌ Erro ao inserir:", error)
        throw error
      }

      console.log("✅ Evento criado:", data)
      await fetchEventos()
      toast.success("Evento registrado com sucesso!")
      return data
    } catch (error) {
      console.error("❌ Erro ao criar evento:", error)
      toast.error("Erro ao registrar evento")
      throw error
    }
  }

  const createEventosMultiplos = async (eventos: Omit<Evento, "id" | "created_at" | "updated_at">[]) => {
    try {
      console.log("➕ Criando múltiplos eventos:", eventos.length)

      // Incluir ativo: true em todos os eventos
      const eventosComAtivo = eventos.map((evento) => ({
        ...evento,
        ativo: true,
      }))

      const { data, error } = await supabase.from("eventos").insert(eventosComAtivo).select()

      if (error) {
        console.error("❌ Erro ao inserir eventos:", error)
        throw error
      }

      console.log("✅ Eventos criados:", data?.length)
      await fetchEventos()
      toast.success(`${data?.length || 0} evento(s) registrado(s) com sucesso!`)
      return data
    } catch (error) {
      console.error("❌ Erro ao criar eventos:", error)
      toast.error("Erro ao registrar eventos")
      throw error
    }
  }

  const updateEvento = async (id: number, updates: Partial<Evento>) => {
    try {
      console.log("✏️ Atualizando evento:", id, updates)

      const { data, error } = await supabase.from("eventos").update(updates).eq("id", id).select().single()

      if (error) {
        console.error("❌ Erro ao atualizar:", error)
        throw error
      }

      console.log("✅ Evento atualizado:", data)
      await fetchEventos()
      toast.success("Evento atualizado com sucesso!")
      return data
    } catch (error) {
      console.error("❌ Erro ao atualizar evento:", error)
      toast.error("Erro ao atualizar evento")
      throw error
    }
  }

  const deleteEvento = async (id: number) => {
    try {
      console.log("🗑️ Removendo evento:", id)

      const { error } = await supabase.from("eventos").update({ ativo: false }).eq("id", id)

      if (error) {
        console.error("❌ Erro ao remover:", error)
        throw error
      }

      console.log("✅ Evento removido")
      await fetchEventos()
      toast.success("Evento removido com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao remover evento:", error)
      toast.error("Erro ao remover evento")
      throw error
    }
  }

  useEffect(() => {
    fetchEventos()
  }, [])

  return {
    eventos,
    loading,
    createEvento,
    createEventosMultiplos,
    updateEvento,
    deleteEvento,
    refetch: fetchEventos,
  }
}
