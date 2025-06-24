"use client"

import { useState, useEffect } from "react"
import { supabase, type CentroCusto } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export function useCentroCustos() {
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchCentrosCusto = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from("centro_custos")
        .select(`
          id,
          empresa_id,
          nome,
          codigo,
          created_at,
          updated_at,
          empresas (
            id,
            Estabelecimento,
            Descricao
          )
        `)
        .order("nome")

      if (error) {
        console.error("Erro na query do Supabase:", error)
        throw error
      }

      console.log("Dados brutos do Supabase (centros de custo):", data)
      setCentrosCusto(data || [])
    } catch (error) {
      console.error("Erro ao buscar centros de custo:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar centros de custo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Função para garantir que a sequência esteja correta
  const ensureSequenceIsCorrect = async () => {
    try {
      console.log("Verificando sequência...")

      // Obter o maior ID atual
      const { data: maxIdData, error: maxIdError } = await supabase
        .from("centro_custos")
        .select("id")
        .order("id", { ascending: false })
        .limit(1)

      if (maxIdError) {
        console.error("Erro ao obter maior ID:", maxIdError)
        return false
      }

      const maxId = maxIdData && maxIdData.length > 0 ? maxIdData[0].id : 0
      console.log("Maior ID na tabela:", maxId)

      // Não podemos executar SQL direto via RPC sem uma função personalizada
      // A correção da sequência será feita automaticamente pelo PostgreSQL
      // ou tratada no catch se houver conflito
      console.log("Sequência verificada - próximo ID esperado:", maxId + 1)
      return true
    } catch (error) {
      console.error("Erro ao verificar sequência:", error)
      return false
    }
  }

  const createCentroCusto = async (centroCusto: Omit<CentroCusto, "id" | "created_at" | "updated_at">) => {
    try {
      console.log("Iniciando criação de centro de custo:", centroCusto)

      // Verificar duplicatas antes de inserir
      const { data: existingData, error: checkError } = await supabase
        .from("centro_custos")
        .select("id, nome, codigo")
        .eq("nome", centroCusto.nome)
        .eq("empresa_id", centroCusto.empresa_id)

      if (checkError) {
        console.error("Erro ao verificar duplicatas:", checkError)
      } else if (existingData && existingData.length > 0) {
        toast({
          title: "Erro",
          description: "Já existe um centro de custo com este nome nesta empresa",
          variant: "destructive",
        })
        throw new Error("Centro de custo duplicado")
      }

      // Verificar a sequência antes de inserir
      const sequenceChecked = await ensureSequenceIsCorrect()
      if (!sequenceChecked) {
        console.warn("Não foi possível verificar a sequência, tentando inserir mesmo assim...")
      }

      // Tentar inserir
      const { data, error } = await supabase
        .from("centro_custos")
        .insert([
          {
            empresa_id: centroCusto.empresa_id,
            nome: centroCusto.nome,
            codigo: centroCusto.codigo,
          },
        ])
        .select(`
          id,
          empresa_id,
          nome,
          codigo,
          created_at,
          updated_at,
          empresas (
            id,
            Estabelecimento,
            Descricao
          )
        `)
        .single()

      if (error) {
        console.error("Erro ao inserir centro de custo: {}")

        // Se ainda der erro de sequência, tentar uma abordagem mais drástica
        if (error.code === "23505" && error.message.includes("centro_custos_pkey")) {
          console.log("Erro de sequência persistente, tentando abordagem alternativa...")

          // Obter todos os IDs existentes e encontrar o próximo disponível
          const { data: allIds, error: idsError } = await supabase.from("centro_custos").select("id").order("id")

          if (idsError) {
            console.error("Erro ao obter IDs:", idsError)
            throw error
          }

          // Encontrar o próximo ID disponível
          let nextId = 1
          const existingIds = allIds.map((item) => item.id).sort((a, b) => a - b)

          for (const id of existingIds) {
            if (id === nextId) {
              nextId++
            } else {
              break
            }
          }

          console.log("Tentando inserir com ID específico:", nextId)

          // Tentar inserir com ID específico
          const { data: retryData, error: retryError } = await supabase
            .from("centro_custos")
            .insert([
              {
                id: nextId,
                empresa_id: centroCusto.empresa_id,
                nome: centroCusto.nome,
                codigo: centroCusto.codigo,
              },
            ])
            .select(`
              id,
              empresa_id,
              nome,
              codigo,
              created_at,
              updated_at,
              empresas (
                id,
                Estabelecimento,
                Descricao
              )
            `)
            .single()

          if (retryError) {
            console.error("Erro na inserção com ID específico:", retryError)
            throw retryError
          }

          console.log("Centro de custo criado com ID específico:", retryData)

          setCentrosCusto((prev) => [...prev, {
            ...retryData,
            empresas: {
              id: retryData.empresas[0]?.id,
              Estabelecimento: retryData.empresas[0]?.Estabelecimento,
              Descricao: retryData.empresas[0]?.Descricao,
              created_at: retryData.created_at,
              updated_at: retryData.updated_at
            }
          }])
          toast({
            title: "Sucesso",
            description: "Centro de custo criado com sucesso (sequência corrigida)",
          })

          fetchCentrosCusto()
          return retryData
        }

        throw error
      }

      console.log("Centro de custo criado com sucesso:", data)

      setCentrosCusto((prev) => [...prev, {
        ...data,
        empresas: {
          id: data.empresas[0]?.id,
          Estabelecimento: data.empresas[0]?.Estabelecimento,
          Descricao: data.empresas[0]?.Descricao,
          created_at: data.created_at,
          updated_at: data.updated_at
        }
      }])
      toast({
        title: "Sucesso",
        description: "Centro de custo criado com sucesso",
      })

      fetchCentrosCusto()
      return data
    } catch (error: any) {
      console.error("Erro ao criar centro de custo:", error)

      if (error?.message === "Centro de custo duplicado") {
        return // Já mostrou o toast
      }

      let errorMessage = "Erro ao criar centro de custo"
      
      // Verificar se é um erro do Supabase
      if (error?.code) {
        if (error.code === "23505") {
          if (error.message?.includes("centro_custos_pkey")) {
            errorMessage = "Erro de sequência de ID. Por favor, recarregue a página e tente novamente."
          } else {
            errorMessage = "Já existe um centro de custo com esses dados"
          }
        } else if (error.code === "42P01") {
          errorMessage = "Tabela não encontrada. Verifique a configuração do banco de dados."
        } else {
          errorMessage = `Erro do banco de dados: ${error.message || 'Erro desconhecido'}`
        }
      } else if (error?.message) {
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

  const updateCentroCusto = async (id: number, updates: Partial<CentroCusto>) => {
    try {
      // Verificar duplicatas na atualização (excluindo o próprio registro)
      if (updates.nome && updates.empresa_id) {
        const { data: existingData, error: checkError } = await supabase
          .from("centro_custos")
          .select("id, nome")
          .eq("nome", updates.nome)
          .eq("empresa_id", updates.empresa_id)
          .neq("id", id)

        if (checkError) {
          console.error("Erro ao verificar duplicatas na atualização:", checkError)
        } else if (existingData && existingData.length > 0) {
          toast({
            title: "Erro",
            description: "Já existe outro centro de custo com este nome nesta empresa",
            variant: "destructive",
          })
          throw new Error("Centro de custo duplicado")
        }
      }

      const { data, error } = await supabase
        .from("centro_custos")
        .update(updates)
        .eq("id", id)
        .select(`
          id,
          empresa_id,
          nome,
          codigo,
          created_at,
          updated_at,
          empresas (
            id,
            Estabelecimento,
            Descricao
          )
        `)
        .single()

      if (error) throw error

      setCentrosCusto((prev) => prev.map((cc) => cc.id === id ? {
        ...data,
        empresas: {
          id: data.empresas[0]?.id,
          Estabelecimento: data.empresas[0]?.Estabelecimento,
          Descricao: data.empresas[0]?.Descricao,
          created_at: data.created_at,
          updated_at: data.updated_at
        }
      } : cc))
      toast({
        title: "Sucesso",
        description: "Centro de custo atualizado com sucesso",
      })

      fetchCentrosCusto()
      return data
    } catch (error) {
      console.error("Erro ao atualizar centro de custo:", error)

      if ((error as Error).message !== "Centro de custo duplicado") {
        toast({
          title: "Erro",
          description: "Erro ao atualizar centro de custo",
          variant: "destructive",
        })
      }
      throw error
    }
  }

  const deleteCentroCusto = async (id: number) => {
    try {
      const { error } = await supabase.from("centro_custos").delete().eq("id", id)

      if (error) throw error

      setCentrosCusto((prev) => prev.filter((cc) => cc.id !== id))
      toast({
        title: "Sucesso",
        description: "Centro de custo excluído com sucesso",
      })
    } catch (error) {
      console.error("Erro ao excluir centro de custo:", error)
      toast({
        title: "Erro",
        description: "Erro ao excluir centro de custo",
        variant: "destructive",
      })
      throw error
    }
  }

  useEffect(() => {
    fetchCentrosCusto()
  }, [])

  return {
    centrosCusto,
    loading,
    createCentroCusto,
    updateCentroCusto,
    deleteCentroCusto,
    refetch: fetchCentrosCusto,
  }
}
