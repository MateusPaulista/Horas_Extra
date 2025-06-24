"use client"

import { useState, useEffect } from "react"
import { supabase, type BatidaPonto } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export function useBatidasPonto() {
  const [batidas, setBatidas] = useState<BatidaPonto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Buscar batidas de ponto com relacionamentos
  const fetchBatidas = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("batidas_ponto")
        .select(`
          *,
          funcionarios (
            id,
            nome,
            matricula,
            ativo,
            centro_custos (
              id,
              nome,
              codigo
            ),
            turnos (
              id,
              nome,
              hora_inicio,
              hora_fim
            )
          ),
          centro_custos (
            id,
            nome,
            codigo
          )
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao buscar batidas:", error)
        setError(error.message)
        return
      }

      console.log("Batidas carregadas:", data)
      setBatidas(data || [])
    } catch (err) {
      console.error("Erro ao buscar batidas:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  // Criar nova batida de ponto
  const createBatida = async (batidaData: Omit<BatidaPonto, "id" | "created_at" | "updated_at">) => {
    try {
      console.log("Criando batida:", batidaData)

      // Remover campos vazios/null para evitar erros
      const dadosLimpos = Object.fromEntries(
        Object.entries(batidaData).filter(([_, value]) => value !== null && value !== undefined && value !== ""),
      )

      console.log("Dados limpos para inserção:", dadosLimpos)

      const { data, error } = await supabase
        .from("batidas_ponto")
        .insert([dadosLimpos])
        .select(`
          *,
          funcionarios (
            id,
            nome,
            matricula,
            ativo,
            centro_custos (
              id,
              nome,
              codigo
            ),
            turnos (
              id,
              nome,
              hora_inicio,
              hora_fim
            )
          ),
          centro_custos (
            id,
            nome,
            codigo
          )
        `)
        .single()

      if (error) {
        console.error("Erro ao criar batida:", error)
        throw error
      }

      console.log("Batida criada:", data)
      setBatidas((prev) => [data, ...prev])

      toast({
        title: "✅ Batida registrada",
        description: "A batida de ponto foi registrada com sucesso.",
      })

      return data
    } catch (error) {
      console.error("Erro ao criar batida:", error)
      toast({
        title: "❌ Erro ao registrar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
      throw error
    }
  }

  // Atualizar batida de ponto
  const updateBatida = async (id: number, batidaData: Partial<BatidaPonto>) => {
    try {
      console.log("Atualizando batida:", id, batidaData)

      // Remover campos vazios/null para evitar erros
      const dadosLimpos = Object.fromEntries(
        Object.entries(batidaData).filter(([_, value]) => value !== null && value !== undefined && value !== ""),
      )

      console.log("Dados limpos para atualização:", dadosLimpos)

      const { data, error } = await supabase
        .from("batidas_ponto")
        .update(dadosLimpos)
        .eq("id", id)
        .select(`
          *,
          funcionarios (
            id,
            nome,
            matricula,
            ativo,
            centro_custos (
              id,
              nome,
              codigo
            ),
            turnos (
              id,
              nome,
              hora_inicio,
              hora_fim
            )
          ),
          centro_custos (
            id,
            nome,
            codigo
          )
        `)
        .single()

      if (error) {
        console.error("Erro ao atualizar batida:", error)
        throw error
      }

      console.log("Batida atualizada:", data)
      setBatidas((prev) => prev.map((batida) => (batida.id === id ? data : batida)))

      toast({
        title: "✅ Batida atualizada",
        description: "A batida de ponto foi atualizada com sucesso.",
      })

      return data
    } catch (error) {
      console.error("Erro ao atualizar batida:", error)
      toast({
        title: "❌ Erro ao atualizar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
      throw error
    }
  }

  // Excluir batida de ponto
  const deleteBatida = async (id: number) => {
    try {
      console.log("Excluindo batida:", id)

      const { error } = await supabase.from("batidas_ponto").delete().eq("id", id)

      if (error) {
        console.error("Erro ao excluir batida:", error)
        throw error
      }

      console.log("Batida excluída:", id)
      setBatidas((prev) => prev.filter((batida) => batida.id !== id))

      toast({
        title: "✅ Batida excluída",
        description: "A batida de ponto foi excluída com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao excluir batida:", error)
      toast({
        title: "❌ Erro ao excluir",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
      throw error
    }
  }

  // Função para converter horário (HH:MM) + data para timestampz
  // SALVA EXATAMENTE O QUE O USUÁRIO DIGITOU
  const criarTimestamp = (data: string, horario: string): string | null => {
    if (!data || !horario) return null

    try {
      // Criar timestamp simples sem ajustes de fuso horário
      // O banco vai salvar exatamente o que mandamos
      const timestamp = `${data}T${horario}:00.000Z`
      console.log(`Criando timestamp: ${data} + ${horario} = ${timestamp}`)
      return timestamp
    } catch (error) {
      console.error("Erro ao criar timestamp:", error)
      return null
    }
  }

  // Função para extrair horário de timestampz
  // CORRIGE O FUSO HORÁRIO APENAS NA EXIBIÇÃO
  const extrairHorario = (timestamp: string | null): string => {
    if (!timestamp) return ""

    try {
      const date = new Date(timestamp)

      // Adicionar 3 horas para corrigir o fuso horário de Brasília
      const brasiliaDate = new Date(date.getTime() + 3 * 60 * 60 * 1000)

      const horario = brasiliaDate.toTimeString().slice(0, 5) // HH:MM
      console.log(`Extraindo horário: ${timestamp} -> ${horario}`)
      return horario
    } catch (error) {
      console.error("Erro ao extrair horário:", error)
      return ""
    }
  }

  // Função para extrair data de timestampz
  // CORRIGE O FUSO HORÁRIO APENAS NA EXIBIÇÃO
  const extrairData = (timestamp: string | null): string => {
    if (!timestamp) return ""

    try {
      const date = new Date(timestamp)

      // Adicionar 3 horas para corrigir o fuso horário de Brasília
      const brasiliaDate = new Date(date.getTime() + 3 * 60 * 60 * 1000)

      const dataFormatada = brasiliaDate.toISOString().split("T")[0] // YYYY-MM-DD
      console.log(`Extraindo data: ${timestamp} -> ${dataFormatada}`)
      return dataFormatada
    } catch (error) {
      console.error("Erro ao extrair data:", error)
      return ""
    }
  }

  // Função para formatar data para exibição na tabela
  const formatarDataBrasilia = (timestamp: string | null | undefined): string => {
    if (!timestamp) return ""

    try {
      const date = new Date(timestamp)

      // Adicionar 3 horas para corrigir o fuso horário de Brasília
      const brasiliaDate = new Date(date.getTime() + 3 * 60 * 60 * 1000)

      return brasiliaDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch (error) {
      console.error("Erro ao formatar data:", error)
      return ""
    }
  }

  // Função para formatar horário para exibição na tabela
  const formatarHorarioBrasilia = (timestamp: string | null | undefined): string => {
    if (!timestamp) return ""

    try {
      const date = new Date(timestamp)

      // Adicionar 3 horas para corrigir o fuso horário de Brasília
      const brasiliaDate = new Date(date.getTime() + 3 * 60 * 60 * 1000)

      return brasiliaDate.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Erro ao formatar horário:", error)
      return ""
    }
  }

  // Importar batidas de arquivo TXT
  const importarBatidasTXT = async (arquivo: File) => {
    try {
      console.log("Importando arquivo TXT:", arquivo.name)

      const conteudo = await arquivo.text()
      const { novasBatidas, totalRegistros } = processarArquivoTXT(conteudo)

      if (novasBatidas.length === 0) {
        toast({
          title: "⚠️ Nenhum registro encontrado",
          description: "Nenhum registro de batida de ponto foi encontrado no arquivo.",
          variant: "destructive",
        })
        return { success: false, registros: 0 }
      }

      // Inserir batidas no banco
      const { data, error } = await supabase
        .from("batidas_ponto")
        .insert(novasBatidas)
        .select(`
          *,
          funcionarios (
            id,
            nome,
            matricula,
            ativo,
            centro_custos (
              id,
              nome,
              codigo
            ),
            turnos (
              id,
              nome,
              hora_inicio,
              hora_fim
            )
          ),
          centro_custos (
            id,
            nome,
            codigo
          )
        `)

      if (error) {
        console.error("Erro ao importar batidas:", error)
        throw error
      }

      console.log("Batidas importadas:", data)
      setBatidas((prev) => [...(data || []), ...prev])

      toast({
        title: "✅ Arquivo importado com sucesso",
        description: `${totalRegistros} registros foram importados.`,
      })

      return { success: true, registros: totalRegistros }
    } catch (error) {
      console.error("Erro ao importar arquivo:", error)
      toast({
        title: "❌ Erro na importação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
      return { success: false, registros: 0 }
    }
  }

  // Processar arquivo TXT
  const processarArquivoTXT = (
    conteudo: string,
  ): {
    novasBatidas: Omit<BatidaPonto, "id" | "created_at" | "updated_at" | "funcionarios" | "centro_custos">[]
    totalRegistros: number
  } => {
    const linhas = conteudo.split("\n")
    const novasBatidas: Omit<BatidaPonto, "id" | "created_at" | "updated_at" | "funcionarios" | "centro_custos">[] = []
    let totalRegistros = 0

    let periodoMatch = null
    let funcionarioAtual: { matricula: string; nome: string; id?: number } | null = null
    let centroCustoAtual: { id?: number; nome: string } | null = null
    let proximaLinhaEhMarcacao = false

    // Extrair período do arquivo
    for (const linha of linhas) {
      if (linha.includes("Período:")) {
        const match = linha.match(/Período:\s*(\d{2})\/(\d{2})\/(\d{4})/)
        if (match) {
          periodoMatch = match
          break
        }
      }
    }

    let dataBase = ""
    if (periodoMatch && periodoMatch[1] && periodoMatch[2] && periodoMatch[3]) {
      const dia = periodoMatch[1]
      const mes = periodoMatch[2]
      const ano = periodoMatch[3]
      dataBase = `${ano}-${mes}-${dia}`
    } else {
      // Usar data atual se não encontrar no arquivo
      const dataAtual = new Date()
      const dia = String(dataAtual.getDate()).padStart(2, "0")
      const mes = String(dataAtual.getMonth() + 1).padStart(2, "0")
      const ano = String(dataAtual.getFullYear())
      dataBase = `${ano}-${mes}-${dia}`
    }

    // Processar linhas do arquivo
    for (let i = 0; i < linhas.length; i++) {
      const linha = linhas[i]

      if (linha.includes("Empregado:")) {
        const match = linha.match(/Empregado:\s+(\d+)\s+(.+)/)
        if (match) {
          funcionarioAtual = {
            matricula: match[1].trim(),
            nome: match[2].trim(),
          }
        }
        continue
      }

      if (linha.includes("Localização:")) {
        const match = linha.match(/Localização:\s+(.+)/)
        if (match && funcionarioAtual) {
          centroCustoAtual = {
            nome: match[1].trim(),
          }
        }
        continue
      }

      if (linha.includes("Marcações")) {
        proximaLinhaEhMarcacao = true
        continue
      }

      if (proximaLinhaEhMarcacao) {
        proximaLinhaEhMarcacao = false

        const marcacoes = linha.trim().split(/\s+/).filter(Boolean)

        if (marcacoes.length >= 1 && funcionarioAtual) {
          // Limpar marcações (remover R/M do final)
          const batidas = marcacoes.map((m) => m.replace(/[RM]$/, ""))

          const novaBatida: Omit<BatidaPonto, "id" | "created_at" | "updated_at" | "funcionarios" | "centro_custos"> = {
            funcionario_id: 0, // Será resolvido posteriormente
            centro_custo_id: 0, // Será resolvido posteriormente
            B1: batidas[0] ? criarTimestamp(dataBase, batidas[0]) : null,
            B2: batidas[1] ? criarTimestamp(dataBase, batidas[1]) : null,
            B3: batidas[2] ? criarTimestamp(dataBase, batidas[2]) : null,
            B4: batidas[3] ? criarTimestamp(dataBase, batidas[3]) : null,
            B5: batidas[4] ? criarTimestamp(dataBase, batidas[4]) : null,
            B6: batidas[5] ? criarTimestamp(dataBase, batidas[5]) : null,
            B7: batidas[6] ? criarTimestamp(dataBase, batidas[6]) : null,
            B8: batidas[7] ? criarTimestamp(dataBase, batidas[7]) : null,
          }

          novasBatidas.push(novaBatida)
          totalRegistros++
        }
      }
    }

    return { novasBatidas, totalRegistros }
  }

  useEffect(() => {
    fetchBatidas()
  }, [])

  return {
    batidas,
    loading,
    error,
    fetchBatidas,
    createBatida,
    updateBatida,
    deleteBatida,
    importarBatidasTXT,
    criarTimestamp,
    extrairHorario,
    extrairData,
    formatarDataBrasilia,
    formatarHorarioBrasilia,
  }
}
