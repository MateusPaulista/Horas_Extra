"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FiltrosCascata } from "@/components/ui/filtros-cascata"
import { useHorasExtrasPagar } from "@/hooks/use-horas-extras-pagar"
import { useFiltrosCascata } from "@/hooks/use-filtros-cascata"
import { useEmpresas } from "@/hooks/use-empresas"
import { useCentroCustos } from "@/hooks/use-centro-custos"
import { useFuncionarios } from "@/hooks/use-funcionarios"
import { Plus, Download, Edit, Trash2, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

const tiposEvento = ["Feriado", "Sábado", "Ponte", "Outros"]

export default function HorasExtrasAPagarPage() {
  const { horasExtras, loading, createHoraExtra, updateHoraExtra, deleteHoraExtra } = useHorasExtrasPagar()
  const { filtros, opcoesFiltradas, updateFiltro } = useFiltrosCascata()
  const { empresas } = useEmpresas()
  const { centrosCusto } = useCentroCustos()
  const { funcionarios } = useFuncionarios()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [busca, setBusca] = useState("")

  const [formData, setFormData] = useState({
    tipo: "",
    data_evento: "",
    empresa_id: "",
    centro_custo_id: "",
    funcionario_id: "",
    horas_pagar: "",
    observacoes: "",
  })

  // Garantir que os dados existam antes de filtrar
  const empresasDisponiveis = opcoesFiltradas?.empresas || empresas || []
  const centrosCustoDisponiveis = opcoesFiltradas?.centrosCusto || centrosCusto || []
  const funcionariosDisponiveis = opcoesFiltradas?.funcionarios || funcionarios || []

  // Filtrar dados
  const dadosFiltrados = (horasExtras || []).filter((item) => {
    const matchEmpresa =
      !filtros?.empresa || filtros.empresa === "all" || item.empresa_id.toString() === filtros.empresa
    const matchCentro =
      !filtros?.centroCusto ||
      filtros.centroCusto === "all" ||
      !item.centro_custo_id ||
      item.centro_custo_id.toString() === filtros.centroCusto
    const matchFuncionario =
      !filtros?.funcionario ||
      filtros.funcionario === "all" ||
      !item.funcionario_id ||
      item.funcionario_id.toString() === filtros.funcionario
    const matchBusca =
      !busca ||
      item.tipo.toLowerCase().includes(busca.toLowerCase()) ||
      (item.funcionarios?.nome && item.funcionarios.nome.toLowerCase().includes(busca.toLowerCase())) ||
      (item.funcionarios?.matricula && item.funcionarios.matricula.toLowerCase().includes(busca.toLowerCase()))

    let matchPeriodo = true
    if (filtros?.dataInicio && filtros?.dataFim) {
      const dataEvento = new Date(item.data_evento)
      matchPeriodo = dataEvento >= filtros.dataInicio && dataEvento <= filtros.dataFim
    }

    return matchEmpresa && matchCentro && matchFuncionario && matchBusca && matchPeriodo
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.tipo || !formData.data_evento || !formData.empresa_id) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    if (!formData.horas_pagar || Number.parseFloat(formData.horas_pagar) <= 0) {
      toast.error("Informe uma quantidade válida de horas")
      return
    }

    try {
      const data = {
        tipo: formData.tipo,
        data_evento: formData.data_evento,
        empresa_id: Number.parseInt(formData.empresa_id),
        centro_custo_id:
          formData.centro_custo_id && formData.centro_custo_id !== "all"
            ? Number.parseInt(formData.centro_custo_id)
            : null,
        funcionario_id:
          formData.funcionario_id && formData.funcionario_id !== "all"
            ? Number.parseInt(formData.funcionario_id)
            : null,
        horas_pagar: Number.parseFloat(formData.horas_pagar),
        observacoes: formData.observacoes,
        ativo: true,
      }

      if (editingItem) {
        await updateHoraExtra(editingItem.id, data)
      } else {
        await createHoraExtra(data)
      }

      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Erro ao salvar:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      tipo: "",
      data_evento: "",
      empresa_id: "",
      centro_custo_id: "",
      funcionario_id: "",
      horas_pagar: "",
      observacoes: "",
    })
    setEditingItem(null)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      tipo: item.tipo,
      data_evento: item.data_evento,
      empresa_id: item.empresa_id.toString(),
      centro_custo_id: item.centro_custo_id ? item.centro_custo_id.toString() : "",
      funcionario_id: item.funcionario_id ? item.funcionario_id.toString() : "",
      horas_pagar: item.horas_pagar.toString(),
      observacoes: item.observacoes || "",
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja remover este registro?")) {
      await deleteHoraExtra(id)
    }
  }

  const exportData = () => {
    const csvContent = [
      ["Tipo", "Data Evento", "Empresa", "Setor", "Funcionário", "Matrícula", "Horas a Pagar", "Observações"].join(","),
      ...dadosFiltrados.map((item) =>
        [
          item.tipo,
          format(new Date(item.data_evento), "dd/MM/yyyy"),
          item.empresas?.Estabelecimento || "",
          item.centro_custos?.nome || "Todos",
          item.funcionarios?.nome || "Todos",
          item.funcionarios?.matricula || "-",
          item.horas_pagar,
          item.observacoes || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `horas_extras_pagar_${format(new Date(), "dd-MM-yyyy")}.csv`
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
          <h2 className="text-2xl font-bold text-[#0c9abe]">Horas Extras a Pagar</h2>
          <p className="text-gray-600">Registre horas extras em feriados, sábados e eventos especiais</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportData} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  {editingItem ? "Editar Registro" : "Novo Registro de Horas Extras"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposEvento.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_evento">Data do Evento *</Label>
                    <Input
                      type="date"
                      value={formData.data_evento}
                      onChange={(e) => setFormData({ ...formData, data_evento: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa *</Label>
                  <Select
                    value={formData.empresa_id}
                    onValueChange={(value) => {
                      setFormData({ ...formData, empresa_id: value, centro_custo_id: "", funcionario_id: "" })
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
                  <Label htmlFor="centro_custo">Setor (Opcional)</Label>
                  <Select
                    value={formData.centro_custo_id || "all"}
                    onValueChange={(value) => {
                      setFormData({ ...formData, centro_custo_id: value === "all" ? "" : value, funcionario_id: "" })
                    }}
                    disabled={!formData.empresa_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os setores ou selecione específico" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os setores</SelectItem>
                      {centrosCustoDisponiveis
                        .filter((cc) => cc.empresa_id.toString() === formData.empresa_id)
                        .map((centro) => (
                          <SelectItem key={centro.id} value={centro.id.toString()}>
                            {centro.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">Deixe vazio para aplicar a todos os setores da empresa</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="funcionario">Funcionário (Opcional)</Label>
                  <Select
                    value={formData.funcionario_id || "all"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, funcionario_id: value === "all" ? "" : value })
                    }
                    disabled={!formData.empresa_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os funcionários ou selecione específico" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os funcionários</SelectItem>
                      {funcionariosDisponiveis
                        .filter(
                          (func) =>
                            func.empresa_id.toString() === formData.empresa_id &&
                            (!formData.centro_custo_id || func.centro_custo_id.toString() === formData.centro_custo_id),
                        )
                        .map((funcionario) => (
                          <SelectItem key={funcionario.id} value={funcionario.id.toString()}>
                            {funcionario.matricula} - {funcionario.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">Deixe vazio para aplicar a todos os funcionários</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horas_pagar">Quantidade de Horas a Pagar *</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.horas_pagar}
                    onChange={(e) => setFormData({ ...formData, horas_pagar: e.target.value })}
                    placeholder="Ex: 8, 4, 2.5..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Observações sobre o evento ou horas extras..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingItem ? "Atualizar" : "Salvar"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Use os filtros para encontrar registros específicos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {opcoesFiltradas && (
              <FiltrosCascata
                filtros={filtros}
                opcoesFiltradas={opcoesFiltradas}
                updateFiltro={updateFiltro}
                mostrarFuncionario={true}
                mostrarDataInicio={true}
                mostrarDataFim={true}
                placeholderBusca="Buscar por tipo, funcionário ou matrícula..."
                valorBusca={busca}
                onBuscaChange={setBusca}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registros de Horas Extras</CardTitle>
          <CardDescription>
            {dadosFiltrados.length} registro(s) encontrado(s) de {horasExtras?.length || 0} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data Evento</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Horas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dadosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Nenhum registro encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  dadosFiltrados.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant="outline">{item.tipo}</Badge>
                      </TableCell>
                      <TableCell>{format(new Date(item.data_evento), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                      <TableCell className="font-medium">{item.empresas?.Estabelecimento}</TableCell>
                      <TableCell>{item.centro_custos?.nome || "Todos"}</TableCell>
                      <TableCell>
                        {item.funcionarios ? (
                          <div>
                            <div>{item.funcionarios.nome}</div>
                            <div className="text-sm text-gray-500">{item.funcionarios.matricula}</div>
                          </div>
                        ) : (
                          "Todos"
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{item.horas_pagar}h</TableCell>
                      <TableCell>
                        <Badge variant={new Date(item.data_evento) >= new Date() ? "default" : "secondary"}>
                          {new Date(item.data_evento) >= new Date() ? "Futuro" : "Processado"}
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
