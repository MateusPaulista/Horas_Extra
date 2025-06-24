"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAfastados } from "@/hooks/use-afastados"
import { useEmpresas } from "@/hooks/use-empresas"
import { useFuncionarios } from "@/hooks/use-funcionarios"
import { useCentroCustos } from "@/hooks/use-centro-custos"
import { Plus, Download, Edit, Trash2, UserX } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

export default function AfastadosPage() {
  const { afastados, loading, createAfastado, updateAfastado, deleteAfastado } = useAfastados()
  const { empresas } = useEmpresas()
  const { funcionarios, fetchFuncionarios } = useFuncionarios()
  const { centrosCusto, refetch: fetchCentrosCusto } = useCentroCustos()

  // Carregar dados quando a página for montada
  useEffect(() => {
    fetchFuncionarios()
    fetchCentrosCusto()
  }, [])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [busca, setBusca] = useState("")

  // Filtros
  const [filtroEmpresa, setFiltroEmpresa] = useState("all")
  const [filtroCentroCusto, setFiltroCentroCusto] = useState("all")
  const [filtroFuncionario, setFiltroFuncionario] = useState("all")

  const [formData, setFormData] = useState({
    id_empresa: "",
    centro_custo_id: "",
    id_funcionario: "",
    data_inicio: "",
    data_fim: "",
    motivo: "",
    observacoes: "",
  })

  // Garantir que os arrays existam e tenham dados válidos
  const empresasDisponiveis = Array.isArray(empresas) ? empresas.filter((e) => e && e.id && e.Estabelecimento) : []
  const centrosCustoDisponiveis = Array.isArray(centrosCusto) ? centrosCusto.filter((c) => c && c.id && c.nome) : []
  const funcionariosDisponiveis = Array.isArray(funcionarios) ? funcionarios.filter((f) => f && f.id && f.nome) : []
  const afastadosDisponiveis = Array.isArray(afastados) ? afastados.filter((a) => a && a.id) : []

  // Centros de custo filtrados por empresa
  const centrosCustoFiltrados = centrosCustoDisponiveis.filter((cc) => {
    if (filtroEmpresa === "all") return true
    return cc.empresa_id && cc.empresa_id.toString() === filtroEmpresa
  })

  const centrosCustoFormulario = centrosCustoDisponiveis.filter((cc) => {
    if (!formData.id_empresa) return false
    return cc.empresa_id && cc.empresa_id.toString() === formData.id_empresa
  })

  // Funcionários filtrados por empresa e centro de custo
  const funcionariosFiltrados = funcionariosDisponiveis.filter((func) => {
    // Obter empresa_id através do centro de custo
    const empresaId = func.centro_custos?.empresa_id
    if (filtroEmpresa !== "all" && (!empresaId || empresaId.toString() !== filtroEmpresa)) return false
    if (filtroCentroCusto !== "all" && func.centro_custo_id && func.centro_custo_id.toString() !== filtroCentroCusto) return false
    return true
  })

  const funcionariosFormulario = funcionariosDisponiveis.filter((func) => {
    // Verificar se os dados básicos existem
    if (!func || !func.id || !func.nome) return false
    
    // Verificar se empresa foi selecionada
    if (!formData.id_empresa) return false
    
    // Obter empresa_id através do centro de custo
    const empresaId = func.centro_custos?.empresa_id
    if (!empresaId || empresaId.toString() !== formData.id_empresa) return false
    
    // Se centro de custo foi selecionado, filtrar por ele
    if (formData.centro_custo_id && (!func.centro_custo_id || func.centro_custo_id.toString() !== formData.centro_custo_id)) return false
    
    return true
  })

  // Filtrar dados da tabela
  const dadosFiltrados = afastadosDisponiveis.filter((item) => {
    const matchEmpresa = filtroEmpresa === "all" || (item.id_empresa && item.id_empresa.toString() === filtroEmpresa)
    const matchCentroCusto = filtroCentroCusto === "all" || (item.centro_custo_id && item.centro_custo_id.toString() === filtroCentroCusto)
    const matchFuncionario =
      filtroFuncionario === "all" || (item.id_funcionario && item.id_funcionario.toString() === filtroFuncionario)
    const matchBusca =
      !busca ||
      (item.funcionarios?.nome && item.funcionarios.nome.toLowerCase().includes(busca.toLowerCase())) ||
      (item.funcionarios?.matricula && item.funcionarios.matricula.toLowerCase().includes(busca.toLowerCase())) ||
      (item.motivo && item.motivo.toLowerCase().includes(busca.toLowerCase()))

    return matchEmpresa && matchCentroCusto && matchFuncionario && matchBusca
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.id_empresa || !formData.centro_custo_id || !formData.id_funcionario) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    if (!formData.motivo.trim()) {
      toast.error("Informe o motivo do afastamento")
      return
    }

    if (!formData.data_inicio || !formData.data_fim) {
      toast.error("Selecione as datas de início e fim")
      return
    }

    if (new Date(formData.data_inicio) > new Date(formData.data_fim)) {
      toast.error("Data de início deve ser anterior à data de fim")
      return
    }

    try {
      // Validar se os valores podem ser convertidos para números
      const idEmpresa = Number.parseInt(formData.id_empresa)
      const idFuncionario = Number.parseInt(formData.id_funcionario)

      if (isNaN(idEmpresa) || isNaN(idFuncionario)) {
        toast.error("Erro nos dados selecionados. Tente novamente.")
        return
      }
      
      const data = {
        id_empresa: idEmpresa,
        id_funcionario: idFuncionario,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim,
        motivo: formData.motivo.trim(),
        observacoes: formData.observacoes || "",
      }

      console.log("📋 Dados do formulário:", formData)
      console.log("📤 Dados preparados para envio:", data)
      console.log("🔢 IDs convertidos:", { idEmpresa, idFuncionario })

      if (editingItem) {
        await updateAfastado(editingItem.id, data)
      } else {
        await createAfastado(data)
      }

      setDialogOpen(false)
      resetForm()
    } catch (error: any) {
      console.error("❌ Erro detalhado ao salvar (raw):", JSON.stringify(error, null, 2))
      console.error("❌ Erro detalhado ao salvar (object):", error)
      console.error("❌ Stack trace:", error?.stack)
      console.error("❌ Mensagem:", error?.message)
      console.error("❌ Tipo do erro:", typeof error)
      console.error("❌ Keys do erro:", Object.keys(error || {}))
      console.error("❌ Name:", error?.name)
      toast.error(`Erro ao salvar: ${error?.message || 'Erro desconhecido'}`)
    }
  }

  const resetForm = () => {
    setFormData({
      id_empresa: "",
      centro_custo_id: "",
      id_funcionario: "",
      data_inicio: "",
      data_fim: "",
      motivo: "",
      observacoes: "",
    })
    setEditingItem(null)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      id_empresa: item.id_empresa ? item.id_empresa.toString() : "",
      centro_custo_id: item.centro_custo_id ? item.centro_custo_id.toString() : "",
      id_funcionario: item.id_funcionario ? item.id_funcionario.toString() : "",
      data_inicio: item.data_inicio || "",
      data_fim: item.data_fim || "",
      motivo: item.motivo || "",
      observacoes: item.observacoes || "",
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja remover este afastamento?")) {
      await deleteAfastado(id)
    }
  }

  const exportData = () => {
    const csvContent = [
      ["Empresa", "Funcionário", "Matrícula", "Motivo", "Data Início", "Data Fim", "Observações"].join(","),
      ...dadosFiltrados.map((item) =>
        [
          item.empresas?.Estabelecimento || "",
          item.funcionarios?.nome || "",
          item.funcionarios?.matricula || "",
          item.motivo || "",
          item.data_inicio ? format(new Date(item.data_inicio), "dd/MM/yyyy") : "",
          item.data_fim ? format(new Date(item.data_fim), "dd/MM/yyyy") : "",
          item.observacoes || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `afastados_${format(new Date(), "dd-MM-yyyy")}.csv`
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
          <h2 className="text-2xl font-bold text-[#0c9abe]">Afastados</h2>
          <p className="text-gray-600">Registre funcionários afastados por motivos diversos</p>
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
                Novo Afastamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-[#0c9abe]">
                  <UserX className="h-5 w-5" />
                  {editingItem ? "Editar Afastamento" : "Novo Afastamento"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa *</Label>
                  <Select
                    value={formData.id_empresa}
                    onValueChange={(value) => {
                      setFormData({ ...formData, id_empresa: value, centro_custo_id: "", id_funcionario: "" })
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
                  <Label htmlFor="funcionario">Funcionário *</Label>
                  <Select
                    value={formData.id_funcionario}
                    onValueChange={(value) => {
                      console.log("🔍 Funcionário selecionado ID:", value)
                      const funcionarioSelecionado = funcionariosFormulario.find(f => f.id.toString() === value)
                      console.log("👤 Funcionário encontrado:", funcionarioSelecionado)
                      
                      if (funcionarioSelecionado && funcionarioSelecionado.centro_custo_id) {
                        console.log("🏢 Centro de custo do funcionário:", funcionarioSelecionado.centro_custo_id)
                        setFormData({ 
                          ...formData, 
                          id_funcionario: value,
                          centro_custo_id: funcionarioSelecionado.centro_custo_id.toString()
                        })
                      } else {
                        console.log("⚠️ Funcionário sem centro de custo")
                        setFormData({ ...formData, id_funcionario: value, centro_custo_id: "" })
                      }
                    }}
                    disabled={!formData.id_empresa}
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

                <div className="space-y-2">
                  <Label htmlFor="centro_custo">Centro de Custo *</Label>
                  <Select
                    value={formData.centro_custo_id}
                    onValueChange={(value) => {
                      setFormData({ ...formData, centro_custo_id: value })
                    }}
                    disabled={!formData.centro_custo_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Centro de custo será preenchido automaticamente" />
                    </SelectTrigger>
                    <SelectContent>
                      {centrosCustoFormulario.map((centroCusto) => (
                        <SelectItem key={centroCusto.id} value={centroCusto.id.toString()}>
                          {centroCusto.codigo} - {centroCusto.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data_inicio">Data Início *</Label>
                    <Input
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_fim">Data Fim *</Label>
                    <Input
                      type="date"
                      value={formData.data_fim}
                      onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo *</Label>
                  <Input
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    placeholder="Ex: Doença, Férias, Licença médica..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Observações adicionais..."
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
          <CardDescription>Use os filtros para encontrar afastamentos específicos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select
                value={filtroEmpresa}
                onValueChange={(value) => {
                  setFiltroEmpresa(value)
                  setFiltroCentroCusto("all")
                  setFiltroFuncionario("all")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as empresas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as empresas</SelectItem>
                  {empresasDisponiveis.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id.toString()}>
                      {empresa.Estabelecimento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Centro de Custo</Label>
              <Select
                value={filtroCentroCusto}
                onValueChange={(value) => {
                  setFiltroCentroCusto(value)
                  setFiltroFuncionario("all")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os centros de custo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os centros de custo</SelectItem>
                  {centrosCustoFiltrados.map((centroCusto) => (
                    <SelectItem key={centroCusto.id} value={centroCusto.id.toString()}>
                      {centroCusto.codigo} - {centroCusto.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Funcionário</Label>
              <Select value={filtroFuncionario} onValueChange={setFiltroFuncionario}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os funcionários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os funcionários</SelectItem>
                  {funcionariosFiltrados.map((funcionario) => (
                    <SelectItem key={funcionario.id} value={funcionario.id.toString()}>
                      {funcionario.matricula} - {funcionario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Buscar</Label>
              <Input
                placeholder="Buscar por funcionário, matrícula ou motivo..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#0c9abe]">Afastamentos Registrados</CardTitle>
          <CardDescription>
            {dadosFiltrados.length} afastamento(s) encontrado(s) de {afastadosDisponiveis.length} total
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
                  <TableHead className="font-semibold text-gray-900">Motivo</TableHead>
                  <TableHead className="font-semibold text-gray-900">Período</TableHead>
                  <TableHead className="font-semibold text-gray-900">Status</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dadosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Nenhum afastamento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  dadosFiltrados.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.empresas?.Estabelecimento || "-"}</TableCell>
                      <TableCell>{item.centro_custos?.nome || "-"}</TableCell>
                      <TableCell>{item.funcionarios?.nome || "-"}</TableCell>
                      <TableCell>{item.funcionarios?.matricula || "-"}</TableCell>
                      <TableCell>{item.motivo || "-"}</TableCell>
                      <TableCell>
                        {item.data_inicio && item.data_fim ? (
                          <>
                            {format(new Date(item.data_inicio), "dd/MM/yyyy", { locale: ptBR })} -{" "}
                            {format(new Date(item.data_fim), "dd/MM/yyyy", { locale: ptBR })}
                          </>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {item.data_inicio && item.data_fim ? (
                          <Badge
                            variant={
                              new Date() >= new Date(item.data_inicio) && new Date() <= new Date(item.data_fim)
                                ? "destructive"
                                : new Date() > new Date(item.data_fim)
                                  ? "secondary"
                                  : "default"
                            }
                          >
                            {new Date() >= new Date(item.data_inicio) && new Date() <= new Date(item.data_fim)
                              ? "Afastado"
                              : new Date() > new Date(item.data_fim)
                                ? "Finalizado"
                                : "Ativo"}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">-</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4" style={{ color: '#BE3E37' }} />
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
