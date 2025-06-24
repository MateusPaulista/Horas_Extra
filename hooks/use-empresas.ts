"use client"

import { useState, useEffect } from "react"
import { supabase, type Empresa } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export function useEmpresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchEmpresas = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("empresas").select("*").order("Estabelecimento")
      
      console.log("🏢 useEmpresas - Dados carregados:", data?.length || 0, data)
      if (error) {
        console.error("❌ useEmpresas - Erro:", error)
        throw error
      }
      setEmpresas(data || [])
    } catch (error) {
      console.error("Erro ao buscar empresas:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar empresas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fixSequenceAndRetry = async (empresa: Omit<Empresa, "id" | "created_at" | "updated_at">) => {
    try {
      console.log("Tentando corrigir sequência da tabela empresas...")

      // Corrigir a sequência usando a função SETVAL
      const { error: sequenceError } = await supabase.rpc("fix_empresas_sequence")

      if (sequenceError) {
        console.error("Erro ao corrigir sequência:", sequenceError)
        // Se a função RPC não existir, tentar com SQL direto
        const { error: sqlError } = await supabase
          .from("empresas")
          .select("id")
          .order("id", { ascending: false })
          .limit(1)
          .then(async ({ data }) => {
            if (data && data.length > 0) {
              const maxId = data[0].id
              console.log("Maior ID encontrado:", maxId)

              // Tentar resetar a sequência manualmente
              const { error } = await supabase.rpc("reset_sequence", {
                table_name: "empresas",
                sequence_name: "empresas_id_seq",
                next_value: maxId + 1,
              })

              return { error }
            }
            return { error: null }
          })
      }

      // Tentar inserir novamente após corrigir a sequência
      const { data, error } = await supabase.from("empresas").insert([empresa]).select().single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error("Erro ao corrigir sequência e inserir:", error)
      throw error
    }
  }

  const createEmpresa = async (empresa: Omit<Empresa, "id" | "created_at" | "updated_at">) => {
    try {
      // Verificar se já existe uma empresa com o mesmo estabelecimento
      const { data: existingEmpresa, error: checkError } = await supabase
        .from("empresas")
        .select("id, Estabelecimento")
        .eq("Estabelecimento", empresa.Estabelecimento)
        .maybeSingle()

      if (existingEmpresa) {
        toast({
          title: "Erro",
          description: `Já existe uma empresa com o estabelecimento "${empresa.Estabelecimento}"`,
          variant: "destructive",
        })
        throw new Error("Estabelecimento já existe")
      }

      // Primeira tentativa de inserção
      const { data, error } = await supabase.from("empresas").insert([empresa]).select().single()

      if (error) {
        console.error("Erro na primeira tentativa:", error)

        // Se for erro de chave primária duplicada, tentar corrigir a sequência
        if (error.code === "23505" && error.message.includes("empresas_pkey")) {
          console.log("Detectado problema de sequência, tentando corrigir...")

          try {
            const correctedData = await fixSequenceAndRetry(empresa)
            setEmpresas((prev) => [...prev, correctedData])
            toast({
              title: "Sucesso",
              description: "Empresa criada com sucesso (sequência corrigida)",
            })
            return correctedData
          } catch (retryError) {
            console.error("Erro na segunda tentativa:", retryError)
            throw new Error("Erro persistente ao criar empresa. Contate o administrador.")
          }
        }

        // Outros tipos de erro
        if (error.code === "23505") {
          if (error.message.includes("Estabelecimento")) {
            throw new Error("Já existe uma empresa com este estabelecimento.")
          } else {
            throw new Error("Dados duplicados detectados.")
          }
        }

        throw error
      }

      setEmpresas((prev) => [...prev, data])
      toast({
        title: "Sucesso",
        description: "Empresa criada com sucesso",
      })
      return data
    } catch (error) {
      console.error("Erro ao criar empresa:", error)

      let errorMessage = "Erro ao criar empresa"
      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    }
  }

  const updateEmpresa = async (id: number, updates: Partial<Empresa>) => {
    try {
      // Se estamos atualizando o estabelecimento, verificar duplicatas
      if (updates.Estabelecimento) {
        const { data: existingEmpresa, error: checkError } = await supabase
          .from("empresas")
          .select("id, Estabelecimento")
          .eq("Estabelecimento", updates.Estabelecimento)
          .neq("id", id)
          .maybeSingle()

        if (existingEmpresa) {
          toast({
            title: "Erro",
            description: `Já existe uma empresa com o estabelecimento "${updates.Estabelecimento}"`,
            variant: "destructive",
          })
          throw new Error("Estabelecimento já existe")
        }
      }

      const { data, error } = await supabase.from("empresas").update(updates).eq("id", id).select().single()

      if (error) {
        console.error("Erro detalhado ao atualizar empresa:", error)
        throw error
      }

      setEmpresas((prev) => prev.map((emp) => (emp.id === id ? data : emp)))
      toast({
        title: "Sucesso",
        description: "Empresa atualizada com sucesso",
      })
      return data
    } catch (error) {
      console.error("Erro ao atualizar empresa:", error)

      let errorMessage = "Erro ao atualizar empresa"
      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteEmpresa = async (id: number) => {
    try {
      const { error } = await supabase.from("empresas").delete().eq("id", id)

      if (error) throw error

      setEmpresas((prev) => prev.filter((emp) => emp.id !== id))
      toast({
        title: "Sucesso",
        description: "Empresa excluída com sucesso",
      })
    } catch (error) {
      console.error("Erro ao excluir empresa:", error)
      toast({
        title: "Erro",
        description: "Erro ao excluir empresa",
        variant: "destructive",
      })
      throw error
    }
  }

  useEffect(() => {
    fetchEmpresas()
  }, [])

  return {
    empresas,
    loading,
    createEmpresa,
    updateEmpresa,
    deleteEmpresa,
    refetch: fetchEmpresas,
  }
}
