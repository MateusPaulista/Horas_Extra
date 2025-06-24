"use client"

import { useState, useEffect } from "react"
import { supabase, type Parametro } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export function useParametros() {
  const [parametros, setParametros] = useState<Parametro[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchParametros = async () => {
    try {
      setLoading(true)
      console.log("Carregando parâmetros...")

      const { data, error } = await supabase.from("parametros").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Erro na query de parâmetros:", error)
        throw error
      }

      console.log("Parâmetros carregados:", data?.length || 0, data)
      setParametros(data || [])
    } catch (error) {
      console.error("Erro ao buscar parâmetros:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar parâmetros",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createParametro = async (parametro: Omit<Parametro, "id" | "created_at" | "updated_at">) => {
    try {
      console.log("Criando parâmetro:", parametro)

      // Desativar todos os parâmetros anteriores se o novo for ativo
      if (parametro.ativo) {
        await supabase.from("parametros").update({ ativo: false }).eq("user_id", parametro.user_id)
      }

      const { data, error } = await supabase.from("parametros").insert([parametro]).select().single()

      if (error) {
        console.error("Erro ao criar parâmetro:", error)
        throw error
      }

      console.log("Parâmetro criado:", data)
      setParametros((prev) => [data, ...prev])
      toast({
        title: "Sucesso",
        description: "Parâmetro criado com sucesso",
      })
      return data
    } catch (error) {
      console.error("Erro ao criar parâmetro:", error)
      toast({
        title: "Erro",
        description: "Erro ao criar parâmetro",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateParametro = async (id: number, updates: Partial<Parametro>) => {
    try {
      console.log("Atualizando parâmetro:", id, updates)

      // Se estiver ativando este parâmetro, desativar todos os outros do mesmo usuário
      if (updates.ativo && updates.user_id) {
        await supabase.from("parametros").update({ ativo: false }).eq("user_id", updates.user_id).neq("id", id)
      }

      const { data, error } = await supabase.from("parametros").update(updates).eq("id", id).select().single()

      if (error) {
        console.error("Erro ao atualizar parâmetro:", error)
        throw error
      }

      console.log("Parâmetro atualizado:", data)
      setParametros((prev) => prev.map((p) => (p.id === id ? data : p)))
      toast({
        title: "Sucesso",
        description: "Parâmetro atualizado com sucesso",
      })
      return data
    } catch (error) {
      console.error("Erro ao atualizar parâmetro:", error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar parâmetro",
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteParametro = async (id: number) => {
    try {
      console.log("Excluindo parâmetro:", id)

      const { error } = await supabase.from("parametros").delete().eq("id", id)

      if (error) {
        console.error("Erro ao excluir parâmetro:", error)
        throw error
      }

      console.log("Parâmetro excluído com sucesso")
      setParametros((prev) => prev.filter((p) => p.id !== id))
      toast({
        title: "Sucesso",
        description: "Parâmetro excluído com sucesso",
      })
    } catch (error) {
      console.error("Erro ao excluir parâmetro:", error)
      toast({
        title: "Erro",
        description: "Erro ao excluir parâmetro",
        variant: "destructive",
      })
      throw error
    }
  }

  const getParametroAtivo = (userId: string) => {
    return parametros.find((p) => p.user_id === userId && p.ativo)
  }

  const getParametrosUsuario = (userId: string) => {
    return parametros.filter((p) => p.user_id === userId)
  }

  useEffect(() => {
    fetchParametros()
  }, [])

  return {
    parametros,
    loading,
    createParametro,
    updateParametro,
    deleteParametro,
    getParametroAtivo,
    getParametrosUsuario,
    refetch: fetchParametros,
  }
}
