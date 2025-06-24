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
import { FiltrosCascata } from "@/components/ui/filtros-cascata"
import { useHorasJustificadasNew } from "@/hooks/use-horas-justificadas-new"
import { useFiltrosCascata } from "@/hooks/use-filtros-cascata"
import { Plus, Download, Edit, Trash2, FileCheck } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

export default function HorasJustificadasPage() {
  const { horasJustificadas, loading, createHoraJustificada, updateHoraJustificada, deleteHoraJustificada } =
    useHorasJustificadasNew()
  const { filtros, opcoesFiltradas, updateFiltro } = useFiltrosCascata()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [busca, setBusca] = useState("")

  const [formData, setFormData] = useState({
    empresa_id: "",
    centro_custo_id: "",
    id_funcionario: "",
    data_hora_ini: "",
    data_hora_fim: "",
    observacoes: "",
  })

  // Garantir que os dados existam
  const horasDisponiveis = Array.isArray(horasJustificadas) ? horasJustificadas : []
  const empresasDisponiveis = opcoesFiltradas?.empresas || []
  const centrosCustoDisponiveis = opcoesFiltradas?.centrosCusto || []
  const funcionariosDisponiveis = opcoesFiltradas?.funcionarios || []

  // Para o formulário - filtros cascata
  const centrosCustoFormulario = centrosCustoDisponiveis.filter((cc) =>
    formData.empresa_id ? cc.empresa_id && cc.empresa_id.toString() === formData.empresa_id : false,
  )

  const funcionariosFormulario = funcionariosDisponiveis.filter((func) =>
    formData.centro_custo_id
      ? func.centro_custo_id && func.centro_custo_id.toString() === formData.centro_custo_id
      : false,
  )

  // Filtrar dados da tabela
  const dadosFiltrados = horasDisponiveis.filter((item) => {
    const matchEmpresa =
      filtros.empresa === "all" || (item.empresa_id && item.empresa_id.toString() === filtros.empresa)
    const matchCentro =
      filtros.centroCusto === "all" || (item.centro_custo_id && item.centro_custo_id.toString() === filtros.centroCusto)
    const matchFuncionario =
      filtros.funcionario === "all" || (item.id_funcionario && item.id_funcionario.toString() === filtros.funcionario)
    const matchBusca =
      !busca ||
      (item.funcionarios?.nome && item.funcionarios.nome.toLowerCase().includes(busca.toLowerCase())) ||
      (item.funcionarios?.matricula && item.funcionarios.matricula.toLowerCase().includes(busca.toLowerCase())) ||
      (item.observacoes && item.observacoes.toLowerCase().includes(busca.toLowerCase()))

    return matchEmpresa && matchCentro && matchFuncionario && matchBusca
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.empresa_id || !formData.centro_custo_id || !formData.id_funcionario) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    if (!formData.data_hora_ini || !formData.data_hora_fim) {
      toast.error("Selecione as datas e horários de início e fim")
      return
    }

    if (new Date(formData.data_hora_ini) > new Date(formData.data_hora_fim)) {
      toast.error("Data/hora de início deve ser anterior à data/hora de fim")
      return
    }

    try {
      const data = {
        empresa_id: Number.parseInt(formData.empresa_id),
        centro_custo_id: Number.parseInt(formData.centro_custo_id),
        id_funcionario: Number.parseInt(formData.id_funcionario),
        data_hora_ini: formData.data_hora_ini,
        data_hora_fim: formData.data_hora_fim,
        observacoes: formData.observacoes,
      }

      if (editingItem) {
        await updateHoraJustificada(editingItem.id, data)
      } else {
        await createHoraJustificada(data)
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
      id_funcionario: "",
      data_hora_ini: "",
      data_hora_fim: "",
      observacoes: "",
    })
    setEditingItem(null)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      empresa_id: item.empresa_id ? item.empresa_id.toString() : "",
      centro_custo_id: item.centro_custo_id ? item.centro_custo_id.toString() : "",
      id_funcionario: item.id_funcionario ? item.id_funcionario.toString() : "",
      data_hora_ini: item.data_hora_ini || "",
      data_hora_fim: item.data_hora_fim || "",
      observacoes: item.observacoes || "",
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja remover esta justificativa?")) {
      await deleteHoraJustificada(id)
    }
  }

  const exportData = () => {
    const csvContent = [
      [
        "Empresa",
        "Centro de Custo",
        "Funcionário",
        "Matrícula",
        "Data/Hora Início",
        "Data/Hora Fim",
        "Observações",
      ].join(","),
      ...dadosFiltrados.map((item) =>
        [
          item.empresas?.Estabelecimento || "",
          item.centro_custos?.nome || "",
          item.funcionarios?.nome || "",
          item.funcionarios?.matricula || "",
          format(new Date(item.data_hora_ini), "dd/MM/yyyy HH:mm"),
          format(new Date(item.data_hora_fim), "dd/MM/yyyy HH:mm"),
          item.observacoes || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `horas_justificadas_${format(new Date(), "dd-MM-yyyy")}.csv`
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
          <h2 className="text-2xl font-bold text-[#0c9abe]">Horas Justificadas</h2>
          <p className="text-gray-600">Cadastre justificativas de ausência com base em documentos</p>
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
                Nova Justificativa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-[#0c9abe]">
                  <FileCheck className="h-5 w-5" />
                  {editingItem ? "Editar Justificativa" : "Nova Justificativa de Horas"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa *</Label>
                  <Select
                    value={formData.empresa_id}
                    onValueChange={(value) => {
                      setFormData({ ...formData, empresa_id: value, centro_custo_id: "", id_funcionario: "" })
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
                  <Label htmlFor="centro_custo">Centro de Custo *</Label>
                  <Select
                    value={formData.centro_custo_id}
                    onValueChange={(value) => {
                      setFormData({ ...formData, centro_custo_id: value, id_funcionario: "" })
                    }}
                    disabled={!formData.empresa_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o centro de custo" />
                    </SelectTrigger>
                    <SelectContent>
                      {centrosCustoFormulario.map((centro) => (
                        <SelectItem key={centro.id} value={centro.id.toString()}>
                          {centro.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="funcionario">Funcionário *</Label>
                  <Select
                    value={formData.id_funcionario}
                    onValueChange={(value) => setFormData({ ...formData, id_funcionario: value })}
                    disabled={!formData.centro_custo_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o funcionário" />
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data_hora_ini">Data e Hora Início *</Label>
                    <Input
                      type="datetime-local"
                      value={formData.data_hora_ini}
                      onChange={(e) => setFormData({ ...formData, data_hora_ini: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_hora_fim">Data e Hora Fim *</Label>
                    <Input
                      type="datetime-local"
                      value={formData.data_hora_fim}
                      onChange={(e) => setFormData({ ...formData, data_hora_fim: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Observações sobre a justificativa..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
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
          <CardDescription>Use os filtros para encontrar justificativas específicas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FiltrosCascata
              filtros={filtros}
              opcoesFiltradas={opcoesFiltradas}
              updateFiltro={updateFiltro}
              mostrarFuncionario={true}
              placeholderBusca="Buscar por funcionário, matrícula ou observações..."
              valorBusca={busca}
              onBuscaChange={setBusca}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#0c9abe]">Justificativas Registradas</CardTitle>
          <CardDescription>
            {dadosFiltrados.length} justificativa(s) encontrada(s) de {horasDisponiveis.length} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-900">Empresa</TableHead>
                  <TableHead className="font-semibold text-gray-900">Centro de Custo</TableHead>
                  <TableHead className="font-semibold text-gray-900">Funcionário</TableHead>
                  <TableHead className="font-semibold text-gray-900">Matrícula</TableHead>
                  <TableHead className="font-semibold text-gray-900">Data/Hora Início</TableHead>
                  <TableHead className="font-semibold text-gray-900">Data/Hora Fim</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dadosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Nenhuma justificativa encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  dadosFiltrados.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.empresas?.Estabelecimento || "-"}</TableCell>
                      <TableCell>{item.centro_custos?.nome || "-"}</TableCell>
                      <TableCell>{item.funcionarios?.nome || "-"}</TableCell>
                      <TableCell>{item.funcionarios?.matricula || "-"}</TableCell>
                      <TableCell>
                        {item.data_hora_ini
                          ? format(new Date(item.data_hora_ini), "dd/MM/yyyy HH:mm", { locale: ptBR })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {item.data_hora_fim
                          ? format(new Date(item.data_hora_fim), "dd/MM/yyyy HH:mm", { locale: ptBR })
                          : "-"}
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
