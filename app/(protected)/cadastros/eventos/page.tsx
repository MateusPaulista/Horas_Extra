"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { FiltrosCascata } from "@/components/ui/filtros-cascata"
import { useEventos } from "@/hooks/use-eventos"
import { useFiltrosCascata } from "@/hooks/use-filtros-cascata"
import { Plus, Download, Edit, Trash2, Calendar, Users } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

const descricoesEvento = [
  "Pagamento de Ponte",
  "Sábado de Hora Extra",
  "Ponte",
  "Feriado",
  "Feriado Hora Extra",
  "Abono de Horas",
]

const tiposHoras = [
  { value: "1", label: "Gerar como Extra" },
  { value: "2", label: "Considerar como Dia Útil (sem extra)" },
]

export default function EventosPage() {
  const { eventos, loading, createEventosMultiplos, updateEvento, deleteEvento } = useEventos()
  const { filtros, opcoesFiltradas, updateFiltro } = useFiltrosCascata()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [busca, setBusca] = useState("")

  const [formData, setFormData] = useState({
    empresa_id: "",
    centro_custo_id: "",
    data_evento: "",
    descricao: "",
    qtd_horas: "",
    tipo_horas: "1",
    funcionarios_selecionados: [] as number[],
  })

  // Garantir que os dados existam
  const eventosDisponiveis = Array.isArray(eventos) ? eventos : []
  const empresasDisponiveis = opcoesFiltradas?.empresas || []
  const centrosCustoDisponiveis = opcoesFiltradas?.centrosCusto || []
  const funcionariosDisponiveis = opcoesFiltradas?.funcionarios || []

  // Funcionários do setor selecionado para seleção múltipla
  const funcionariosDoSetor = funcionariosDisponiveis.filter(
    (func) =>
      func.empresa_id &&
      func.centro_custo_id &&
      func.empresa_id.toString() === formData.empresa_id &&
      func.centro_custo_id.toString() === formData.centro_custo_id,
  )

  // Filtrar dados
  const dadosFiltrados = eventosDisponiveis.filter((item) => {
    const matchEmpresa =
      filtros.empresa === "all" || (item.empresa_id && item.empresa_id.toString() === filtros.empresa)
    const matchCentro =
      filtros.centroCusto === "all" || (item.centro_custo_id && item.centro_custo_id.toString() === filtros.centroCusto)
    const matchFuncionario =
      filtros.funcionario === "all" || (item.id_funcionario && item.id_funcionario.toString() === filtros.funcionario)
    const matchBusca =
      !busca ||
      (item.descricao && item.descricao.toLowerCase().includes(busca.toLowerCase())) ||
      (item.funcionarios?.nome && item.funcionarios.nome.toLowerCase().includes(busca.toLowerCase())) ||
      (item.funcionarios?.matricula && item.funcionarios.matricula.toLowerCase().includes(busca.toLowerCase()))

    let matchPeriodo = true
    if (filtros.dataInicio && filtros.dataFim && item.data_evento) {
      const dataEvento = new Date(item.data_evento)
      matchPeriodo = dataEvento >= filtros.dataInicio && dataEvento <= filtros.dataFim
    }

    return matchEmpresa && matchCentro && matchFuncionario && matchBusca && matchPeriodo
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.empresa_id || !formData.centro_custo_id || !formData.data_evento || !formData.descricao) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    if (!formData.qtd_horas || Number.parseFloat(formData.qtd_horas) <= 0) {
      toast.error("Informe uma quantidade válida de horas")
      return
    }

    if (formData.funcionarios_selecionados.length === 0) {
      toast.error("Selecione pelo menos um funcionário")
      return
    }

    try {
      // Criar um evento para cada funcionário selecionado
      const eventosParaCriar = formData.funcionarios_selecionados.map((funcionarioId) => ({
        empresa_id: Number.parseInt(formData.empresa_id),
        centro_custo_id: Number.parseInt(formData.centro_custo_id),
        id_funcionario: funcionarioId,
        data_evento: formData.data_evento,
        descricao: formData.descricao,
        qtd_horas: Number.parseFloat(formData.qtd_horas),
        tipo_horas: Number.parseInt(formData.tipo_horas),
      }))

      if (editingItem) {
        // Para edição, atualizar apenas um registro
        await updateEvento(editingItem.id, {
          empresa_id: Number.parseInt(formData.empresa_id),
          centro_custo_id: Number.parseInt(formData.centro_custo_id),
          id_funcionario: formData.funcionarios_selecionados[0],
          data_evento: formData.data_evento,
          descricao: formData.descricao,
          qtd_horas: Number.parseFloat(formData.qtd_horas),
          tipo_horas: Number.parseInt(formData.tipo_horas),
        })
      } else {
        // Para criação, criar múltiplos eventos
        await createEventosMultiplos(eventosParaCriar)
      }

      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Erro ao salvar:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      empresa_id: "",
      centro_custo_id: "",
      data_evento: "",
      descricao: "",
      qtd_horas: "",
      tipo_horas: "1",
      funcionarios_selecionados: [],
    })
    setEditingItem(null)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      empresa_id: item.empresa_id ? item.empresa_id.toString() : "",
      centro_custo_id: item.centro_custo_id ? item.centro_custo_id.toString() : "",
      data_evento: item.data_evento || "",
      descricao: item.descricao || "",
      qtd_horas: item.qtd_horas ? item.qtd_horas.toString() : "",
      tipo_horas: item.tipo_horas ? item.tipo_horas.toString() : "1",
      funcionarios_selecionados: item.id_funcionario ? [item.id_funcionario] : [],
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja remover este evento?")) {
      await deleteEvento(id)
    }
  }

  const handleFuncionarioToggle = (funcionarioId: number, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        funcionarios_selecionados: [...formData.funcionarios_selecionados, funcionarioId],
      })
    } else {
      setFormData({
        ...formData,
        funcionarios_selecionados: formData.funcionarios_selecionados.filter((id) => id !== funcionarioId),
      })
    }
  }

  const exportData = () => {
    const csvContent = [
      ["Data", "Descrição", "Empresa", "Setor", "Funcionário", "Matrícula", "Horas", "Tipo"].join(","),
      ...dadosFiltrados.map((item) =>
        [
          item.data_evento ? format(new Date(item.data_evento), "dd/MM/yyyy") : "",
          item.descricao || "",
          item.empresas?.Estabelecimento || "",
          item.centro_custos?.nome || "",
          item.funcionarios?.nome || "",
          item.funcionarios?.matricula || "",
          item.qtd_horas || "",
          item.tipo_horas === 1 ? "Extra" : "Dia Útil",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `eventos_${format(new Date(), "dd-MM-yyyy")}.csv`
    link.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0c9abe]">Eventos</h2>
          <p className="text-gray-600">Registre eventos especiais e horas extras para funcionários</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportData} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="gap-2 bg-[#0c9abe] hover:bg-[#0c9abe]/90">
                <Plus className="h-4 w-4" />
                Novo Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-[#0c9abe]">
                  <Calendar className="h-5 w-5" />
                  {editingItem ? "Editar Evento" : "Novo Evento"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="empresa">Empresa *</Label>
                    <Select
                      value={formData.empresa_id}
                      onValueChange={(value) => {
                        setFormData({
                          ...formData,
                          empresa_id: value,
                          centro_custo_id: "",
                          funcionarios_selecionados: [],
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {empresasDisponiveis.map((empresa) => (
                          <SelectItem key={empresa.id} value={empresa.id.toString()}>
                            {empresa.Estabelecimento}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="centro_custo">Centro de Custo (Setor) *</Label>
                    <Select
                      value={formData.centro_custo_id}
                      onValueChange={(value) => {
                        setFormData({ ...formData, centro_custo_id: value, funcionarios_selecionados: [] })
                      }}
                      disabled={!formData.empresa_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o setor" />
                      </SelectTrigger>
                      <SelectContent>
                        {centrosCustoDisponiveis
                          .filter((cc) => cc.empresa_id && cc.empresa_id.toString() === formData.empresa_id)
                          .map((centro) => (
                            <SelectItem key={centro.id} value={centro.id.toString()}>
                              {centro.nome}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data_evento">Data do Evento *</Label>
                    <Input
                      type="date"
                      value={formData.data_evento}
                      onChange={(e) => setFormData({ ...formData, data_evento: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qtd_horas">Quantidade de Horas *</Label>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.qtd_horas}
                      onChange={(e) => setFormData({ ...formData, qtd_horas: e.target.value })}
                      placeholder="Ex: 8, 4, 2.5..."
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição do Evento *</Label>
                  <Select
                    value={formData.descricao}
                    onValueChange={(value) => setFormData({ ...formData, descricao: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a descrição do evento" />
                    </SelectTrigger>
                    <SelectContent>
                      {descricoesEvento.map((desc) => (
                        <SelectItem key={desc} value={desc}>
                          {desc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Tipo de Horas *</Label>
                  <RadioGroup
                    value={formData.tipo_horas}
                    onValueChange={(value) => setFormData({ ...formData, tipo_horas: value })}
                    className="flex flex-col space-y-2"
                  >
                    {tiposHoras.map((tipo) => (
                      <div key={tipo.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={tipo.value} id={`tipo-${tipo.value}`} />
                        <Label htmlFor={`tipo-${tipo.value}`} className="cursor-pointer">
                          {tipo.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {formData.centro_custo_id && (
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Selecionar Funcionários Participantes *
                    </Label>
                    <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                      {funcionariosDoSetor.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Nenhum funcionário encontrado neste setor</p>
                      ) : (
                        <div className="space-y-2">
                          {funcionariosDoSetor.map((funcionario) => (
                            <div key={funcionario.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`func-${funcionario.id}`}
                                checked={formData.funcionarios_selecionados.includes(funcionario.id)}
                                onCheckedChange={(checked) =>
                                  handleFuncionarioToggle(funcionario.id, checked as boolean)
                                }
                              />
                              <Label htmlFor={`func-${funcionario.id}`} className="cursor-pointer flex-1">
                                <span className="font-medium">{funcionario.matricula}</span> - {funcionario.nome}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {formData.funcionarios_selecionados.length} funcionário(s) selecionado(s)
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-[#0c9abe] hover:bg-[#0c9abe]/90">
                    {editingItem ? "Atualizar" : "Salvar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#0c9abe]">Filtros</CardTitle>
          <CardDescription>Use os filtros para encontrar eventos específicos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FiltrosCascata
              filtros={filtros}
              opcoesFiltradas={opcoesFiltradas}
              updateFiltro={updateFiltro}
              mostrarFuncionario={true}
              mostrarDataInicio={true}
              mostrarDataFim={true}
              placeholderBusca="Buscar por descrição, funcionário ou matrícula..."
              valorBusca={busca}
              onBuscaChange={setBusca}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#0c9abe]">Registros de Eventos</CardTitle>
          <CardDescription>
            {dadosFiltrados.length} registro(s) encontrado(s) de {eventosDisponiveis.length} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-900">Data</TableHead>
                  <TableHead className="font-semibold text-gray-900">Descrição</TableHead>
                  <TableHead className="font-semibold text-gray-900">Empresa</TableHead>
                  <TableHead className="font-semibold text-gray-900">Setor</TableHead>
                  <TableHead className="font-semibold text-gray-900">Funcionário</TableHead>
                  <TableHead className="font-semibold text-gray-900">Horas</TableHead>
                  <TableHead className="font-semibold text-gray-900">Tipo</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dadosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Nenhum evento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  dadosFiltrados.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.data_evento ? format(new Date(item.data_evento), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.descricao || "-"}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.empresas?.Estabelecimento || "-"}</TableCell>
                      <TableCell>{item.centro_custos?.nome || "-"}</TableCell>
                      <TableCell>
                        <div>
                          <div>{item.funcionarios?.nome || "-"}</div>
                          <div className="text-sm text-gray-500">{item.funcionarios?.matricula || "-"}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.qtd_horas || 0}h</TableCell>
                      <TableCell>
                        <Badge variant={item.tipo_horas === 1 ? "default" : "secondary"}>
                          {item.tipo_horas === 1 ? "Extra" : "Dia Útil"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
