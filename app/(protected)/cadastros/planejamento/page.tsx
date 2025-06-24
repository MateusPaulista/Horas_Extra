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
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, AlertTriangle, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format, startOfMonth, endOfMonth, getDaysInMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useEmpresas } from "@/hooks/use-empresas"
import { useFuncionarios } from "@/hooks/use-funcionarios"
import { useTurnos } from "@/hooks/use-turnos"
import { usePlanejamento, type Planejamento } from "@/hooks/use-planejamento"

type SortField = "id" | "empresa_nome" | "dias_uteis" | "data_inicio" | "data_fim" | "status"
type SortDirection = "asc" | "desc"

export default function PlanejamentoPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentPlanejamento, setCurrentPlanejamento] = useState<Planejamento | null>(null)
  const [formData, setFormData] = useState({
    empresa_id: 0,
    mes_ano: "",
    dias_uteis: 0,
    descricao: "",
    status: "ativo", // Valor padrão mais simples
    data_inicio: new Date(),
    data_fim: new Date(),
  })
  const [sortField, setSortField] = useState<SortField>("data_inicio")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [buscaPlanejamento, setBuscaPlanejamento] = useState("")
  const [showResumo, setShowResumo] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Adicionar novos estados para controle de conflitos
  const [showConflictDialog, setShowConflictDialog] = useState(false)
  const [conflictingPlanejamentos, setConflictingPlanejamentos] = useState<Planejamento[]>([])
  const [pendingSubmitData, setPendingSubmitData] = useState<any>(null)

  const { toast } = useToast()

  // Hooks para buscar dados
  const { empresas, loading: loadingEmpresas } = useEmpresas()
  const { funcionarios, loading: loadingFuncionarios } = useFuncionarios()
  const { turnos, loading: loadingTurnos } = useTurnos()
  const {
    planejamentos,
    loading: loadingPlanejamentos,
    error: errorPlanejamentos,
    tableExists,
    statusOptions,
    validInactiveStatus,
    createPlanejamento,
    updatePlanejamento,
    deletePlanejamento,
    checkPlanejamentoConflito,
    inativarPlanejamentosConflitantes,
  } = usePlanejamento()

  // Função para converter tempo HH:MM para minutos
  const timeToMinutes = (timeString: string): number => {
    if (!timeString) return 0
    const [hours, minutes] = timeString.split(":").map(Number)
    return hours * 60 + minutes
  }

  // Função para converter minutos para horas decimais
  const minutesToHours = (minutes: number): number => {
    return minutes / 60
  }

  // Função para calcular resumo por turno
  const calcularResumoPorTurno = useMemo(() => {
    if (!formData.empresa_id || !formData.dias_uteis || loadingFuncionarios || loadingTurnos) {
      return []
    }

    // Filtrar funcionários ativos da empresa selecionada
    const funcionariosAtivos = funcionarios.filter((func) => {
      const empresaId = func.centro_custos?.empresas?.id || func.centro_custos?.empresa_id
      return func.ativo === true && empresaId === formData.empresa_id
    })

    // Agrupar por turno
    const resumoPorTurno = new Map()

    funcionariosAtivos.forEach((funcionario) => {
      const turno = turnos.find((t) => t.id === funcionario.turno_id)

      if (turno) {
        const turnoId = turno.id

        if (!resumoPorTurno.has(turnoId)) {
          // Calcular horas do turno
          const inicioMinutos = timeToMinutes(turno.hora_inicio)
          const fimMinutos = timeToMinutes(turno.hora_fim)
          let duracaoMinutos = fimMinutos - inicioMinutos

          if (duracaoMinutos < 0) {
            duracaoMinutos = 24 * 60 + duracaoMinutos
          }

          let tempoRefeicaoMinutos = 0
          if (typeof turno.tempo_refeicao === "string") {
            tempoRefeicaoMinutos = timeToMinutes(turno.tempo_refeicao)
          } else if (typeof turno.tempo_refeicao === "number") {
            tempoRefeicaoMinutos = turno.tempo_refeicao
          }

          const horasTrabalhoMinutos = duracaoMinutos - tempoRefeicaoMinutos
          const horasTrabalho = minutesToHours(horasTrabalhoMinutos)

          resumoPorTurno.set(turnoId, {
            turno: turno,
            funcionarios: [],
            horasPorDia: horasTrabalho,
            totalHoras: 0,
          })
        }

        const resumoTurno = resumoPorTurno.get(turnoId)
        resumoTurno.funcionarios.push(funcionario)
        resumoTurno.totalHoras = resumoTurno.horasPorDia * formData.dias_uteis * resumoTurno.funcionarios.length
      }
    })

    return Array.from(resumoPorTurno.values()).sort((a, b) => a.turno.nome.localeCompare(b.turno.nome))
  }, [formData.empresa_id, formData.dias_uteis, funcionarios, turnos, loadingFuncionarios, loadingTurnos])

  // Função para calcular dias úteis automaticamente baseado no mês/ano
  const calcularDiasUteis = (mesAno: string): number => {
    if (!mesAno) return 22 // Valor padrão

    try {
      const [ano, mes] = mesAno.split("-").map(Number)
      const diasNoMes = getDaysInMonth(new Date(ano, mes - 1))

      // Estimativa simples: assumir ~22 dias úteis por mês (pode ser refinado)
      // Para uma implementação mais precisa, você poderia calcular os dias úteis reais
      const diasUteis = Math.round(diasNoMes * 0.71) // ~71% dos dias são úteis
      return Math.max(diasUteis, 20) // Mínimo de 20 dias úteis
    } catch {
      return 22
    }
  }

  // Função para atualizar datas baseado no mês/ano selecionado
  const atualizarDatasDoMes = (mesAno: string) => {
    if (!mesAno) return

    try {
      const [ano, mes] = mesAno.split("-").map(Number)
      const dataInicio = startOfMonth(new Date(ano, mes - 1))
      const dataFim = endOfMonth(new Date(ano, mes - 1))
      const diasUteis = calcularDiasUteis(mesAno)

      setFormData((prev) => ({
        ...prev,
        data_inicio: dataInicio,
        data_fim: dataFim,
        dias_uteis: diasUteis,
      }))
    } catch (error) {
      console.error("Erro ao calcular datas:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "mes_ano") {
      setFormData((prev) => ({ ...prev, [name]: value }))
      atualizarDatasDoMes(value)
    } else if (name === "dias_uteis") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === "empresa_id" ? Number(value) : value,
    }))
  }

  const handleAddPlanejamento = () => {
    setCurrentPlanejamento(null)
    const mesAtual = new Date().toISOString().substring(0, 7)
    setFormData({
      empresa_id: 0,
      mes_ano: mesAtual,
      dias_uteis: calcularDiasUteis(mesAtual),
      descricao: "",
      status: statusOptions.length > 0 ? statusOptions[0] : "ativo", // Usar primeiro status disponível
      data_inicio: startOfMonth(new Date()),
      data_fim: endOfMonth(new Date()),
    })
    setIsDialogOpen(true)
  }

  const handleEditPlanejamento = (planejamento: Planejamento) => {
    setCurrentPlanejamento(planejamento)

    // Extrair mês/ano da data de início
    const dataInicio = new Date(planejamento.data_inicio)
    const mesAno = `${dataInicio.getFullYear()}-${String(dataInicio.getMonth() + 1).padStart(2, "0")}`

    setFormData({
      empresa_id: planejamento.empresa_id || 0,
      mes_ano: mesAno,
      dias_uteis: planejamento.dias_uteis || 0,
      descricao: planejamento.descricao || "",
      status: planejamento.status || (statusOptions.length > 0 ? statusOptions[0] : "ativo"),
      data_inicio: new Date(planejamento.data_inicio),
      data_fim: new Date(planejamento.data_fim),
    })
    setIsDialogOpen(true)
  }

  const handleDeletePlanejamento = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este planejamento?")) {
      await deletePlanejamento(id)
    }
  }

  // Atualizar a função handleSubmit para verificar conflitos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return

    // Validações
    const empresa_id = Number(formData.empresa_id)
    const dias_uteis = Number(formData.dias_uteis)
    const descricao = formData.descricao.trim()
    const status = formData.status

    if (!empresa_id) {
      toast({
        title: "❌ Erro de validação",
        description: "Empresa é obrigatória",
        variant: "destructive",
      })
      return
    }

    if (!formData.mes_ano) {
      toast({
        title: "❌ Erro de validação",
        description: "Mês/Ano é obrigatório",
        variant: "destructive",
      })
      return
    }

    if (dias_uteis <= 0) {
      toast({
        title: "❌ Erro de validação",
        description: "Dias úteis deve ser maior que zero",
        variant: "destructive",
      })
      return
    }

    if (!descricao) {
      toast({
        title: "❌ Erro de validação",
        description: "Descrição é obrigatória",
        variant: "destructive",
      })
      return
    }

    if (!status) {
      toast({
        title: "❌ Erro de validação",
        description: "Status é obrigatório",
        variant: "destructive",
      })
      return
    }

    const planejamentoData = {
      empresa_id,
      dias_uteis,
      descricao,
      status,
      data_inicio: format(formData.data_inicio, "yyyy-MM-dd"),
      data_fim: format(formData.data_fim, "yyyy-MM-dd"),
    }

    // Verificar conflitos apenas se o status for "ativo"
    if (
      status === "ativo" ||
      status
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_") === "ativo"
    ) {
      const { hasConflict, conflictingPlanejamentos: conflitos } = await checkPlanejamentoConflito(
        empresa_id,
        planejamentoData.data_inicio,
        planejamentoData.data_fim,
        "ativo",
        currentPlanejamento?.id, // Excluir o atual se estiver editando
      )

      if (hasConflict && conflitos.length > 0) {
        // Mostrar dialog de conflito
        setConflictingPlanejamentos(conflitos)
        setPendingSubmitData(planejamentoData)
        setShowConflictDialog(true)
        return
      }
    }

    // Se não há conflitos, prosseguir normalmente
    await submitPlanejamento(planejamentoData, false)
  }

  // Nova função para submeter o planejamento
  const submitPlanejamento = async (planejamentoData: any, inativarConflitantes: boolean) => {
    setIsSubmitting(true)

    try {
      let success = false

      if (currentPlanejamento) {
        // Editar planejamento existente
        success = await updatePlanejamento(currentPlanejamento.id, planejamentoData, inativarConflitantes)
      } else {
        // Criar novo planejamento
        success = await createPlanejamento(planejamentoData, inativarConflitantes)
      }

      if (success) {
        setIsDialogOpen(false)
        setShowConflictDialog(false)
        setPendingSubmitData(null)
        setConflictingPlanejamentos([])
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para confirmar e inativar conflitos
  const handleConfirmInativarConflitos = async () => {
    if (pendingSubmitData) {
      await submitPlanejamento(pendingSubmitData, true)
    }
  }

  // Função para cancelar e manter conflitos
  const handleCancelConflict = () => {
    setShowConflictDialog(false)
    setPendingSubmitData(null)
    setConflictingPlanejamentos([])
  }

  // Função para ordenar os planejamentos
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Filter planejamentos by date range
  const planejamentosFiltrados = planejamentos.filter((planejamento) => {
    return (
      planejamento.descricao.toLowerCase().includes(buscaPlanejamento.toLowerCase()) ||
      planejamento.empresa_nome?.toLowerCase().includes(buscaPlanejamento.toLowerCase())
    )
  })

  // Ordenar os planejamentos filtrados
  const planejamentosOrdenados = [...planejamentosFiltrados].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]

    // Tratar valores especiais
    if (sortField === "empresa_nome") {
      aValue = a.empresa_nome || ""
      bValue = b.empresa_nome || ""
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  // Formatar período para exibição
  const formatarPeriodo = (dataInicio: string, dataFim: string) => {
    try {
      const inicio = new Date(dataInicio)
      const fim = new Date(dataFim)

      if (inicio.getMonth() === fim.getMonth() && inicio.getFullYear() === fim.getFullYear()) {
        // Mesmo mês
        const meses = [
          "Janeiro",
          "Fevereiro",
          "Março",
          "Abril",
          "Maio",
          "Junho",
          "Julho",
          "Agosto",
          "Setembro",
          "Outubro",
          "Novembro",
          "Dezembro",
        ]
        return `${meses[inicio.getMonth()]} de ${inicio.getFullYear()}`
      } else {
        // Período diferente
        return `${format(inicio, "dd/MM/yyyy", { locale: ptBR })} - ${format(fim, "dd/MM/yyyy", { locale: ptBR })}`
      }
    } catch {
      return "Período inválido"
    }
  }

  // Função para formatar status para exibição
  const formatarStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Se a tabela não existe, mostrar aviso
  if (tableExists === false) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-clockflow-blue">Planejamento</h2>
        </div>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Tabela não encontrada
            </CardTitle>
            <CardDescription className="text-orange-600">
              A tabela 'planejamentos' não existe no banco de dados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-orange-700">
                Para usar esta funcionalidade, você precisa criar a tabela no Supabase.
              </p>
              <div className="bg-orange-100 p-4 rounded-lg">
                <p className="text-sm font-medium text-orange-800 mb-2">Estrutura esperada:</p>
                <ul className="text-sm text-orange-700 space-y-1 list-disc list-inside">
                  <li>id (primary key)</li>
                  <li>empresa_id (foreign key para empresas)</li>
                  <li>dias_uteis (integer)</li>
                  <li>descricao (text)</li>
                  <li>data_inicio (date)</li>
                  <li>data_fim (date)</li>
                  <li>status (text com constraint)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loadingPlanejamentos) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-clockflow-blue">Planejamento</h2>
          <Button disabled className="bg-clockflow-blue hover:bg-clockflow-blue/90">
            <Plus className="mr-2 h-4 w-4" />
            Novo Planejamento
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-clockflow-blue">Lista de Planejamentos</CardTitle>
            <CardDescription>Carregando planejamentos...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clockflow-blue"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (errorPlanejamentos) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-clockflow-blue">Planejamento</h2>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Erro ao carregar dados
            </CardTitle>
            <CardDescription className="text-red-600">{errorPlanejamentos}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-100 p-4 rounded-lg">
              <p className="text-sm font-medium text-red-800 mb-2">Para resolver:</p>
              <ol className="text-sm text-red-700 space-y-1 list-decimal list-inside">
                <li>Execute o script "check-planejamentos-constraints.sql"</li>
                <li>Verifique quais valores são aceitos para o campo status</li>
                <li>Abra o console do navegador para ver logs detalhados</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-clockflow-blue">Planejamento</h2>
        <Button onClick={handleAddPlanejamento} className="bg-clockflow-blue hover:bg-clockflow-blue/90">
          <Plus className="mr-2 h-4 w-4" />
          Novo Planejamento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-clockflow-blue">Lista de Planejamentos</CardTitle>
          <CardDescription>Gerencie os planejamentos mensais por empresa</CardDescription>
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <Label>Buscar Planejamento</Label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por descrição ou empresa..."
                  value={buscaPlanejamento}
                  onChange={(e) => setBuscaPlanejamento(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {planejamentosOrdenados.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum planejamento encontrado</p>
              <p className="text-sm text-muted-foreground mt-2">
                Clique em "Novo Planejamento" para criar o primeiro planejamento
              </p>
            </div>
          ) : (
            <div className="relative border rounded-md">
              <div className="overflow-auto max-h-[400px]">
                <table className="w-full">
                  <thead className="bg-[#2c3739] sticky top-0 z-10">
                    <tr>
                      <th
                        className="text-left p-3 text-white cursor-pointer"
                        onClick={() => handleSort("empresa_nome")}
                      >
                        <div className="flex items-center">
                          Empresa
                          {sortField === "empresa_nome" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th className="text-left p-3 text-white cursor-pointer" onClick={() => handleSort("data_inicio")}>
                        <div className="flex items-center">
                          Período
                          {sortField === "data_inicio" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th className="text-left p-3 text-white cursor-pointer" onClick={() => handleSort("dias_uteis")}>
                        <div className="flex items-center">
                          Dias Úteis
                          {sortField === "dias_uteis" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th className="text-left p-3 text-white">Descrição</th>
                      <th className="text-left p-3 text-white cursor-pointer" onClick={() => handleSort("status")}>
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
                      <th className="w-[100px] text-left p-3 text-white">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planejamentosOrdenados.map((planejamento) => (
                      <tr key={planejamento.id} className="border-t hover:bg-muted/50">
                        <td className="p-3 font-medium text-clockflow-blue">{planejamento.empresa_nome}</td>
                        <td className="p-3">{formatarPeriodo(planejamento.data_inicio, planejamento.data_fim)}</td>
                        <td className="p-3">{planejamento.dias_uteis}</td>
                        <td className="p-3 max-w-xs truncate" title={planejamento.descricao}>
                          {planejamento.descricao}
                        </td>
                        <td className="p-3">
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              planejamento.status === "ativo"
                                ? "bg-green-100 text-green-800"
                                : planejamento.status === "inativo"
                                  ? "bg-red-100 text-red-800"
                                  : planejamento.status === "planejado"
                                    ? "bg-blue-100 text-blue-800"
                                    : planejamento.status === "concluido"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-gray-100 text-gray-800",
                            )}
                          >
                            {formatarStatus(planejamento.status)}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditPlanejamento(planejamento)}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePlanejamento(planejamento.id)}
                            >
                              <Trash2 className="h-4 w-4 text-[#be3e37]" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
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

      {/* Dialog de Conflitos */}
      <Dialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-clockflow-blue flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Conflito de Planejamento
            </DialogTitle>
            <DialogDescription>
              Já existe(m) planejamento(s) ativo(s) para esta empresa no mesmo período.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">Planejamentos Conflitantes:</h4>
              <div className="space-y-2">
                {conflictingPlanejamentos.map((planejamento) => (
                  <div key={planejamento.id} className="text-sm text-orange-700 bg-white p-2 rounded border">
                    <div className="font-medium">{planejamento.empresa_nome}</div>
                    <div>{formatarPeriodo(planejamento.data_inicio, planejamento.data_fim)}</div>
                    <div className="text-xs text-orange-600">{planejamento.descricao}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Regra de Negócio:</h4>
              <p className="text-sm text-blue-700">
                Apenas um planejamento pode estar ativo por empresa em cada mês/ano.
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Opções:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>
                  • <strong>Cancelar:</strong> Manter os planejamentos existentes como estão
                </li>
                <li>
                  • <strong>Inativar Conflitos:</strong> Marcar os planejamentos conflitantes como "
                  {formatarStatus(validInactiveStatus)}" e continuar
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelConflict} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmInativarConflitos}
              disabled={isSubmitting}
              className="bg-clockflow-blue hover:bg-clockflow-blue/90"
            >
              {isSubmitting ? "Processando..." : "Inativar Conflitos e Continuar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog principal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-clockflow-blue">
              {currentPlanejamento ? "Editar Planejamento" : "Novo Planejamento"}
            </DialogTitle>
            <DialogDescription>
              {currentPlanejamento
                ? "Edite as informações do planejamento"
                : "Preencha as informações para criar um novo planejamento"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="empresa_id">
                  Empresa <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.empresa_id.toString()}
                  onValueChange={(value) => handleSelectChange("empresa_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingEmpresas ? (
                      <SelectItem value="loading" disabled>
                        Carregando empresas...
                      </SelectItem>
                    ) : (
                      empresas.map((empresa) => (
                        <SelectItem key={empresa.id} value={empresa.id.toString()}>
                          {empresa.Estabelecimento}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mes_ano">
                  Mês/Ano <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mes_ano"
                  name="mes_ano"
                  type="month"
                  value={formData.mes_ano}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dias_uteis">
                  Dias Úteis <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dias_uteis"
                  name="dias_uteis"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dias_uteis}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.length > 0 ? (
                      statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {formatarStatus(status)}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                        <SelectItem value="planejado">Planejado</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">
                Descrição <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                placeholder="Descreva o planejamento..."
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Início</Label>
                <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                  {format(formData.data_inicio, "dd/MM/yyyy", { locale: ptBR })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Data de Fim</Label>
                <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                  {format(formData.data_fim, "dd/MM/yyyy", { locale: ptBR })}
                </div>
              </div>
            </div>

            {/* Botão para mostrar/ocultar resumo */}
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowResumo(!showResumo)}
                disabled={!formData.empresa_id || formData.dias_uteis <= 0}
              >
                {showResumo ? "Ocultar Resumo" : "Mostrar Resumo por Turno"}
              </Button>
            </div>

            {/* Resumo por turno */}
            {showResumo && calcularResumoPorTurno.length > 0 && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-700">Resumo por Turno</CardTitle>
                  <CardDescription className="text-blue-600">
                    Distribuição de funcionários e horas planejadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-60 overflow-y-auto space-y-3">
                    {calcularResumoPorTurno.map((resumo) => (
                      <div key={resumo.turno.id} className="bg-white p-3 rounded border">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-blue-800">{resumo.turno.nome}</h4>
                            <p className="text-sm text-blue-600">
                              {resumo.turno.hora_inicio} - {resumo.turno.hora_fim}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-blue-800">
                              {resumo.funcionarios.length} funcionário(s)
                            </div>
                            <div className="text-xs text-blue-600">
                              {resumo.horasPorDia.toFixed(1)}h/dia × {formData.dias_uteis} dias
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-800">
                            {resumo.totalHoras.toFixed(0)} horas totais
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-800">Total Geral:</span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-800">
                          {calcularResumoPorTurno.reduce((total, resumo) => total + resumo.totalHoras, 0).toFixed(0)}{" "}
                          horas
                        </div>
                        <div className="text-sm text-blue-600">
                          {calcularResumoPorTurno.reduce((total, resumo) => total + resumo.funcionarios.length, 0)}{" "}
                          funcionários ativos
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-clockflow-blue hover:bg-clockflow-blue/90" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : currentPlanejamento ? "Atualizar Planejamento" : "Criar Planejamento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
