"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Building2, Loader2, ChevronUp, ChevronDown, Filter } from "lucide-react"
import { getEmpresas, createEmpresa, updateEmpresa, deleteEmpresa } from "./actions"
import { useToast } from "@/components/ui/use-toast"

interface Empresa {
  id_empresa: string
  cod_estabel: string
  descricao: string
  created_at: string
  updated_at: string
}

type SortField = 'cod_estabel' | 'descricao' | 'created_at'
type SortDirection = 'asc' | 'desc'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Empresa[]>([])
  const [sortedCompanies, setSortedCompanies] = useState<Empresa[]>([])
  const [sortField, setSortField] = useState<SortField>('cod_estabel')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [searchFilter, setSearchFilter] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Empresa | null>(null)
  const [companyToDelete, setCompanyToDelete] = useState<Empresa | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function loadCompanies() {
      setIsLoading(true)
      try {
        const data = await getEmpresas()
        setCompanies(data || [])
      } catch (error) {
        console.error('Erro ao carregar empresas:', error)
        setCompanies([])
      } finally {
        setIsLoading(false)
      }
    }

    loadCompanies()
  }, [])

  useEffect(() => {
    // Primeiro aplicar o filtro
    let filtered = companies
    if (searchFilter.trim()) {
      filtered = companies.filter(company =>
        company.cod_estabel.toLowerCase().includes(searchFilter.toLowerCase()) ||
        company.descricao.toLowerCase().includes(searchFilter.toLowerCase()) ||
        new Date(company.created_at).toLocaleDateString('pt-BR').includes(searchFilter)
      )
    }

    // Depois aplicar a ordenação
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'cod_estabel':
          aValue = a.cod_estabel
          bValue = b.cod_estabel
          break
        case 'descricao':
          aValue = a.descricao
          bValue = b.descricao
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

    setSortedCompanies(sorted)
  }, [companies, sortField, sortDirection, searchFilter])

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
    const cod_estabel = formData.get("cod_estabel") as string
    const descricao = formData.get("descricao") as string

    if (!cod_estabel.trim() || !descricao.trim()) {
      toast({
        title: "Erro de validação",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      if (editingCompany) {
        const result = await updateEmpresa(editingCompany.id_empresa, formData)
        if (result.success) {
          toast({
            title: "Empresa atualizada",
            description: "A empresa foi atualizada com sucesso.",
          })
          const updatedCompanies = await getEmpresas()
          setCompanies(updatedCompanies || [])
          setIsDialogOpen(false)
          setEditingCompany(null)
        } else {
          toast({
            title: "Erro",
            description: result.error || "Ocorreu um erro ao atualizar a empresa.",
            variant: "destructive",
          })
        }
      } else {
        const result = await createEmpresa(formData)
        if (result.success) {
          toast({
            title: "Empresa criada",
            description: "A empresa foi criada com sucesso.",
          })
          const updatedCompanies = await getEmpresas()
          setCompanies(updatedCompanies || [])
          setIsDialogOpen(false)
          e.currentTarget.reset()
        } else {
          toast({
            title: "Erro",
            description: result.error || "Ocorreu um erro ao criar a empresa.",
            variant: "destructive",
          })
        }
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

  const handleEdit = (company: Empresa) => {
    setEditingCompany(company)
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (company: Empresa) => {
    setCompanyToDelete(company)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!companyToDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteEmpresa(companyToDelete.id_empresa)
      if (result.success) {
        toast({
          title: "Empresa excluída",
          description: "A empresa foi excluída com sucesso.",
        })
        const updatedCompanies = await getEmpresas()
        setCompanies(updatedCompanies || [])
        setIsDeleteDialogOpen(false)
        setCompanyToDelete(null)
      } else {
        toast({
          title: "Erro",
          description: result.error || "Ocorreu um erro ao excluir a empresa.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar a solicitação.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false)
    setCompanyToDelete(null)
  }

  const resetForm = () => {
    setEditingCompany(null)
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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-primary-blue">Cadastro de Empresas</h1>
          <p className="text-primary-gray mt-2">Gerencie as empresas do sistema</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCompany ? "Editar Empresa" : "Nova Empresa"}</DialogTitle>
              <DialogDescription>
                {editingCompany
                  ? "Edite as informações da empresa selecionada."
                  : "Preencha os dados para cadastrar uma nova empresa."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cod_estabel">Código da Empresa</Label>
                <Input
                  id="cod_estabel"
                  name="cod_estabel"
                  defaultValue={editingCompany?.cod_estabel || ""}
                  placeholder="EMP001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Nome da Empresa</Label>
                <Input
                  id="descricao"
                  name="descricao"
                  defaultValue={editingCompany?.descricao || ""}
                  placeholder="Nome da empresa"
                  required
                />
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
                      {editingCompany ? "Salvando..." : "Cadastrando..."}
                    </>
                  ) : editingCompany ? (
                    "Salvar"
                  ) : (
                    "Cadastrar"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Lista de Empresas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-primary-blue" />
                  <span>Empresas Cadastradas</span>
                </CardTitle>
                <CardDescription>Total de {companies.length} empresa(s) cadastrada(s)</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#23A4C4' }} />
                  <Input
                    placeholder="Filtrar por código, nome ou data..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Button onClick={() => setIsDialogOpen(true)} style={{ backgroundColor: '#0C9ABE' }} className="hover:opacity-90">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Empresa
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
                      onClick={() => handleSort('cod_estabel')}
                    >
                      <div className="flex items-center gap-2">
                        Código
                        {getSortIcon('cod_estabel')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-600 transition-colors"
                      style={{ color: '#ffffff' }}
                      onClick={() => handleSort('descricao')}
                    >
                      <div className="flex items-center gap-2">
                        Nome
                        {getSortIcon('descricao')}
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
                  {sortedCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        {searchFilter ? 'Nenhuma empresa encontrada com os filtros aplicados.' : 'Nenhuma empresa cadastrada.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedCompanies.map((company) => (
                      <TableRow key={company.id_empresa}>
                        <TableCell className="font-medium">{company.cod_estabel}</TableCell>
                        <TableCell>{company.descricao}</TableCell>
                        <TableCell>{new Date(company.created_at).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(company)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(company)}
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
                Tem certeza que deseja excluir a empresa <strong>{companyToDelete?.descricao}</strong>?
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
