"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export interface MonitoramentoItem {
  id: number
  funcionario_id: number
  foto: string | null
  funcionario: string
  matricula: string
  empresa: string
  turno: string
  setor: string
  horas: number
  horasExtras: number
  horasAtraso: number
  horasFalta: number
  horasJustificadas: number
  saldoHoras: number
  status: "positiva" | "normal" | "negativa"
  horasPrevistas: number
  diasTrabalhados: number
  diasFalta: number
  dataAdmissao: string
  periodoEfetivo: {
    inicio: string
    fim: string
  }
}

export function useMonitoramento() {
  const [monitoramento, setMonitoramento] = useState<MonitoramentoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Função simples para extrair horário de qualquer formato
  const extrairHorario = (valor: any): string | null => {
    if (!valor) return null

    try {
      const str = String(valor).trim()
      if (!str || str === "null") return null

      // Se já é HH:MM
      if (/^\d{1,2}:\d{2}$/.test(str)) {
        return str.padStart(5, "0")
      }

      // Se é timestamp
      if (str.includes("-") || str.includes("T")) {
        const date = new Date(str)
        if (!isNaN(date.getTime())) {
          const h = date.getHours().toString().padStart(2, "0")
          const m = date.getMinutes().toString().padStart(2, "0")
          return `${h}:${m}`
        }
      }

      // Se é número (0800, 1430)
      if (/^\d{3,4}$/.test(str)) {
        const padded = str.padStart(4, "0")
        return `${padded.slice(0, 2)}:${padded.slice(2, 4)}`
      }

      return null
    } catch {
      return null
    }
  }

  // Converter HH:MM para minutos desde meia-noite
  const horarioParaMinutos = (horario: string | null): number => {
    if (!horario || typeof horario !== "string" || !horario.includes(":")) return 0

    try {
      const [h, m] = horario.split(":").map(Number)
      if (isNaN(h) || isNaN(m)) return 0
      return h * 60 + m
    } catch {
      return 0
    }
  }

  // Converter minutos para horas decimais
  const minutosParaHoras = (minutos: number): number => {
    return Math.round((minutos / 60) * 100) / 100
  }

  // Calcular horas trabalhadas de uma batida
  const calcularHorasTrabalhadasDia = (batida: any): number => {
    console.log(`      🔍 Analisando batida do dia ${batida.created_at}`)

    const horarios: string[] = []

    // Coletar todos os horários válidos
    for (let i = 1; i <= 8; i++) {
      const horario = extrairHorario(batida[`B${i}`])
      if (horario) {
        horarios.push(horario)
        console.log(`        B${i}: ${batida[`B${i}`]} -> ${horario}`)
      }
    }

    if (horarios.length < 2) {
      console.log(`        ❌ Apenas ${horarios.length} horário(s) válido(s)`)
      return 0
    }

    // Ordenar horários
    horarios.sort()
    console.log(`        📋 Horários ordenados: [${horarios.join(", ")}]`)

    let totalMinutos = 0

    // Calcular períodos trabalhados (entrada/saída)
    for (let i = 0; i < horarios.length - 1; i += 2) {
      const entrada = horarios[i]
      const saida = horarios[i + 1]

      if (entrada && saida) {
        const minEntrada = horarioParaMinutos(entrada)
        const minSaida = horarioParaMinutos(saida)

        if (minSaida > minEntrada) {
          const minutosPeriodo = minSaida - minEntrada
          totalMinutos += minutosPeriodo
          console.log(`        ✅ ${entrada} às ${saida} = ${minutosPeriodo}min`)
        }
      }
    }

    const horas = minutosParaHoras(totalMinutos)
    console.log(`        📊 Total: ${totalMinutos}min = ${horas}h`)
    return horas
  }

  // Extrair data do timestamp
  const extrairData = (timestamp: string): string => {
    try {
      const date = new Date(timestamp)
      return date.toISOString().split("T")[0]
    } catch {
      return ""
    }
  }

  // Verificar se é dia útil
  const isDiaUtil = (data: string): boolean => {
    const date = new Date(data + "T12:00:00")
    const diaSemana = date.getDay()
    return diaSemana >= 1 && diaSemana <= 5
  }

  // Gerar lista de dias úteis
  const gerarDiasUteis = (inicio: string, fim: string): string[] => {
    const dias: string[] = []
    const dataInicio = new Date(inicio + "T12:00:00")
    const dataFim = new Date(fim + "T12:00:00")

    for (let d = new Date(dataInicio); d <= dataFim; d.setDate(d.getDate() + 1)) {
      const dataStr = d.toISOString().split("T")[0]
      if (isDiaUtil(dataStr)) {
        dias.push(dataStr)
      }
    }

    return dias
  }

  // Calcular horas previstas do turno
  const calcularHorasPrevisasTurno = (turno: any): number => {
    if (!turno?.hora_inicio || !turno?.hora_fim) return 8

    const horarioInicio = extrairHorario(turno.hora_inicio)
    const horarioFim = extrairHorario(turno.hora_fim)

    if (!horarioInicio || !horarioFim) return 8

    const inicio = horarioParaMinutos(horarioInicio)
    const fim = horarioParaMinutos(horarioFim)

    if (inicio === 0 && fim === 0) return 8

    let totalMin = fim - inicio

    if (totalMin < 0) totalMin += 24 * 60

    if (turno.tempo_refeicao) {
      const horarioRefeicao = extrairHorario(turno.tempo_refeicao)
      if (horarioRefeicao) {
        const refeicao = horarioParaMinutos(horarioRefeicao)
        totalMin -= refeicao
      }
    }

    const horas = minutosParaHoras(totalMin)
    return horas > 0 ? horas : 8
  }

  const fetchMonitoramento = async (dataInicio?: string, dataFim?: string, empresaId?: number, setorId?: number) => {
    try {
      if (!dataInicio || !dataFim) {
        setMonitoramento([])
        return
      }

      setLoading(true)
      setError(null)

      console.log("🔍 === INICIANDO MONITORAMENTO ===")
      console.log(`📅 Período: ${dataInicio} a ${dataFim}`)

      // 1. Buscar funcionários com relacionamentos
      let query = supabase
        .from("funcionarios")
        .select(`
          id, nome, matricula, data_admissao,
          centro_custos!inner (
            id, nome,
            empresas!inner (id, Estabelecimento)
          ),
          turnos (id, nome, hora_inicio, hora_fim, tempo_refeicao)
        `)
        .eq("ativo", true)

      if (setorId) query = query.eq("centro_custo_id", setorId)

      const { data: funcionarios, error: funcError } = await query

      if (funcError) throw new Error(`Erro funcionários: ${funcError.message}`)

      console.log(`👥 Funcionários encontrados: ${funcionarios?.length || 0}`)

      if (!funcionarios?.length) {
        setMonitoramento([])
        return
      }

      // Filtrar por empresa se necessário
      let funcionariosFiltrados = funcionarios
      if (empresaId) {
        funcionariosFiltrados = funcionarios.filter((f) => f.centro_custos?.empresas?.id === empresaId)
      }

      console.log(`👥 Funcionários após filtros: ${funcionariosFiltrados.length}`)

      // 2. Buscar batidas do período
      const { data: batidas, error: batidasError } = await supabase
        .from("batidas_ponto")
        .select("*")
        .in(
          "funcionario_id",
          funcionariosFiltrados.map((f) => f.id),
        )
        .gte("created_at", `${dataInicio}T00:00:00`)
        .lte("created_at", `${dataFim}T23:59:59`)

      if (batidasError) throw new Error(`Erro batidas: ${batidasError.message}`)

      console.log(`⏰ Batidas encontradas: ${batidas?.length || 0}`)

      // 3. Processar cada funcionário
      const resultados: MonitoramentoItem[] = []

      for (const funcionario of funcionariosFiltrados) {
        console.log(`\n📊 === PROCESSANDO: ${funcionario.nome} ===`)

        // Período efetivo (considerando admissão)
        let periodoInicio = dataInicio
        if (funcionario.data_admissao && funcionario.data_admissao > dataInicio) {
          periodoInicio = funcionario.data_admissao
        }

        const diasUteis = gerarDiasUteis(periodoInicio, dataFim)
        console.log(`📅 Dias úteis no período: ${diasUteis.length}`)

        if (diasUteis.length === 0) continue

        // Horas previstas por dia
        const horasPrevistasPorDia = calcularHorasPrevisasTurno(funcionario.turnos)
        console.log(`⏰ Horas previstas por dia: ${horasPrevistasPorDia}h`)

        // Agrupar batidas por data
        const batidasFuncionario = batidas?.filter((b) => b.funcionario_id === funcionario.id) || []
        const batidasPorData: Record<string, any> = {}

        batidasFuncionario.forEach((batida) => {
          const data = extrairData(batida.created_at)
          if (diasUteis.includes(data)) {
            batidasPorData[data] = batida
          }
        })

        console.log(`📅 Dias com batidas: ${Object.keys(batidasPorData).length}`)

        // Calcular totais
        let totalHorasTrabalhadas = 0
        let totalHorasExtras = 0
        let totalHorasAtraso = 0
        let totalHorasFalta = 0
        let diasTrabalhados = 0

        // Analisar cada dia útil
        for (const data of diasUteis) {
          console.log(`\n    📅 Dia ${data}:`)

          const batida = batidasPorData[data]

          if (batida) {
            const horasTrabalhadasDia = calcularHorasTrabalhadasDia(batida)

            if (horasTrabalhadasDia > 0) {
              totalHorasTrabalhadas += horasTrabalhadasDia
              diasTrabalhados++

              const diferenca = horasTrabalhadasDia - horasPrevistasPorDia

              console.log(
                `      📊 Trabalhadas: ${horasTrabalhadasDia}h | Previstas: ${horasPrevistasPorDia}h | Diferença: ${diferenca.toFixed(2)}h`,
              )

              if (diferenca > 0.02) {
                // Tolerância de ~1 minuto
                totalHorasExtras += diferenca
                console.log(`      ➕ Horas extras: +${diferenca.toFixed(2)}h`)
              } else if (diferenca < -0.02) {
                totalHorasAtraso += Math.abs(diferenca)
                console.log(`      ➖ Horas atraso: ${Math.abs(diferenca).toFixed(2)}h`)
              } else {
                console.log(`      ✅ Horário normal`)
              }
            } else {
              totalHorasFalta += horasPrevistasPorDia
              console.log(`      ❌ Batida inválida - ${horasPrevistasPorDia}h de falta`)
            }
          } else {
            totalHorasFalta += horasPrevistasPorDia
            console.log(`      ❌ Sem batida - ${horasPrevistasPorDia}h de falta`)
          }
        }

        // Calcular saldo e status
        const cargaHorariaPrevista = horasPrevistasPorDia * diasUteis.length
        const saldoHoras = totalHorasTrabalhadas + totalHorasExtras - totalHorasAtraso - cargaHorariaPrevista

        let status: "positiva" | "normal" | "negativa"
        if (saldoHoras > 0.02) status = "positiva"
        else if (saldoHoras < -0.02) status = "negativa"
        else status = "normal"

        console.log(`\n📊 === RESUMO FINAL ===`)
        console.log(`⏰ Horas trabalhadas: ${totalHorasTrabalhadas.toFixed(2)}h`)
        console.log(`📋 Carga horária prevista: ${cargaHorariaPrevista.toFixed(2)}h`)
        console.log(`➕ Horas extras: ${totalHorasExtras.toFixed(2)}h`)
        console.log(`➖ Horas atraso: ${totalHorasAtraso.toFixed(2)}h`)
        console.log(`❌ Horas falta: ${totalHorasFalta.toFixed(2)}h`)
        console.log(`⚖️ Saldo: ${saldoHoras > 0 ? "+" : ""}${saldoHoras.toFixed(2)}h`)
        console.log(`🏷️ Status: ${status}`)

        const fotoUrl = funcionario.matricula
          ? `https://tagumuhncrpvfqvvpeac.supabase.co/storage/v1/object/public/fotosfuncionarios/${funcionario.matricula}.jpg`
          : null

        resultados.push({
          id: funcionario.id,
          funcionario_id: funcionario.id,
          foto: fotoUrl,
          funcionario: funcionario.nome,
          matricula: funcionario.matricula,
          empresa: funcionario.centro_custos?.empresas?.Estabelecimento || "N/A",
          turno: funcionario.turnos?.nome || "N/A",
          setor: funcionario.centro_custos?.nome || "N/A",
          horas: totalHorasTrabalhadas,
          horasExtras: totalHorasExtras,
          horasAtraso: totalHorasAtraso,
          horasFalta: totalHorasFalta,
          horasJustificadas: 0,
          saldoHoras,
          status,
          horasPrevistas: cargaHorariaPrevista,
          diasTrabalhados,
          diasFalta: diasUteis.length - diasTrabalhados,
          dataAdmissao: funcionario.data_admissao || "",
          periodoEfetivo: { inicio: periodoInicio, fim: dataFim },
        })
      }

      console.log(`\n🎯 Processamento concluído: ${resultados.length} funcionários`)
      setMonitoramento(resultados)
    } catch (error) {
      console.error("❌ Erro:", error)
      const msg = error instanceof Error ? error.message : "Erro desconhecido"
      setError(msg)
      toast({
        title: "Erro ao carregar dados",
        description: msg,
        variant: "destructive",
      })
      setMonitoramento([])
    } finally {
      setLoading(false)
    }
  }

  return {
    monitoramento,
    loading,
    error,
    fetchMonitoramento,
  }
}
