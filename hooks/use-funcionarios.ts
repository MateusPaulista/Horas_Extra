"use client"

import { useState, useEffect } from "react"
import {
  supabase,
  type Funcionario,
  uploadFotoFuncionario,
  getFotoFuncionarioUrl,
  verificarFotoExiste,
} from "@/lib/supabase"
import { toast } from "sonner"

export function useFuncionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const fetchFuncionarios = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("funcionarios")
        .select(`
          *,
          centro_custos (
            *,
            empresas (*)
          ),
          turnos (*)
        `)
        .order("nome")

      if (error) throw error

      console.log("Funcionários carregados:", data?.length || 0)
      setFuncionarios(data || [])
      setInitialized(true)
    } catch (error) {
      console.error("❌ Erro ao buscar funcionários:", JSON.stringify({
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        error: error instanceof Error ? error.stack : String(error)
      }, null, 2))
      toast.error("Erro ao carregar funcionários")
    } finally {
      setLoading(false)
    }
  }

  // Removido o useEffect que carregava automaticamente os dados

  const createFuncionario = async (funcionarioData: any, foto?: File) => {
    try {
      console.log("=== CRIANDO FUNCIONÁRIO COM SISTEMA ROBUSTO ===")
      console.log("Dados recebidos:", funcionarioData)

      // Preparar dados base (sem ID)
      const baseData = {
        nome: funcionarioData.nome,
        matricula: funcionarioData.matricula,
        data_admissao: funcionarioData.data_admissao,
        ativo: funcionarioData.ativo,
        turno_id: funcionarioData.turno_id || null,
        centro_custo_id: funcionarioData.centro_custo_id || null,
      }

      console.log("📝 Dados base preparados:", baseData)

      // ESTRATÉGIA 1: Inserção automática (deixa sequência gerar ID)
      console.log("🚀 Estratégia 1: Inserção automática")
      const { data, error } = await supabase
        .from("funcionarios")
        .insert([baseData])
        .select(`
          *,
          centro_custos (
            *,
            empresas (*)
          ),
          turnos (*)
        `)
        .single()

      if (!error) {
        console.log("✅ Estratégia 1 funcionou! Funcionário criado:", data)

        // Upload da foto se fornecida
        if (foto && data.matricula) {
          try {
            console.log("📸 Fazendo upload da foto para matrícula:", data.matricula)
            await uploadFotoFuncionario(data.matricula, foto)
            toast.success("Funcionário criado e foto enviada com sucesso!")
          } catch (fotoError) {
            console.error("Erro no upload da foto:", fotoError)
            toast.warning("Funcionário criado, mas houve erro no upload da foto")
          }
        } else {
          toast.success("Funcionário criado com sucesso!")
        }

        await fetchFuncionarios()
        return data
      }

      // ESTRATÉGIA 2: ID calculado inteligente
      if (error && error.message.includes("duplicate key")) {
        console.log("❌ Estratégia 1 falhou: duplicate key")
        console.log("🔍 Buscando próximo ID disponível...")

        // Buscar todos os IDs existentes
        const { data: existingIds } = await supabase.from("funcionarios").select("id").order("id")

        if (existingIds) {
          const ids = existingIds.map((item) => item.id).sort((a, b) => a - b)
          console.log("📊 IDs existentes ordenados:", ids)

          // Encontrar primeiro gap ou usar max + 1
          let nextAvailableId = 1
          for (let i = 0; i < ids.length; i++) {
            if (ids[i] !== i + 1) {
              nextAvailableId = i + 1
              break
            }
          }

          if (nextAvailableId === 1 && ids.length > 0) {
            nextAvailableId = Math.max(...ids) + 1
          }

          console.log("🎯 Próximo ID disponível calculado:", nextAvailableId)

          // ESTRATÉGIA 2: Tentar com ID específico
          console.log("🚀 Estratégia 2: ID calculado")
          const dataWithId = { id: nextAvailableId, ...baseData }
          console.log("📝 Dados com ID específico:", dataWithId)

          const result2 = await supabase
            .from("funcionarios")
            .insert([dataWithId])
            .select(`
              *,
              centro_custos (
                *,
                empresas (*)
              ),
              turnos (*)
            `)
            .single()

          if (!result2.error) {
            console.log("✅ Estratégia 2 funcionou! Funcionário criado:", result2.data)

            // Upload da foto
            if (foto && result2.data.matricula) {
              try {
                await uploadFotoFuncionario(result2.data.matricula, foto)
                toast.success("Funcionário criado e foto enviada com sucesso!")
              } catch (fotoError) {
                console.error("Erro no upload da foto:", fotoError)
                toast.warning("Funcionário criado, mas houve erro no upload da foto")
              }
            } else {
              toast.success("Funcionário criado com sucesso!")
            }

            await fetchFuncionarios()
            return result2.data
          }

          // ESTRATÉGIA 3: Tentativas múltiplas
          console.log("❌ Estratégia 2 falhou, tentando múltiplos IDs...")
          for (let attempt = 0; attempt < 20; attempt++) {
            const testId = nextAvailableId + attempt
            console.log(`🔄 Tentativa ${attempt + 1}: ID ${testId}`)

            const testData = { id: testId, ...baseData }
            const testResult = await supabase
              .from("funcionarios")
              .insert([testData])
              .select(`
                *,
                centro_custos (
                  *,
                  empresas (*)
                ),
                turnos (*)
              `)
              .single()

            if (!testResult.error) {
              console.log(`✅ Estratégia 3 funcionou na tentativa ${attempt + 1}! ID: ${testId}`)

              // Upload da foto
              if (foto && testResult.data.matricula) {
                try {
                  await uploadFotoFuncionario(testResult.data.matricula, foto)
                  toast.success("Funcionário criado e foto enviada com sucesso!")
                } catch (fotoError) {
                  console.error("Erro no upload da foto:", fotoError)
                  toast.warning("Funcionário criado, mas houve erro no upload da foto")
                }
              } else {
                toast.success("Funcionário criado com sucesso!")
              }

              await fetchFuncionarios()
              return testResult.data
            }
          }

          // ESTRATÉGIA 4: ID baseado em timestamp
          console.log("🚀 Estratégia 4: ID timestamp")
          const timestampId = Date.now() % 1000000 // ID único baseado em tempo
          const dataWithTimestamp = { id: timestampId, ...baseData }
          console.log("📝 Dados com ID timestamp:", dataWithTimestamp)

          const result4 = await supabase
            .from("funcionarios")
            .insert([dataWithTimestamp])
            .select(`
              *,
              centro_custos (
                *,
                empresas (*)
              ),
              turnos (*)
            `)
            .single()

          if (!result4.error) {
            console.log("✅ Estratégia 4 funcionou! ID timestamp:", timestampId)

            // Upload da foto
            if (foto && result4.data.matricula) {
              try {
                await uploadFotoFuncionario(result4.data.matricula, foto)
                toast.success("Funcionário criado e foto enviada com sucesso!")
              } catch (fotoError) {
                console.error("Erro no upload da foto:", fotoError)
                toast.warning("Funcionário criado, mas houve erro no upload da foto")
              }
            } else {
              toast.success("Funcionário criado com sucesso!")
            }

            await fetchFuncionarios()
            return result4.data
          }
        }
      }

      // Se chegou até aqui, todas as estratégias falharam
      console.error("❌ Todas as estratégias falharam:", error)
      throw error
    } catch (error) {
      console.error("Erro ao criar funcionário:", error)

      // Mensagens de erro específicas
      let errorMessage = "Erro ao criar funcionário"
      if (error instanceof Error && error.message.includes("duplicate key")) {
        errorMessage =
          "Erro persistente de sequência de ID. Execute os scripts de correção: fix-funcionarios-sequence.sql e recreate-funcionarios-sequence.sql"
      } else if (error instanceof Error && error.message.includes("foreign key")) {
        errorMessage = "Centro de custo ou turno inválido. Verifique as seleções."
      } else if (error instanceof Error && error.message.includes("not-null")) {
        errorMessage = "Campos obrigatórios não preenchidos."
      } else if (error instanceof Error && error.message.includes("unique") && error.message.includes("matricula")) {
        errorMessage = "Matrícula já existe. Use uma matrícula diferente."
      }

      toast.error(errorMessage)
      throw error
    }
  }

  const updateFuncionario = async (id: number, funcionarioData: any, foto?: File) => {
    try {
      console.log("=== ATUALIZANDO FUNCIONÁRIO ===")
      console.log("ID do funcionário:", id)
      console.log("Dados para atualização:", funcionarioData)

      // Preparar dados para atualização
      const dataToUpdate = {
        nome: funcionarioData.nome,
        matricula: funcionarioData.matricula,
        data_admissao: funcionarioData.data_admissao,
        ativo: funcionarioData.ativo,
        turno_id: funcionarioData.turno_id || null,
        centro_custo_id: funcionarioData.centro_custo_id || null,
      }

      console.log("📝 Dados preparados para atualização:", dataToUpdate)

      const { data, error } = await supabase
        .from("funcionarios")
        .update(dataToUpdate)
        .eq("id", id)
        .select(`
        *,
        centro_custos (
          *,
          empresas (*)
        ),
        turnos (*)
      `)
        .single()

      if (error) {
        console.error("Erro na atualização:", error)
        throw error
      }

      console.log("✅ Funcionário atualizado com sucesso:", data)

      // Upload da foto se fornecida
      if (foto && funcionarioData.matricula) {
        try {
          console.log("📸 Fazendo upload da nova foto para matrícula:", funcionarioData.matricula)
          await uploadFotoFuncionario(funcionarioData.matricula, foto)
          toast.success("Funcionário atualizado e foto enviada com sucesso!")
        } catch (fotoError) {
          console.error("Erro no upload da foto:", fotoError)
          toast.warning("Funcionário atualizado, mas houve erro no upload da foto")
        }
      } else {
        toast.success("Funcionário atualizado com sucesso!")
      }

      await fetchFuncionarios()
      return data
    } catch (error) {
      console.error("Erro ao atualizar funcionário:", error)

      // Mensagens de erro específicas para edição
      let errorMessage = "Erro ao atualizar funcionário"
      if (error instanceof Error && error.message.includes("foreign key")) {
        errorMessage = "Centro de custo ou turno inválido. Verifique as seleções."
      } else if (error instanceof Error && error.message.includes("not-null")) {
        errorMessage = "Campos obrigatórios não preenchidos."
      } else if (error instanceof Error && error.message.includes("unique") && error.message.includes("matricula")) {
        errorMessage = "Matrícula já existe. Use uma matrícula diferente."
      }

      toast.error(errorMessage)
      throw error
    }
  }

  const deleteFuncionario = async (id: number) => {
    try {
      const { error } = await supabase.from("funcionarios").delete().eq("id", id)

      if (error) throw error

      toast.success("Funcionário excluído com sucesso!")
      await fetchFuncionarios()
    } catch (error) {
      console.error("Erro ao excluir funcionário:", error)
      toast.error("Erro ao excluir funcionário")
      throw error
    }
  }

  // Cache para URLs das fotos
  const [fotoUrlCache, setFotoUrlCache] = useState<Map<string, string>>(new Map())

  // Função melhorada para obter URL da foto com cache
  const getFotoUrl = (matricula: string) => {
    if (!matricula) return null
    
    // Verificar se já temos a URL no cache
    if (fotoUrlCache.has(matricula)) {
      return fotoUrlCache.get(matricula)!
    }
    
    // Gerar nova URL e adicionar ao cache
    const url = getFotoFuncionarioUrl(matricula)
    if (url) {
      setFotoUrlCache(prev => new Map(prev).set(matricula, url))
    }
    
    return url
  }

  // Função para verificar se foto existe
  const verificarFoto = async (matricula: string) => {
    return await verificarFotoExiste(matricula)
  }

  return {
    funcionarios,
    loading,
    initialized,
    createFuncionario,
    updateFuncionario,
    deleteFuncionario,
    getFotoUrl,
    verificarFoto,
    refetch: fetchFuncionarios,
    fetchFuncionarios, // Expor função para carregamento manual
  }
}
