"use client"

import { useState, useEffect } from "react"
import { supabase, type Afastado } from "@/lib/supabase"
import { toast } from "sonner"

export function useAfastados() {
  const [afastados, setAfastados] = useState<Afastado[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAfastados = async () => {
    try {
      setLoading(true)
      console.log("🔍 Buscando afastados...")

      // Buscar dados básicos (sem filtro ativo se a coluna não existir)
      const { data: basicData, error: basicError } = await supabase
        .from("afastados")
        .select("*")
        .order("created_at", { ascending: false })

      if (basicError) {
        console.error("❌ Erro na consulta básica:", basicError)
        throw basicError
      }

      console.log("✅ Dados básicos encontrados:", basicData?.length || 0)

      if (!basicData || basicData.length === 0) {
        setAfastados([])
        return
      }

      // Filtrar apenas registros ativos (se a coluna existir)
      const dadosAtivos = basicData.filter((item) => item.ativo !== false)

      // Buscar dados relacionados manualmente
      const empresaIds = [...new Set(dadosAtivos.map((item) => item.id_empresa))]
      const funcionarioIds = [...new Set(dadosAtivos.map((item) => item.id_funcionario))]

      // Buscar empresas
      const { data: empresas } = await supabase
        .from("empresas")
        .select("id, Estabelecimento, Descricao")
        .in("id", empresaIds)

      // Buscar funcionários com centro de custo
      const { data: funcionarios } = await supabase
        .from("funcionarios")
        .select("id, matricula, nome, centro_custo_id")
        .in("id", funcionarioIds)

      // Buscar centros de custo únicos dos funcionários
      const centroCustoIds = [...new Set(funcionarios?.map((f) => f.centro_custo_id).filter(Boolean) || [])]
      const { data: centrosCusto } = await supabase
        .from("centro_custos")
        .select("id, codigo, nome")
        .in("id", centroCustoIds)

      // Combinar dados
      const afastadosCompletos = dadosAtivos.map((afastado) => {
        const funcionario = funcionarios?.find((f) => f.id === afastado.id_funcionario)
        const centroCustoId = afastado.centro_custo_id || funcionario?.centro_custo_id
        const centroCusto = centrosCusto?.find((cc) => cc.id === centroCustoId)
        return {
          ...afastado,
          // Adicionar centro_custo_id do funcionário se não existir no afastado
          centro_custo_id: centroCustoId,
          empresas: empresas?.find((e) => e.id === afastado.id_empresa),
          funcionarios: funcionario,
          centro_custos: centroCusto,
        }
      })

      console.log("✅ Afastados completos:", afastadosCompletos.length)
      setAfastados(afastadosCompletos)
    } catch (error) {
      console.error("❌ Erro ao buscar afastados:", error)
      toast.error("Erro ao carregar afastamentos")
      setAfastados([])
    } finally {
      setLoading(false)
    }
  }

  const createAfastado = async (afastado: Omit<Afastado, "id" | "created_at" | "updated_at">) => {
    try {
      console.log("➕ Criando novo afastamento:", afastado)
      console.log("📋 Dados recebidos:", JSON.stringify(afastado, null, 2))

      // Validar dados obrigatórios
      if (!afastado.id_empresa || !afastado.id_funcionario) {
        const errorMsg = "Dados obrigatórios faltando: empresa ou funcionário"
        console.error("❌ Validação falhou:", errorMsg)
        toast.error(errorMsg)
        throw new Error(errorMsg)
      }

      if (!afastado.data_inicio || !afastado.data_fim || !afastado.motivo) {
        const errorMsg = "Dados obrigatórios faltando: datas ou motivo"
        console.error("❌ Validação falhou:", errorMsg)
        toast.error(errorMsg)
        throw new Error(errorMsg)
      }

      // Remover centro_custo_id e ativo dos dados para inserção (não existem na tabela)
      const { centro_custo_id, ativo, ...dadosParaInserir } = {
        ...afastado,
      }

      console.log("📤 Dados para inserir:", JSON.stringify(dadosParaInserir, null, 2))

      const { data, error } = await supabase.from("afastados").insert([dadosParaInserir]).select().single()

      if (error) {
        console.error("❌ Erro do Supabase (raw):", JSON.stringify(error, null, 2))
        console.error("❌ Erro do Supabase (object):", error)
        console.error("❌ Tipo do erro:", typeof error)
        console.error("❌ Keys do erro:", Object.keys(error))
        console.error("❌ Message:", error.message)
        console.error("❌ Details:", error.details)
        console.error("❌ Code:", error.code)
        toast.error(`Erro ao inserir: ${error.message || 'Erro desconhecido'}`)
        throw error
      }

      console.log("✅ Afastamento criado:", data)
      await fetchAfastados()
      toast.success("Afastamento registrado com sucesso!")
      return data
    } catch (error: any) {
      console.error("❌ Erro ao criar afastamento (raw):", JSON.stringify(error, null, 2))
      console.error("❌ Erro ao criar afastamento (object):", error)
      console.error("❌ Tipo do erro:", typeof error)
      console.error("❌ Keys do erro:", Object.keys(error || {}))
      console.error("❌ Stack trace:", error?.stack)
      console.error("❌ Mensagem:", error?.message)
      console.error("❌ Name:", error?.name)
      toast.error(`Erro ao registrar afastamento: ${error?.message || 'Erro desconhecido'}`)
      throw error
    }
  }

  const updateAfastado = async (id: number, updates: Partial<Afastado>) => {
    try {
      console.log("✏️ Atualizando afastamento:", id, updates)

      const { data, error } = await supabase.from("afastados").update(updates).eq("id", id).select().single()

      if (error) {
        console.error("❌ Erro ao atualizar:", error)
        throw error
      }

      console.log("✅ Afastamento atualizado:", data)
      await fetchAfastados()
      toast.success("Afastamento atualizado com sucesso!")
      return data
    } catch (error) {
      console.error("❌ Erro ao atualizar afastamento:", error)
      toast.error("Erro ao atualizar afastamento")
      throw error
    }
  }

  const deleteAfastado = async (id: number) => {
    try {
      console.log("🗑️ Removendo afastamento:", id)

      const { error } = await supabase.from("afastados").update({ ativo: false }).eq("id", id)

      if (error) {
        console.error("❌ Erro ao remover:", error)
        throw error
      }

      console.log("✅ Afastamento removido")
      await fetchAfastados()
      toast.success("Afastamento removido com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao remover afastamento:", error)
      toast.error("Erro ao remover afastamento")
      throw error
    }
  }

  useEffect(() => {
    fetchAfastados()
  }, [])

  return {
    afastados,
    loading,
    createAfastado,
    updateAfastado,
    deleteAfastado,
    refetch: fetchAfastados,
  }
}
