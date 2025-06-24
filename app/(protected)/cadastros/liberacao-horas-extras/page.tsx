"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FiltrosCascata } from "@/components/ui/filtros-cascata"
import { useLiberarHoras } from "@/hooks/use-liberar-horas"
import { useFiltrosCascata } from "@/hooks/use-filtros-cascata"
import { useEmpresas } from "@/hooks/use-empresas"
import { useCentroCustos } from "@/hooks/use-centro-custos"
import { useFuncionarios } from "@/hooks/use-funcionarios"

import { Plus, Download, Edit, Trash2, Clock } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

// Mapeamento dos tipos de liberação
const TIPOS_LIBERACAO = {
  1: "Dia",
  2: "Semana",
  3: "Mês",
  4: "Ano",
  5: "Todos os dias",
}

export default function LiberacaoHorasExtrasPage() {
  const { liberacoes, loading, createLiberacao, updateLiberacao, deleteLiberacao } = useLiberarHoras()
  const { filtros, opcoesFiltradas, updateFiltro } = useFiltrosCascata()
  const { empresas } = useEmpresas()
  const { centrosCusto } = useCentroCustos()
  const { funcionarios, fetchFuncionarios } = useFuncionarios()


  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [busca, setBusca] = useState("")

  const [formData, setFormData] = useState({
    empresa_id: "",
    centro_custo_id: "",
    id_funcionario: "",
    data_liberacao: "",
    tipo_liberacao: "1",
    horas_lib: "",
    motivo: "",
  })

  // Carregar funcionários quando o componente for montado
  useEffect(() => {
    fetchFuncionarios()
  }, [])

  // Filtrar dados baseado nos filtros
  const dadosFiltrados = useMemo(() => {
    console.log("🔍 Filtrando dados. Total de liberações:", liberacoes.length)
    console.log("📊 Primeira liberação para debug:", liberacoes[0])
    
    let resultado = liberacoes

    // Filtro por empresa
    if (filtros.empresa) {
      resultado = resultado.filter((item) => item.empresa_id === parseInt(filtros.empresa))
    }

    // Filtro por centro de custo
    if (filtros.centroCusto) {
      resultado = resultado.filter((item) => item.centro_custo_id === parseInt(filtros.centroCusto))
    }

    // Filtro por funcionário
    if (filtros.funcionario) {
      resultado = resultado.filter((item) => item.id_funcionario === parseInt(filtros.funcionario))
    }

    // Filtro por busca (nome ou matrícula)
    if (busca) {
      resultado = resultado.filter((item) => {
        const funcionario = item.funcionarios
        console.log("🔍 Verificando funcionário para busca:", funcionario)
        if (!funcionario) return false
        
        const nome = funcionario.nome?.toLowerCase() || ""
        const matricula = funcionario.matricula?.toLowerCase() || ""
        const termoBusca = busca.toLowerCase()
        
        return nome.includes(termoBusca) || matricula.includes(termoBusca)
      })
    }

    console.log("✅ Dados filtrados:", resultado.length)
    if (resultado.length > 0) {
      console.log("📊 Primeiro item filtrado:", resultado[0])
      console.log("👤 Funcionário do primeiro item:", resultado[0].funcionarios)
    }
    
    return resultado
  }, [liberacoes, filtros, busca])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Validar campos obrigatórios
      if (!formData.empresa_id || !formData.centro_custo_id || !formData.id_funcionario || 
          !formData.data_liberacao || !formData.horas_lib) {
        toast.error("Por favor, preencha todos os campos obrigatórios")
        return
      }

      // Validar se os valores numéricos são válidos
      const empresaId = parseInt(formData.empresa_id)
      const centroCustoId = parseInt(formData.centro_custo_id)
      const funcionarioId = parseInt(formData.id_funcionario)
      const tipoLiberacao = parseInt(formData.tipo_liberacao)
      const horasLib = parseFloat(formData.horas_lib)

      console.log("Valores antes da validação:", {
        empresa_id: formData.empresa_id,
        centro_custo_id: formData.centro_custo_id,
        id_funcionario: formData.id_funcionario,
        tipo_liberacao: formData.tipo_liberacao,
        horas_lib: formData.horas_lib
      })

      console.log("Valores após conversão:", {
        empresaId,
        centroCustoId,
        funcionarioId,
        tipoLiberacao,
        horasLib
      })

      // Validações mais robustas para valores numéricos
      if (isNaN(empresaId) || empresaId <= 0) {
        toast.error("Empresa inválida")
        console.error("Empresa ID inválido:", empresaId)
        return
      }

      if (isNaN(centroCustoId) || centroCustoId <= 0) {
        toast.error("Centro de custo inválido")
        console.error("Centro de custo ID inválido:", centroCustoId)
        return
      }

      if (isNaN(funcionarioId) || funcionarioId <= 0) {
        toast.error("Funcionário inválido")
        console.error("Funcionário ID inválido:", funcionarioId)
        return
      }

      if (isNaN(tipoLiberacao) || tipoLiberacao <= 0) {
        toast.error("Tipo de liberação inválido")
        console.error("Tipo de liberação inválido:", tipoLiberacao)
        return
      }

      if (isNaN(horasLib) || horasLib <= 0) {
        toast.error("Horas inválidas - deve ser um número maior que zero")
        console.error("Horas inválidas:", horasLib)
        return
      }

      // Validar tipo_liberacao (deve ser 1, 2, 3, 4 ou 5)
      if (![1, 2, 3, 4, 5].includes(tipoLiberacao)) {
        toast.error("Tipo de liberação deve ser: 1=Dia, 2=Semana, 3=Mês, 4=Ano, 5=Todos os dias")
        console.error("Tipo de liberação inválido:", tipoLiberacao, "- Valores aceitos: 1, 2, 3, 4, 5")
        return
      }

      // Validar formato da data
      const dataLiberacao = formData.data_liberacao
      if (!dataLiberacao || !/^\d{4}-\d{2}-\d{2}$/.test(dataLiberacao)) {
        toast.error("Data de liberação deve estar no formato YYYY-MM-DD")
        console.error("Data inválida:", dataLiberacao)
        return
      }

      const data = {
        empresa_id: Number(empresaId),
        centro_custo_id: Number(centroCustoId),
        id_funcionario: Number(funcionarioId),
        data_liberacao: dataLiberacao,
        tipo_liberacao: Number(tipoLiberacao),
        horas_lib: Number(horasLib),
        motivo: formData.motivo?.trim() || undefined,
      }

      console.log("📋 Dados finais a serem enviados:", {
        ...data,
        dataTypes: {
          empresa_id: typeof data.empresa_id,
          centro_custo_id: typeof data.centro_custo_id,
          id_funcionario: typeof data.id_funcionario,
          data_liberacao: typeof data.data_liberacao,
          tipo_liberacao: typeof data.tipo_liberacao,
          horas_lib: typeof data.horas_lib,
          motivo: typeof data.motivo
        }
      })

      if (editingItem) {
        await updateLiberacao(editingItem.id, data)
      } else {
        await createLiberacao(data)
      }

      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("❌ Erro ao salvar:", JSON.stringify({
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        error: error instanceof Error ? error.stack : String(error)
      }, null, 2))
      toast.error("Erro ao salvar liberação")
    }
  }

  const resetForm = () => {
    setFormData({
      empresa_id: "",
      centro_custo_id: "",
      id_funcionario: "",
      data_liberacao: "",
      tipo_liberacao: "1",
      horas_lib: "",
      motivo: "",
    })
    setEditingItem(null)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      empresa_id: item.empresa_id.toString(),
      centro_custo_id: item.centro_custo_id.toString(),
      id_funcionario: item.id_funcionario.toString(),
      data_liberacao: item.data_liberacao,
      tipo_liberacao: item.tipo_liberacao.toString(),
      horas_lib: item.horas_lib.toString(),
      motivo: item.motivo || "",
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja remover esta liberação?")) {
      await deleteLiberacao(id)
    }
  }

  const exportData = () => {
    const csvContent = [
      ["Empresa", "Setor", "Funcionário", "Matrícula", "Data", "Tipo", "Horas", "Motivo"].join(","),
      ...dadosFiltrados.map((item) =>
        [
          item.empresas?.Estabelecimento || "",
          item.centro_custos?.nome || "",
          item.funcionarios?.nome || "",
          item.funcionarios?.matricula || "",
          format(new Date(item.data_liberacao), "dd/MM/yyyy"),
          TIPOS_LIBERACAO[item.tipo_liberacao as keyof typeof TIPOS_LIBERACAO] || "",
          item.horas_lib,
          item.motivo || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `liberacao_horas_extras_${format(new Date(), "dd-MM-yyyy")}.csv`
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
          <h2 className="text-2xl font-bold text-[#0c9abe]">Liberação de Horas Extras</h2>
          <p className="text-gray-600">Gerencie os funcionários autorizados a realizar horas extras</p>
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
                Nova Liberação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-[#0c9abe]">
                  <Clock className="h-5 w-5" />
                  {editingItem ? "Editar Liberação" : "Nova Liberação de Horas Extras"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                        {empresas?.map((empresa) => (
                          <SelectItem key={empresa.id} value={empresa.id.toString()}>
                            {empresa.Estabelecimento} - {empresa.Descricao}
                          </SelectItem>
                        )) || []}
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
                        {centrosCusto
                          ?.filter((cc) => cc.empresa_id.toString() === formData.empresa_id)
                          .map((centro) => (
                            <SelectItem key={centro.id} value={centro.id.toString()}>
                              {centro.nome}
                            </SelectItem>
                          )) || []}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">


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
                        {funcionarios
                          ?.filter((func) => func.centro_custo_id?.toString() === formData.centro_custo_id)
                          .map((funcionario) => (
                            <SelectItem key={funcionario.id} value={funcionario.id.toString()}>
                              {funcionario.matricula} - {funcionario.nome}
                            </SelectItem>
                          )) || []}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data_liberacao">Data de Liberação *</Label>
                    <Input
                      type="date"
                      value={formData.data_liberacao}
                      onChange={(e) => setFormData({ ...formData, data_liberacao: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="horas_lib">Horas a Liberar *</Label>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.horas_lib}
                      onChange={(e) => setFormData({ ...formData, horas_lib: e.target.value })}
                      placeholder="Ex: 2.5"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Tipo de Liberação *</Label>
                  <RadioGroup
                    value={formData.tipo_liberacao}
                    onValueChange={(value) => setFormData({ ...formData, tipo_liberacao: value })}
                    className="grid grid-cols-3 gap-4"
                  >
                    {Object.entries(TIPOS_LIBERACAO).map(([value, label]) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={value} id={`tipo-${value}`} />
                        <Label htmlFor={`tipo-${value}`} className="text-sm">
                          {value} — {label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo</Label>
                  <Textarea
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    placeholder="Descreva o motivo da liberação..."
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
          <CardDescription>Use os filtros para encontrar liberações específicas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FiltrosCascata
              filtros={filtros}
              opcoesFiltradas={opcoesFiltradas}
              updateFiltro={updateFiltro}
              empresasExternas={empresas}
              mostrarEmpresa={true}
              mostrarCentroCusto={true}
              mostrarTurno={false}
              mostrarFuncionario={true}
              placeholderBusca="Buscar por funcionário ou matrícula..."
              valorBusca={busca}
              onBuscaChange={setBusca}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#0c9abe]">Liberações Cadastradas</CardTitle>
          <CardDescription>
            {dadosFiltrados.length} liberação(ões) encontrada(s) de {liberacoes.length} total
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
                  <TableHead className="font-semibold text-gray-900">Data</TableHead>
                  <TableHead className="font-semibold text-gray-900">Tipo</TableHead>
                  <TableHead className="font-semibold text-gray-900">Horas</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dadosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Nenhuma liberação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  dadosFiltrados.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.empresas?.Estabelecimento}</TableCell>
                      <TableCell>{item.centro_custos?.nome}</TableCell>
                      <TableCell>{item.funcionarios?.nome}</TableCell>
                      <TableCell>{item.funcionarios?.matricula}</TableCell>
                      <TableCell>{format(new Date(item.data_liberacao), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{TIPOS_LIBERACAO[item.tipo_liberacao as keyof typeof TIPOS_LIBERACAO]}</Badge>
                      </TableCell>
                      <TableCell>{item.horas_lib}h</TableCell>
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
