"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowUp, ArrowDown, Calendar, X, AlertCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useMonitoramento } from "@/hooks/use-monitoramento"
import { useEmpresas } from "@/hooks/use-empresas"
import { useCentroCustos } from "@/hooks/use-centro-custos"

type SortField =
  | "funcionario"
  | "empresa"
  | "turno"
  | "setor"
  | "horas"
  | "horasExtras"
  | "horasAtraso"
  | "horasFalta"
  | "horasJustificadas"
  | "saldoHoras"
  | "status"

type SortDirection = "asc" | "desc"

export default function MonitoramentoPage() {
  const { monitoramento, loading, fetchMonitoramento } = useMonitoramento()
  const { empresas } = useEmpresas()
  const { centrosCusto } = useCentroCustos()

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [empresaFilter, setEmpresaFilter] = useState<string>("all")
  const [setorFilter, setSetorFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")

  // Estados para ordenação
  const [sortField, setSortField] = useState<SortField>("funcionario")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  // Carregar dados iniciais (empresas e centros de custo)
  useEffect(() => {
    console.log("📋 Página de monitoramento carregada - aguardando filtros de data obrigatórios")
  }, [])

  // Recarregar dados quando filtros mudarem
  useEffect(() => {
    if (dateFrom && dateTo) {
      const empresaId = empresaFilter === "all" ? undefined : Number.parseInt(empresaFilter)
      const setorId = setorFilter === "all" ? undefined : Number.parseInt(setorFilter)

      console.log("🔄 Aplicando filtros de monitoramento:", { dateFrom, dateTo, empresaId, setorId })
      fetchMonitoramento(dateFrom, dateTo, empresaId, setorId)
    } else {
      console.log("⚠️ Filtros de data incompletos - limpando dados")
      // Limpar dados quando filtros estão incompletos
    }
  }, [dateFrom, dateTo, empresaFilter, setorFilter])

  // Função para ordenar os dados
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Filtrar e ordenar dados
  const dadosProcessados = useMemo(() => {
    // Filtrar por termo de busca (funcionário ou matrícula)
    const dadosFiltrados = monitoramento.filter((item) => {
      const termoBusca = searchTerm.toLowerCase().trim()
      if (!termoBusca) return true

      const nomeMatch = item.funcionario.toLowerCase().includes(termoBusca)
      const matriculaMatch = item.matricula.toLowerCase().includes(termoBusca)

      return nomeMatch || matriculaMatch
    })

    // Ordenar dados
    dadosFiltrados.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      // Tratar valores string
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
      }
      if (typeof bValue === "string") {
        bValue = bValue.toLowerCase()
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return dadosFiltrados
  }, [monitoramento, searchTerm, sortField, sortDirection])

  // Definir períodos rápidos
  const definirPeriodoRapido = (dias: number) => {
    const hoje = new Date()
    const dataFim = hoje.toISOString().split("T")[0]

    const dataInicio = new Date(hoje)
    dataInicio.setDate(hoje.getDate() - dias)
    const dataInicioStr = dataInicio.toISOString().split("T")[0]

    setDateFrom(dataInicioStr)
    setDateTo(dataFim)
  }

  // Limpar filtros de data
  const limparFiltrosData = () => {
    setDateFrom("")
    setDateTo("")
  }

  // Filtrar centros de custo por empresa selecionada
  const centrosCustoFiltrados = useMemo(() => {
    if (empresaFilter === "all") return centrosCusto

    const empresaId = Number.parseInt(empresaFilter)
    return centrosCusto.filter((cc) => cc.empresa_id === empresaId)
  }, [centrosCusto, empresaFilter])

  // Função para formatar saldo de horas com cor
  const formatarSaldoHoras = (saldo: number) => {
    const saldoFormatado = Math.abs(saldo).toFixed(2)
    if (saldo > 0) {
      return <span className="text-green-600 font-medium">+{saldoFormatado}h</span>
    } else if (saldo < 0) {
      return <span className="text-red-600 font-medium">-{saldoFormatado}h</span>
    } else {
      return <span className="text-gray-500 font-medium">0.00h</span>
    }
  }

  // Verificar se filtros de data estão aplicados
  const filtrosDataAplicados = dateFrom && dateTo
  const filtrosDataIncompletos = (dateFrom && !dateTo) || (!dateFrom && dateTo)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-clockflow-blue">Monitoramento de Horas</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-clockflow-blue">Filtros</CardTitle>
          <CardDescription>
            Selecione o período para analisar as horas trabalhadas pelos funcionários. Os cálculos respeitam a data de
            admissão de cada colaborador.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primeira linha - Filtros principais */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por funcionário ou matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={empresaFilter} onValueChange={setEmpresaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as empresas</SelectItem>
                {empresas.map((empresa) => (
                  <SelectItem key={empresa.id} value={empresa.id.toString()}>
                    {empresa.Estabelecimento}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={setorFilter} onValueChange={setSetorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os setores</SelectItem>
                {centrosCustoFiltrados.map((setor) => (
                  <SelectItem key={setor.id} value={setor.id.toString()}>
                    {setor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Segunda linha - Filtros de data com estilo atualizado */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-[#F9FAFB] border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#24A8C6]" />
              <Label className="text-sm font-medium text-gray-800">Período (Obrigatório):</Label>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="dateFrom" className="text-sm">
                De:
              </Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-auto"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="dateTo" className="text-sm">
                Até:
              </Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-auto"
                required
              />
            </div>

            {/* Botões de período rápido */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => definirPeriodoRapido(7)}>
                7 dias
              </Button>
              <Button variant="outline" size="sm" onClick={() => definirPeriodoRapido(30)}>
                30 dias
              </Button>
              <Button variant="outline" size="sm" onClick={() => definirPeriodoRapido(90)}>
                90 dias
              </Button>
            </div>

            {/* Botão limpar filtros */}
            {(dateFrom || dateTo) && (
              <Button variant="outline" size="sm" onClick={limparFiltrosData}>
                <X className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            )}

            {/* Alerta para filtros incompletos */}
            {filtrosDataIncompletos && (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Preencha ambas as datas para aplicar o filtro</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-clockflow-blue">Monitoramento de Horas</CardTitle>
          <CardDescription>
            {filtrosDataAplicados ? (
              <>
                Análise detalhada das horas trabalhadas no período selecionado (respeitando data de admissão)
                {dadosProcessados.length > 0 && (
                  <span className="ml-2 text-sm font-medium">({dadosProcessados.length} funcionários)</span>
                )}
              </>
            ) : (
              "Selecione um período para visualizar os dados de monitoramento"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!filtrosDataAplicados ? (
            <div className="text-center p-12">
              <AlertCircle className="h-12 w-12 text-[#24A8C6] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Filtros de Data Obrigatórios</h3>
              <p className="text-gray-600 mb-4">
                Para visualizar os dados de monitoramento, é necessário selecionar um período completo (data inicial e
                final).
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Use os botões de período rápido (7, 30, 90 dias) ou selecione datas específicas acima.
              </p>
              <p className="text-xs text-gray-400">
                Os cálculos respeitarão automaticamente a data de admissão de cada funcionário.
              </p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clockflow-blue mx-auto mb-2"></div>
                <p className="text-muted-foreground">Analisando batidas de ponto e calculando horas...</p>
                <p className="text-xs text-gray-400 mt-1">Processando dados baseados na data de admissão</p>
              </div>
            </div>
          ) : dadosProcessados.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-muted-foreground text-lg mb-2">Nenhum registro encontrado para este período</p>
              <p className="text-sm text-gray-500">
                Verifique se existem funcionários ativos com batidas registradas no período selecionado, considerando
                suas datas de admissão.
              </p>
            </div>
          ) : (
            <div className="relative border rounded-md">
              <div className="overflow-auto max-h-[500px]">
                <table className="w-full">
                  <thead className="bg-[#2c3739] sticky top-0 z-10">
                    <tr>
                      <th className="text-left p-3 text-[#FFFFFF]">Foto</th>
                      <th
                        className="text-left p-3 text-[#FFFFFF] cursor-pointer"
                        onClick={() => handleSort("funcionario")}
                      >
                        <div className="flex items-center">
                          Funcionário
                          {sortField === "funcionario" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th className="text-left p-3 text-[#FFFFFF] cursor-pointer" onClick={() => handleSort("empresa")}>
                        <div className="flex items-center">
                          Empresa
                          {sortField === "empresa" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th className="text-left p-3 text-[#FFFFFF] cursor-pointer" onClick={() => handleSort("turno")}>
                        <div className="flex items-center">
                          Turno
                          {sortField === "turno" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th className="text-left p-3 text-[#FFFFFF] cursor-pointer" onClick={() => handleSort("setor")}>
                        <div className="flex items-center">
                          Setor
                          {sortField === "setor" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th className="text-left p-3 text-[#FFFFFF] cursor-pointer" onClick={() => handleSort("horas")}>
                        <div className="flex items-center">
                          Horas
                          {sortField === "horas" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="text-left p-3 text-[#FFFFFF] cursor-pointer"
                        onClick={() => handleSort("horasExtras")}
                      >
                        <div className="flex items-center">
                          Horas Extras
                          {sortField === "horasExtras" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="text-left p-3 text-[#FFFFFF] cursor-pointer"
                        onClick={() => handleSort("horasAtraso")}
                      >
                        <div className="flex items-center">
                          Horas Atraso
                          {sortField === "horasAtraso" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="text-left p-3 text-[#FFFFFF] cursor-pointer"
                        onClick={() => handleSort("horasFalta")}
                      >
                        <div className="flex items-center">
                          Horas Falta
                          {sortField === "horasFalta" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="text-left p-3 text-[#FFFFFF] cursor-pointer"
                        onClick={() => handleSort("horasJustificadas")}
                      >
                        <div className="flex items-center">
                          Horas Justificadas
                          {sortField === "horasJustificadas" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="text-left p-3 text-[#FFFFFF] cursor-pointer"
                        onClick={() => handleSort("saldoHoras")}
                      >
                        <div className="flex items-center">
                          Saldo de Horas
                          {sortField === "saldoHoras" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th className="text-left p-3 text-[#FFFFFF] cursor-pointer" onClick={() => handleSort("status")}>
                        <div className="flex items-center">
                          Status
                          {sortField === "status" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dadosProcessados.map((item) => (
                      <tr key={item.id} className="border-t hover:bg-muted/50">
                        <td className="p-3">
                          <Avatar>
                            <AvatarImage src={item.foto || "/placeholder.svg"} alt={item.funcionario} />
                            <AvatarFallback>{item.funcionario.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{item.funcionario}</div>
                            <div className="text-sm text-muted-foreground">{item.matricula}</div>
                            {item.dataAdmissao && (
                              <div className="text-xs text-gray-400">
                                Admissão: {new Date(item.dataAdmissao).toLocaleDateString("pt-BR")}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">{item.empresa}</td>
                        <td className="p-3">{item.turno}</td>
                        <td className="p-3">{item.setor}</td>
                        <td className="p-3 font-medium">{item.horas.toFixed(2)}h</td>
                        <td className="p-3">
                          {item.horasExtras > 0 ? (
                            <span className="text-green-600 font-medium">+{item.horasExtras.toFixed(2)}h</span>
                          ) : (
                            <span className="text-muted-foreground">0.00h</span>
                          )}
                        </td>
                        <td className="p-3">
                          {item.horasAtraso > 0 ? (
                            <span className="text-red-600 font-medium">{item.horasAtraso.toFixed(2)}h</span>
                          ) : (
                            <span className="text-muted-foreground">0.00h</span>
                          )}
                        </td>
                        <td className="p-3">
                          {item.horasFalta > 0 ? (
                            <span className="text-orange-600 font-medium">{item.horasFalta.toFixed(2)}h</span>
                          ) : (
                            <span className="text-muted-foreground">0.00h</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="text-muted-foreground">{item.horasJustificadas.toFixed(2)}h</span>
                        </td>
                        <td className="p-3">{formatarSaldoHoras(item.saldoHoras)}</td>
                        <td className="p-3">
                          <Badge
                            variant={
                              item.status === "positiva"
                                ? "default"
                                : item.status === "normal"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {item.status === "positiva" ? "Positiva" : item.status === "normal" ? "Normal" : "Negativa"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
