"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"

interface FiltrosCascata {
  empresa: string
  centroCusto: string
  turno: string
  funcionario: string
  dataInicio?: Date
  dataFim?: Date
}

interface OpcoesFiltradas {
  empresas: any[]
  centrosCusto: any[]
  turnos: any[]
  funcionarios: any[]
}

export function useFiltrosCascata() {
  const [filtros, setFiltros] = useState<FiltrosCascata>({
    empresa: "all",
    centroCusto: "all",
    turno: "all",
    funcionario: "all",
    dataInicio: undefined,
    dataFim: undefined,
  })

  const [dadosOriginais, setDadosOriginais] = useState({
    empresas: [],
    centrosCusto: [],
    turnos: [],
    funcionarios: [],
  })

  const [loading, setLoading] = useState(true)

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true)

        // Teste de conexão com Supabase
        console.log("🔗 Testando conexão com Supabase...")
        const { data: testConnection } = await supabase.from("empresas").select("count", { count: "exact" })
        console.log("🔗 Teste de conexão - Total de empresas:", testConnection)
        
        // Carregar empresas
        console.log("🏢 Iniciando carregamento de empresas...")
        const { data: empresas, error: empresasError } = await supabase.from("empresas").select("*").order("Estabelecimento")
        console.log("🏢 Empresas carregadas:", empresas?.length || 0)
        console.log("🏢 Dados das empresas:", empresas)
        if (empresasError) {
          console.error("❌ Erro ao carregar empresas:", empresasError)
          console.error("❌ Detalhes do erro:", empresasError.message, empresasError.details)
        } else {
          console.log("✅ Empresas carregadas com sucesso!")
        }

        // Carregar centros de custo
        console.log("📋 Iniciando carregamento de centros de custo...")
        const { data: centrosCusto, error: errorCentros } = await supabase
          .from("centro_custos")
          .select("id, empresa_id, codigo, nome, empresas(Estabelecimento, Descricao)")
          .order("codigo")
        
        if (errorCentros) {
          console.error("❌ Erro ao carregar centros de custo:")
          console.error("❌ Código do erro:", errorCentros.code)
          console.error("❌ Mensagem do erro:", errorCentros.message)
          console.error("❌ Detalhes do erro:", errorCentros.details)
          console.error("❌ Hint do erro:", errorCentros.hint)
          console.error("❌ Objeto completo do erro:", JSON.stringify(errorCentros, null, 2))
          return // Sair da função se houver erro
        } else {
          console.log("✅ Centros de custo carregados:", centrosCusto?.length || 0)
          console.log("📋 Primeiros 3 centros:", centrosCusto?.slice(0, 3))
          
          // Log detalhado dos centros de custo da empresa 700
          const centros700 = centrosCusto?.filter(c => c.empresa_id === 700 || c.empresa_id === "700")
          console.log("🔍 Centros de custo da empresa 700:", centros700)
          console.log("🔍 Quantidade de centros da empresa 700:", centros700?.length || 0)
          
          // Log de todos os empresa_id únicos
          const empresaIds = [...new Set(centrosCusto?.map(c => c.empresa_id))]
          console.log("🏢 Todos os empresa_id encontrados:", empresaIds)
          console.log("🏢 Tipos dos empresa_id:", empresaIds.map(id => `${id} (${typeof id})`))  
        }

          // Carregar turnos
          console.log("⏰ Iniciando carregamento de turnos...")
          const { data: turnos, error: errorTurnos } = await supabase
            .from("turnos")
            .select("id, empresa_id, nome, hora_inicio, hora_fim, empresas(Estabelecimento, Descricao)")
            .order("nome")
          
          if (errorTurnos) {
            console.error("❌ Erro ao carregar turnos:", errorTurnos)
            return
          }

          // Carregar funcionários
          console.log("👥 Iniciando carregamento de funcionários...")
          const { data: funcionarios, error: errorFuncionarios } = await supabase
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
          
          if (errorFuncionarios) {
            console.error("❌ Erro ao carregar funcionários:", errorFuncionarios)
            return
          }
          
          console.log("📊 Funcionários carregados:", funcionarios?.length || 0)
          if (funcionarios && funcionarios.length > 0) {
            console.log("📊 Estrutura do primeiro funcionário:", {
              id: funcionarios[0].id,
              nome: funcionarios[0].nome,
              centro_custos: funcionarios[0].centro_custos,
              centro_custo_id: funcionarios[0].centro_custo_id
            })
          }
          
          console.log("👥 Funcionários carregados:", funcionarios?.length || 0)
          if (funcionarios && funcionarios.length > 0) {
            console.log("👥 Estrutura do primeiro funcionário:", funcionarios[0])
            console.log("👥 Centro de custo do primeiro funcionário:", funcionarios[0]?.centro_custos)
          }

          const dadosParaDefinir = {
            empresas: empresas || [],
            centrosCusto: centrosCusto || [],
            turnos: turnos || [],
            funcionarios: funcionarios || [],
          }
          
          console.log("📊 Definindo dados originais:", {
            empresas: dadosParaDefinir.empresas.length,
            centrosCusto: dadosParaDefinir.centrosCusto.length,
          turnos: dadosParaDefinir.turnos.length,
          funcionarios: dadosParaDefinir.funcionarios.length
        })
        
          setDadosOriginais({
            empresas: dadosParaDefinir.empresas as [],
            centrosCusto: dadosParaDefinir.centrosCusto as [],
            turnos: dadosParaDefinir.turnos as [], 
            funcionarios: dadosParaDefinir.funcionarios as []
          })
        } catch (error) {
          console.error("❌ Erro geral ao carregar dados:", error)
          console.error("❌ Stack trace:", error instanceof Error ? error.stack : 'Erro desconhecido')
        } finally {
          setLoading(false)
        }
    }

    carregarDados()
  }, [])

  // Calcular opções filtradas baseadas nas seleções
  const opcoesFiltradas = useMemo<OpcoesFiltradas>(() => {
    console.log("🔄 Calculando opções filtradas. Dados originais:", {
      empresas: dadosOriginais.empresas.length,
      filtroEmpresa: filtros.empresa
    })
    
    const empresasFiltradas = dadosOriginais.empresas
    let centrosCustoFiltrados = dadosOriginais.centrosCusto
    let turnosFiltrados = dadosOriginais.turnos
    let funcionariosFiltrados = dadosOriginais.funcionarios

    // Filtrar centros de custo por empresa selecionada
    if (filtros.empresa !== "all") {
      const empresaId = Number.parseInt(filtros.empresa)
      const empresaIdString = filtros.empresa
      console.log(`🏢 Filtrando por empresa ID: ${empresaId} (número) | ${empresaIdString} (string)`)
      console.log(`📋 Centros de custo antes do filtro: ${dadosOriginais.centrosCusto.length}`)
      
      centrosCustoFiltrados = dadosOriginais.centrosCusto.filter((centro: any) => {
        // Tentar comparação com número e string
        const matchNumber = centro.empresa_id === empresaId
        const matchString = centro.empresa_id === empresaIdString
        const matchStringNumber = String(centro.empresa_id) === empresaIdString
        const match = matchNumber || matchString || matchStringNumber
        
        if (centro.empresa_id === 700 || centro.empresa_id === "700" || String(centro.empresa_id) === "700") {
          console.log(`🔍 EMPRESA 700 - Centro: ${centro.nome} | empresa_id: ${centro.empresa_id} (tipo: ${typeof centro.empresa_id}) | empresaId: ${empresaId} (tipo: ${typeof empresaId}) | matchNumber: ${matchNumber} | matchString: ${matchString} | matchStringNumber: ${matchStringNumber} | Match Final: ${match}`)
        }
        
        return match
      })
      
      console.log(`📋 Centros de custo após filtro: ${centrosCustoFiltrados.length}`)
      console.log(`📋 Centros filtrados:`, centrosCustoFiltrados.map((c: { nome: string; empresa_id: string | number }) => `${c.nome} (empresa_id: ${c.empresa_id})`))
      
      turnosFiltrados = dadosOriginais.turnos.filter((turno: any) => turno.empresa_id === empresaId)
      
      console.log(`👥 Filtrando funcionários para empresa ${empresaId}...`)
      console.log(`👥 Total de funcionários antes do filtro:`, dadosOriginais.funcionarios.length)
      
      funcionariosFiltrados = dadosOriginais.funcionarios.filter(
        (funcionario: any) => {
          const empresaIdFuncionario = funcionario.centro_custos?.empresa_id
          const empresaIdNumerico = Number(empresaIdFuncionario)
          const empresaIdComparacao = Number(empresaId)
          
          return empresaIdNumerico === empresaIdComparacao
        }
      )
      
      console.log(`👥 Funcionários após filtro por empresa: ${funcionariosFiltrados.length}`)
      if (funcionariosFiltrados.length > 0) {
        console.log(`👥 First filtered employee:`, (funcionariosFiltrados[0] as { nome: string })?.nome)
      }
    }

    // Filtrar funcionários por centro de custo selecionado
    if (filtros.centroCusto !== "all") {
      const centroCustoId = Number.parseInt(filtros.centroCusto)
      funcionariosFiltrados = funcionariosFiltrados.filter(
        (funcionario: any) => funcionario.centro_custo_id === centroCustoId,
      )
    }

    // Filtrar funcionários por turno selecionado
    if (filtros.turno !== "all") {
      const turnoId = Number.parseInt(filtros.turno)
      funcionariosFiltrados = funcionariosFiltrados.filter((funcionario: any) => funcionario.turno_id === turnoId)
    }

    const resultado = {
      empresas: empresasFiltradas,
      centrosCusto: centrosCustoFiltrados,
      turnos: turnosFiltrados,
      funcionarios: funcionariosFiltrados,
    }
    
    console.log("✅ Opções filtradas calculadas:", {
      empresas: resultado.empresas.length,
      centrosCusto: resultado.centrosCusto.length,
      turnos: resultado.turnos.length,
      funcionarios: resultado.funcionarios.length
    })
    
    return resultado
  }, [dadosOriginais, filtros])

  // Função para atualizar filtros com reset em cascata
  const updateFiltro = (campo: string, valor: any) => {
    setFiltros((prev) => {
      const novosFiltros = { ...prev, [campo]: valor }

      // Reset em cascata quando filtros pai mudam
      if (campo === "empresa") {
        novosFiltros.centroCusto = "all"
        novosFiltros.turno = "all"
        novosFiltros.funcionario = "all"
      } else if (campo === "centroCusto") {
        novosFiltros.funcionario = "all"
      } else if (campo === "turno") {
        novosFiltros.funcionario = "all"
      }

      return novosFiltros
    })
  }

  // Função para resetar todos os filtros
  const resetFiltros = () => {
    setFiltros({
      empresa: "all",
      centroCusto: "all",
      turno: "all",
      funcionario: "all",
      dataInicio: undefined,
      dataFim: undefined,
    })
  }

  return {
    filtros,
    opcoesFiltradas,
    updateFiltro,
    resetFiltros,
    loading,
  }
}
