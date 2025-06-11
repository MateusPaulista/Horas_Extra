"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Target, Loader2, ChevronUp, ChevronDown, Filter } from "lucide-react"
import { getCentrosCusto, getEmpresas, createCentroCusto, updateCentroCusto, deleteCentroCusto } from "./actions"
import { useToast } from "@/components/ui/use-toast"

interface Empresa {
  id_empresa: string
  cod_estabel: string
  descricao: string
}

interface CentroCusto {
  id_centro: string
  codigo: string
  descricao: string
  cod_estabel: string
  created_at: string
  updated_at: string
  empresa?: {
    id_empresa: string
    cod_estabel: string
    descricao: string
  }
}

type SortField = 'codigo' | 'descricao' | 'empresa' | 'created_at'
type SortDirection = 'asc' | 'desc'

export default function CostCentersPage() {
  const [costCenters, setCostCenters] = useState<CentroCusto[]>([])
  const [sortedCostCenters, setSortedCostCenters] = useState<CentroCusto[]>([])
  const [sortField, setSortField] = useState<SortField>('codigo')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingCostCenter, setEditingCostCenter] = useState<CentroCusto | null>(null)
  const [costCenterToDelete, setCostCenterToDelete] = useState<CentroCusto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchFilter, setSearchFilter] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      const [costCentersData, empresasData] = await Promise.all([getCentrosCusto(), getEmpresas()])
      setCostCenters(costCentersData as CentroCusto[])
      setEmpresas(empresasData)
      setIsLoading(false)
    }

    loadData()
  }, [])

  useEffect(() => {
    if (!costCenters.length) {
      setSortedCostCenters([])
      return
    }

    // Primeiro filtrar
    let filtered = costCenters
    if (searchFilter.trim()) {
      const filterLower = searchFilter.toLowerCase().trim()
      filtered = costCenters.filter(centro => 
        centro.codigo.toLowerCase().includes(filterLower) ||
        centro.descricao.toLowerCase().includes(filterLower) ||
        (centro.empresa?.descricao || '').toLowerCase().includes(filterLower) ||
        new Date(centro.created_at).toLocaleDateString('pt-BR').includes(filterLower)
      )
    }

    // Depois ordenar
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'codigo':
          aValue = a.codigo
          bValue = b.codigo
          break
        case 'descricao':
          aValue = a.descricao
          bValue = b.descricao
          break
        case 'empresa':
          aValue = a.empresa?.descricao || ''
          bValue = b.empresa?.descricao || ''
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        default:
          return 0
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue)
        return sortDirection === 'asc' ? comparison : -comparison
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }

      return 0
    })

    setSortedCostCenters(sorted)
  }, [costCenters, sortField, sortDirection, searchFilter])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const codigo = formData.get("codigo") as string
    const descricao = formData.get("descricao") as string
    const cod_estabel = formData.get("cod_estabel") as string

    // Validação básica
    if (!codigo.trim() || !descricao.trim() || !cod_estabel) {
      toast({
        title: "Erro de validação",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      if (editingCostCenter) {
        await updateCentroCusto(editingCostCenter.id_centro, {
          codigo: codigo.trim(),
          descricao: descricao.trim(),
          cod_estabel
        })
        toast({
          title: "Centro de custo atualizado",
          description: "O centro de custo foi atualizado com sucesso.",
        })

        // Atualizar a lista
        const updatedCostCenters = await getCentrosCusto()
        setCostCenters(updatedCostCenters)
        setIsDialogOpen(false)
        resetForm()
      } else {
        await createCentroCusto({
          codigo: codigo.trim(),
          descricao: descricao.trim(),
          cod_estabel
        })
        toast({
          title: "Centro de custo criado",
          description: "O centro de custo foi criado com sucesso.",
        })

        // Atualizar a lista
        const updatedCostCenters = await getCentrosCusto()
        setCostCenters(updatedCostCenters)
        setIsDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Erro no formulário:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar a solicitação.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (costCenter: CentroCusto) => {
    setEditingCostCenter(costCenter)
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (costCenter: CentroCusto) => {
    setCostCenterToDelete(costCenter)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!costCenterToDelete) return
    
    setIsDeleting(true)
    try {
      await deleteCentroCusto(costCenterToDelete.id_centro)
      toast({
        title: "Centro de custo excluído",
        description: "O centro de custo foi excluído com sucesso.",
      })

      // Atualizar a lista
      const updatedCostCenters = await getCentrosCusto()
      setCostCenters(updatedCostCenters)
      setIsDeleteDialogOpen(false)
      setCostCenterToDelete(null)
    } catch (error) {
      console.error("Erro ao excluir centro de custo:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o centro de custo.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false)
    setCostCenterToDelete(null)
  }

  const resetForm = () => {
    setEditingCostCenter(null)
  }

  const handleDialogClose = (open: boolean) => {
    console.log("Dialog state changing to:", open)
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-blue">Cadastro de Centro de Custo</h1>
            <p className="text-primary-gray mt-2">Gerencie os centros de custo do sistema</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCostCenter ? "Editar Centro de Custo" : "Novo Centro de Custo"}</DialogTitle>
                <DialogDescription>
                  {editingCostCenter
                    ? "Edite as informações do centro de custo selecionado."
                    : "Preencha os dados para cadastrar um novo centro de custo."}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código do Centro de Custo</Label>
                  <Input
                    id="codigo"
                    name="codigo"
                    defaultValue={editingCostCenter?.codigo || ""}
                    placeholder="CC001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Setor</Label>
                  <Input
                    id="descricao"
                    name="descricao"
                    defaultValue={editingCostCenter?.descricao || ""}
                    placeholder="Nome do setor"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cod_estabel">Empresa</Label>
                  <Select name="cod_estabel" defaultValue={editingCostCenter?.cod_estabel || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresas.map((empresa) => (
                        <SelectItem key={empresa.cod_estabel} value={empresa.cod_estabel}>
                          {empresa.cod_estabel} - {empresa.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-primary-blue hover:bg-primary-blue/90" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingCostCenter ? "Salvando..." : "Cadastrando..."}
                      </>
                    ) : editingCostCenter ? (
                      "Salvar"
                    ) : (
                      "Cadastrar"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-primary-blue" />
                  <span>Centros de Custo Cadastrados</span>
                </CardTitle>
                <CardDescription>Total de {costCenters.length} centro(s) de custo cadastrado(s)</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#23A4C4' }} />
                  <Input
                    placeholder="Filtrar por código, setor, empresa ou data..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Button onClick={() => setIsDialogOpen(true)} style={{ backgroundColor: '#0C9ABE' }} className="hover:opacity-90">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Centro de Custo
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow style={{ backgroundColor: '#2c3739' }}>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-600 transition-colors"
                      style={{ color: '#ffffff' }}
                      onClick={() => handleSort('codigo')}
                    >
                      <div className="flex items-center gap-2">
                        Código
                        {getSortIcon('codigo')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-600 transition-colors"
                      style={{ color: '#ffffff' }}
                      onClick={() => handleSort('descricao')}
                    >
                      <div className="flex items-center gap-2">
                        Setor
                        {getSortIcon('descricao')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-600 transition-colors"
                      style={{ color: '#ffffff' }}
                      onClick={() => handleSort('empresa')}
                    >
                      <div className="flex items-center gap-2">
                        Empresa
                        {getSortIcon('empresa')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-600 transition-colors"
                      style={{ color: '#ffffff' }}
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-2">
                        Data de Cadastro
                        {getSortIcon('created_at')}
                      </div>
                    </TableHead>
                    <TableHead className="text-right" style={{ color: '#ffffff' }}>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCostCenters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        Nenhum centro de custo cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedCostCenters.map((costCenter) => (
                      <TableRow key={costCenter.id_centro}>
                        <TableCell className="font-medium">{costCenter.codigo}</TableCell>
                        <TableCell>{costCenter.descricao}</TableCell>
                        <TableCell>{costCenter.empresa?.descricao || "N/A"}</TableCell>
                        <TableCell>{new Date(costCenter.created_at).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(costCenter)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(costCenter)}
                              className="text-primary-red hover:text-primary-red"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Confirmação de Exclusão */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o centro de custo <strong>{costCenterToDelete?.descricao}</strong>?
                <br />
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  "Excluir"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
