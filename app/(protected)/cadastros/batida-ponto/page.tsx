"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileUp, Pencil, Trash2, ArrowUp, ArrowDown, Search, Calendar, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useBatidasPonto } from "@/hooks/use-batidas-ponto"
import { useEmpresas } from "@/hooks/use-empresas"
import { useCentroCustos } from "@/hooks/use-centro-custos"
import { useFuncionarios } from "@/hooks/use-funcionarios"
import type { BatidaPonto } from "@/lib/supabase"

type SortField = "funcionario" | "centro_custo" | "matricula" | "created_at" | "data"
type SortDirection = "asc" | "desc"

export default function BatidaPontoPage() {
  const {
    batidas,
    loading,
    createBatida,
    updateBatida,
    deleteBatida,
    importarBatidasTXT,
    criarTimestamp,
    extrairHorario,
    extrairData,
    formatarDataBrasilia,
    formatarHorarioBrasilia,
  } = useBatidasPonto()

  // Hooks para dados relacionados
  const { empresas, loading: loadingEmpresas } = useEmpresas()
  const { centrosCusto, loading: loadingCentros } = useCentroCustos()
  const { funcionarios, loading: loadingFuncionarios } = useFuncionarios()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [currentBatida, setCurrentBatida] = useState<BatidaPonto | null>(null)

  // Estados para filtros da página
  const [filtros, setFiltros] = useState({
    empresa: "all",
    centroCusto: "all",
    funcionario: "all",
    dataInicio: "",
    dataFim: "",
  })

  // Estados para o formulário
  const [formData, setFormData] = useState({
    empresa_id: "",
    funcionario_id: "",
    centro_custo_id: "",
    data_base: "",
    B1: "",
    B2: "",
    B3: "",
    B4: "",
    B5: "",
    B6: "",
    B7: "",
    B8: "",
  })

  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [busca, setBusca] = useState("")
  const { toast } = useToast()

  // Filtrar apenas funcionários ativos
  const funcionariosAtivos = useMemo(() => {
    return funcionarios.filter((funcionario) => funcionario.ativo === true)
  }, [funcionarios])

  // Filtros em cascata para a página
  const centrosCustoFiltrados = useMemo(() => {
    if (filtros.empresa === "all") return centrosCusto
    return centrosCusto.filter((centro) => centro.empresa_id.toString() === filtros.empresa)
  }, [centrosCusto, filtros.empresa])

  const funcionariosFiltrados = useMemo(() => {
    if (filtros.empresa === "all" && filtros.centroCusto === "all") return funcionariosAtivos

    return funcionariosAtivos.filter((funcionario) => {
      // Filtrar por empresa (através do centro de custo)
      if (filtros.empresa !== "all") {
        const centroCustoDoFuncionario = centrosCusto.find((c) => c.id === funcionario.centro_custo_id)
        if (!centroCustoDoFuncionario || centroCustoDoFuncionario.empresa_id.toString() !== filtros.empresa) {
          return false
        }
      }

      // Filtrar por centro de custo
      if (filtros.centroCusto !== "all") {
        if (funcionario.centro_custo_id.toString() !== filtros.centroCusto) {
          return false
        }
      }

      return true
    })
  }, [funcionariosAtivos, centrosCusto, filtros.empresa, filtros.centroCusto])

  // Filtros em cascata para o formulário
  const centrosCustoFormulario = useMemo(() => {
    if (!formData.empresa_id) return []
    return centrosCusto.filter((centro) => centro.empresa_id.toString() === formData.empresa_id)
  }, [centrosCusto, formData.empresa_id])

  const funcionariosFormulario = useMemo(() => {
    if (!formData.empresa_id) return []

    return funcionariosAtivos.filter((funcionario) => {
      const centroCustoDoFuncionario = centrosCusto.find((c) => c.id === funcionario.centro_custo_id)
      return centroCustoDoFuncionario && centroCustoDoFuncionario.empresa_id.toString() === formData.empresa_id
    })
  }, [funcionariosAtivos, centrosCusto, formData.empresa_id])

  // Função para extrair data de timestamp para comparação
  const extrairDataParaComparacao = (timestamp: string | null | undefined): string => {
    if (!timestamp) return ""

    try {
      const date = new Date(timestamp)
      // Adicionar 3 horas para corrigir o fuso horário de Brasília
      const brasiliaDate = new Date(date.getTime() + 3 * 60 * 60 * 1000)
      return brasiliaDate.toISOString().split("T")[0] // YYYY-MM-DD
    } catch (error) {
      return ""
    }
  }

  // Filtrar batidas baseado nos filtros e busca
  const batidasFiltradas = useMemo(() => {
    return batidas.filter((batida) => {
      // Filtro por busca
      if (busca) {
        const buscaLower = busca.toLowerCase()
        const funcionarioNome = batida.funcionarios?.nome?.toLowerCase() || ""
        const funcionarioMatricula = batida.funcionarios?.matricula?.toLowerCase() || ""

        if (!funcionarioNome.includes(buscaLower) && !funcionarioMatricula.includes(buscaLower)) {
          return false
        }
      }

      // Filtro por empresa
      if (filtros.empresa !== "all") {
        const centroCustoDaBatida = batida.centro_custos || batida.funcionarios?.centro_custos
        if (!centroCustoDaBatida || centroCustoDaBatida.empresa_id?.toString() !== filtros.empresa) {
          return false
        }
      }

      // Filtro por centro de custo
      if (filtros.centroCusto !== "all") {
        if (batida.centro_custo_id.toString() !== filtros.centroCusto) {
          return false
        }
      }

      // Filtro por funcionário
      if (filtros.funcionario !== "all") {
        if (batida.funcionario_id.toString() !== filtros.funcionario) {
          return false
        }
      }

      // Filtro por data
      if (filtros.dataInicio || filtros.dataFim) {
        // Extrair data da primeira batida disponível
        const dataBatida = extrairDataParaComparacao(
          batida.B1 || batida.B2 || batida.B3 || batida.B4 || batida.B5 || batida.B6 || batida.B7 || batida.B8,
        )

        if (dataBatida) {
          // Filtro por data início
          if (filtros.dataInicio && dataBatida < filtros.dataInicio) {
            return false
          }

          // Filtro por data fim
          if (filtros.dataFim && dataBatida > filtros.dataFim) {
            return false
          }
        }
      }

      return true
    })
  }, [batidas, filtros, busca])

  // Atualizar filtros da página
  const updateFiltro = (campo: string, valor: string) => {
    setFiltros((prev) => {
      const novosFiltros = { ...prev, [campo]: valor }

      // Reset filtros dependentes
      if (campo === "empresa") {
        novosFiltros.centroCusto = "all"
        novosFiltros.funcionario = "all"
      } else if (campo === "centroCusto") {
        novosFiltros.funcionario = "all"
      }

      return novosFiltros
    })
  }

  // Limpar filtros de data
  const limparFiltrosData = () => {
    setFiltros((prev) => ({
      ...prev,
      dataInicio: "",
      dataFim: "",
    }))
  }

  // Definir período rápido
  const definirPeriodoRapido = (dias: number) => {
    const hoje = new Date()
    const dataFim = hoje.toISOString().split("T")[0]

    const dataInicio = new Date(hoje)
    dataInicio.setDate(hoje.getDate() - dias)
    const dataInicioStr = dataInicio.toISOString().split("T")[0]

    setFiltros((prev) => ({
      ...prev,
      dataInicio: dataInicioStr,
      dataFim: dataFim,
    }))
  }

  // Atualizar formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => {
      const novoFormData = { ...prev, [name]: value }

      // Reset campos dependentes
      if (name === "empresa_id") {
        novoFormData.centro_custo_id = ""
        novoFormData.funcionario_id = ""
      } else if (name === "centro_custo_id") {
        novoFormData.funcionario_id = ""
      }

      return novoFormData
    })
  }

  const handleAddBatida = () => {
    setCurrentBatida(null)
    setFormData({
      empresa_id: "",
      funcionario_id: "",
      centro_custo_id: "",
      data_base: new Date().toISOString().split("T")[0],
      B1: "",
      B2: "",
      B3: "",
      B4: "",
      B5: "",
      B6: "",
      B7: "",
      B8: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditBatida = (batida: BatidaPonto) => {
    setCurrentBatida(batida)

    // Extrair data base do primeiro timestamp disponível
    const primeiroTimestamp =
      batida.B1 || batida.B2 || batida.B3 || batida.B4 || batida.B5 || batida.B6 || batida.B7 || batida.B8
    const dataBase = primeiroTimestamp ? extrairData(primeiroTimestamp) : new Date().toISOString().split("T")[0]

    // Encontrar empresa através do centro de custo
    const centroCusto = batida.centro_custos || batida.funcionarios?.centro_custos
    const empresaId = centroCusto?.empresa_id?.toString() || ""

    setFormData({
      empresa_id: empresaId,
      funcionario_id: batida.funcionario_id.toString(),
      centro_custo_id: batida.centro_custo_id.toString(),
      data_base: dataBase,
      B1: extrairHorario(batida.B1),
      B2: extrairHorario(batida.B2),
      B3: extrairHorario(batida.B3),
      B4: extrairHorario(batida.B4),
      B5: extrairHorario(batida.B5),
      B6: extrairHorario(batida.B6),
      B7: extrairHorario(batida.B7),
      B8: extrairHorario(batida.B8),
    })
    setIsDialogOpen(true)
  }

  const handleDeleteBatida = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta batida de ponto?")) {
      await deleteBatida(id)
    }
  }

  const handleImportTXT = () => {
    setImportFile(null)
    setIsImportDialogOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const batidaData = {
        funcionario_id: Number.parseInt(formData.funcionario_id),
        centro_custo_id: Number.parseInt(formData.centro_custo_id),
        B1: formData.B1 ? criarTimestamp(formData.data_base, formData.B1) : null,
        B2: formData.B2 ? criarTimestamp(formData.data_base, formData.B2) : null,
        B3: formData.B3 ? criarTimestamp(formData.data_base, formData.B3) : null,
        B4: formData.B4 ? criarTimestamp(formData.data_base, formData.B4) : null,
        B5: formData.B5 ? criarTimestamp(formData.data_base, formData.B5) : null,
        B6: formData.B6 ? criarTimestamp(formData.data_base, formData.B6) : null,
        B7: formData.B7 ? criarTimestamp(formData.data_base, formData.B7) : null,
        B8: formData.B8 ? criarTimestamp(formData.data_base, formData.B8) : null,
      }

      console.log("Dados do formulário:", formData)
      console.log("Dados para envio:", batidaData)

      if (currentBatida) {
        await updateBatida(currentBatida.id, batidaData)
      } else {
        await createBatida(batidaData)
      }

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Erro ao salvar batida:", error)
    }
  }

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!importFile) {
      toast({
        title: "❌ Erro na importação",
        description: "Nenhum arquivo selecionado.",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)

    try {
      await importarBatidasTXT(importFile)
      setIsImportDialogOpen(false)
    } catch (error) {
      console.error("Erro ao importar arquivo:", error)
    } finally {
      setIsImporting(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const batidasOrdenadas = [...batidasFiltradas].sort((a, b) => {
    let aValue: string | number = ""
    let bValue: string | number = ""

    switch (sortField) {
      case "funcionario":
        aValue = a.funcionarios?.nome || ""
        bValue = b.funcionarios?.nome || ""
        break
      case "matricula":
        aValue = a.funcionarios?.matricula || ""
        bValue = b.funcionarios?.matricula || ""
        break
      case "centro_custo":
        aValue = a.centro_custos?.nome || a.funcionarios?.centro_custos?.nome || ""
        bValue = b.centro_custos?.nome || b.funcionarios?.centro_custos?.nome || ""
        break
      case "data":
        aValue = extrairDataParaComparacao(a.B1 || a.B2 || a.B3 || a.B4 || a.B5 || a.B6 || a.B7 || a.B8)
        bValue = extrairDataParaComparacao(b.B1 || b.B2 || b.B3 || b.B4 || b.B5 || b.B6 || b.B7 || b.B8)
        break
      case "created_at":
        aValue = a.created_at || ""
        bValue = b.created_at || ""
        break
      default:
        aValue = ""
        bValue = ""
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  // Contar registros filtrados
  const totalRegistros = batidasOrdenadas.length
  const totalFuncionarios = new Set(batidasOrdenadas.map((b) => b.funcionario_id)).size

  if (loading || loadingEmpresas || loadingCentros || loadingFuncionarios) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#0C9FAE]">Batida de Ponto</h2>
        </div>

        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="text-[#0C9FAE]">Registros de Batidas de Ponto</CardTitle>
            <CardDescription>
              Registros de batidas de ponto dos funcionários ativos
              {totalRegistros > 0 && (
                <span className="ml-2 text-sm font-medium">
                  ({totalRegistros} registros • {totalFuncionarios} funcionários)
                </span>
              )}
            </CardDescription>

            {/* Filtros em cascata */}
            <div className="space-y-4">
              {/* Primeira linha de filtros */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar funcionário..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <div className="w-[200px]">
                  <Select value={filtros.empresa} onValueChange={(value) => updateFiltro("empresa", value)}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Filtrar por empresa" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">Todas as empresas</SelectItem>
                      {empresas.map((empresa) => (
                        <SelectItem key={empresa.id} value={empresa.id.toString()}>
                          {empresa.Estabelecimento}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-[200px]">
                  <Select value={filtros.centroCusto} onValueChange={(value) => updateFiltro("centroCusto", value)}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Filtrar por centro de custo" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">
                        Todos os centros {filtros.empresa !== "all" && `(${centrosCustoFiltrados.length})`}
                      </SelectItem>
                      {centrosCustoFiltrados.map((centro) => (
                        <SelectItem key={centro.id} value={centro.id.toString()}>
                          {centro.codigo ? `${centro.codigo} - ${centro.nome}` : centro.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-[200px]">
                  <Select value={filtros.funcionario} onValueChange={(value) => updateFiltro("funcionario", value)}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Filtrar por funcionário" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">
                        Funcionários ativos {filtros.empresa !== "all" && `(${funcionariosFiltrados.length})`}
                      </SelectItem>
                      {funcionariosFiltrados.map((funcionario) => (
                        <SelectItem key={funcionario.id} value={funcionario.id.toString()}>
                          {funcionario.matricula} - {funcionario.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Segunda linha - Filtros de data */}
              <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Período:</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="dataInicio" className="text-sm">
                    De:
                  </Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={filtros.dataInicio}
                    onChange={(e) => updateFiltro("dataInicio", e.target.value)}
                    className="w-auto"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="dataFim" className="text-sm">
                    Até:
                  </Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={filtros.dataFim}
                    onChange={(e) => updateFiltro("dataFim", e.target.value)}
                    className="w-auto"
                  />
                </div>

                {/* Botões de período rápido */}
                <div className="flex items-center gap-2 ml-4">
                  <Label className="text-sm text-muted-foreground">Rápido:</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => definirPeriodoRapido(7)}
                    className="text-xs"
                  >
                    7 dias
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => definirPeriodoRapido(30)}
                    className="text-xs"
                  >
                    30 dias
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => definirPeriodoRapido(90)}
                    className="text-xs"
                  >
                    90 dias
                  </Button>
                </div>

                {/* Botão para limpar filtros de data */}
                {(filtros.dataInicio || filtros.dataFim) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={limparFiltrosData}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>

              {/* Terceira linha - Botões de ação */}
              <div className="flex items-center gap-4">
                <Button onClick={handleAddBatida}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Batida
                </Button>

                <Button onClick={handleImportTXT} variant="outline">
                  <FileUp className="mr-2 h-4 w-4" />
                  Importar TXT
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 min-h-0 p-0">
            <div className="relative border rounded-md mx-6 mb-6">
              <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 500px)" }} data-scrollable="true">
                <table className="w-full">
                  <thead className="bg-[#2c3739] sticky top-0 z-10">
                    <tr>
                      <th className="text-left p-3 text-white cursor-pointer" onClick={() => handleSort("funcionario")}>
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
                      <th className="text-left p-3 text-white cursor-pointer" onClick={() => handleSort("matricula")}>
                        <div className="flex items-center">
                          Matrícula
                          {sortField === "matricula" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th className="text-left p-3 text-white cursor-pointer" onClick={() => handleSort("data")}>
                        <div className="flex items-center">
                          Data
                          {sortField === "data" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th className="text-left p-3 text-white">B1</th>
                      <th className="text-left p-3 text-white">B2</th>
                      <th className="text-left p-3 text-white">B3</th>
                      <th className="text-left p-3 text-white">B4</th>
                      <th className="text-left p-3 text-white">B5</th>
                      <th className="text-left p-3 text-white">B6</th>
                      <th className="text-left p-3 text-white">B7</th>
                      <th className="text-left p-3 text-white">B8</th>
                      <th
                        className="text-left p-3 text-white cursor-pointer"
                        onClick={() => handleSort("centro_custo")}
                      >
                        <div className="flex items-center">
                          Centro Custo
                          {sortField === "centro_custo" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th className="text-left p-3 text-white">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batidasOrdenadas.map((batida) => (
                      <tr key={batida.id} className="border-t hover:bg-muted/50">
                        <td className="p-3">{batida.funcionarios?.nome || "-"}</td>
                        <td className="p-3">{batida.funcionarios?.matricula || "-"}</td>
                        <td className="p-3">
                          {formatarDataBrasilia(
                            batida.B1 ||
                              batida.B2 ||
                              batida.B3 ||
                              batida.B4 ||
                              batida.B5 ||
                              batida.B6 ||
                              batida.B7 ||
                              batida.B8,
                          )}
                        </td>
                        <td className="p-3">{formatarHorarioBrasilia(batida.B1)}</td>
                        <td className="p-3">{formatarHorarioBrasilia(batida.B2)}</td>
                        <td className="p-3">{formatarHorarioBrasilia(batida.B3)}</td>
                        <td className="p-3">{formatarHorarioBrasilia(batida.B4)}</td>
                        <td className="p-3">{formatarHorarioBrasilia(batida.B5)}</td>
                        <td className="p-3">{formatarHorarioBrasilia(batida.B6)}</td>
                        <td className="p-3">{formatarHorarioBrasilia(batida.B7)}</td>
                        <td className="p-3">{formatarHorarioBrasilia(batida.B8)}</td>
                        <td className="p-3">
                          {batida.centro_custos?.nome || batida.funcionarios?.centro_custos?.nome || "-"}
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditBatida(batida)}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteBatida(batida.id)}>
                              <Trash2 className="h-4 w-4 text-[#be3e37]" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {batidasOrdenadas.length === 0 && (
                      <tr>
                        <td colSpan={13} className="text-center p-8 text-muted-foreground">
                          {busca ||
                          filtros.empresa !== "all" ||
                          filtros.centroCusto !== "all" ||
                          filtros.funcionario !== "all" ||
                          filtros.dataInicio ||
                          filtros.dataFim
                            ? "Nenhuma batida de ponto encontrada com os filtros aplicados"
                            : "Nenhuma batida de ponto cadastrada"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog para Nova/Editar Batida */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="text-[#0c9abe]">
              {currentBatida ? "Editar Batida de Ponto" : "Nova Batida de Ponto"}
            </DialogTitle>
            <DialogDescription>
              {currentBatida
                ? "Edite as informações da batida de ponto selecionada."
                : "Registre uma nova batida de ponto para um funcionário ativo."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="empresa_id">Empresa</Label>
                  <Select
                    value={formData.empresa_id}
                    onValueChange={(value) => handleSelectChange("empresa_id", value)}
                    required
                  >
                    <SelectTrigger id="empresa_id">
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresas.map((empresa) => (
                        <SelectItem key={empresa.id} value={empresa.id.toString()}>
                          {empresa.Estabelecimento}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_base">Data Base</Label>
                  <Input
                    id="data_base"
                    name="data_base"
                    type="date"
                    value={formData.data_base}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="centro_custo_id">Centro de Custo</Label>
                  <Select
                    value={formData.centro_custo_id}
                    onValueChange={(value) => handleSelectChange("centro_custo_id", value)}
                    required
                    disabled={!formData.empresa_id}
                  >
                    <SelectTrigger id="centro_custo_id">
                      <SelectValue
                        placeholder={
                          formData.empresa_id ? "Selecione o centro de custo" : "Selecione uma empresa primeiro"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {centrosCustoFormulario.map((centro) => (
                        <SelectItem key={centro.id} value={centro.id.toString()}>
                          {centro.codigo ? `${centro.codigo} - ${centro.nome}` : centro.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="funcionario_id">Funcionário Ativo</Label>
                  <Select
                    value={formData.funcionario_id}
                    onValueChange={(value) => handleSelectChange("funcionario_id", value)}
                    required
                    disabled={!formData.empresa_id}
                  >
                    <SelectTrigger id="funcionario_id">
                      <SelectValue
                        placeholder={formData.empresa_id ? "Selecione o funcionário" : "Selecione uma empresa primeiro"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {funcionariosFormulario.map((funcionario) => (
                        <SelectItem key={funcionario.id} value={funcionario.id.toString()}>
                          {funcionario.matricula} - {funcionario.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Horários das Batidas (Opcional)</Label>
                <div className="grid grid-cols-4 gap-4 mt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <div key={num} className="space-y-2">
                      <Label htmlFor={`B${num}`}>B{num}</Label>
                      <Input
                        id={`B${num}`}
                        name={`B${num}`}
                        type="time"
                        value={formData[`B${num}` as keyof typeof formData]}
                        onChange={handleInputChange}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ✅ Não é necessário preencher todas as batidas. Os horários serão salvos exatamente como digitados e
                  exibidos no horário de Brasília.
                </p>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <Button type="button" onClick={() => setIsDialogOpen(false)} className="bg-[#be3e37] hover:bg-[#a83530]">
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Importar TXT */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#0c9abe]">Importar Arquivo TXT</DialogTitle>
            <DialogDescription>Selecione um arquivo TXT para importar as batidas de ponto.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleImportSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="txt-file">Arquivo TXT</Label>
                <div className="flex items-center gap-2">
                  <Input id="txt-file" type="file" accept=".txt" onChange={handleFileChange} required />
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>O arquivo TXT deve conter as seguintes informações:</p>
                <ul className="list-disc pl-4 mt-2">
                  <li>Período (formato: Período: DD/MM/AAAA a DD/MM/AAAA)</li>
                  <li>Matrícula do funcionário (ex: 1038)</li>
                  <li>Nome do funcionário</li>
                  <li>Localização/Centro de custo</li>
                  <li>Marcações de ponto (formato: HH:MMR)</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isImporting}>
                <FileUp className="mr-2 h-4 w-4" />
                {isImporting ? "Importando..." : "Importar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
