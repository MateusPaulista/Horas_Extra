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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Edit, Trash2, Users, Upload, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Empresa {
  id_empresa: string
  cod_estabel: string
  descricao: string
}

interface CentroCusto {
  id_centro_custo: string
  cod_centro_custo: string
  setor: string
  id_empresa: string
}

interface Turno {
  id_turno: string
  nome: string
  hr_entrada: string
  hr_saida: string
  tempo_refeicao: number
}

interface Funcionario {
  id_matricula: string
  matricula: string
  nome: string
  email?: string
  id_empresa: string
  id_centro_custo: string
  id_turno: string
  foto_url?: string
  ativo: boolean
  data_adm: string
  created_at: string
  updated_at: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Funcionario[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Funcionario | null>(null)
  const [employeeToDelete, setEmployeeToDelete] = useState<Funcionario | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      // TODO: Implementar carregamento de dados reais do Supabase
      // const [employeesData, empresasData, centrosCustoData, turnosData] = await Promise.all([
      //   getFuncionarios(),
      //   getEmpresas(),
      //   getCentrosCusto(),
      //   getTurnos()
      // ])
      // setEmployees(employeesData)
      // setEmpresas(empresasData)
      // setCentrosCusto(centrosCustoData)
      // setTurnos(turnosData)
      setIsLoading(false)
    }

    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)

    // TODO: Implementar criação/atualização de funcionário
    // const result = editingEmployee
    //   ? await updateFuncionario(editingEmployee.id_matricula, formData)
    //   : await createFuncionario(formData)

    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A integração com o banco de dados será implementada.",
      variant: "default",
    })

    setIsSubmitting(false)
    setIsDialogOpen(false)
    resetForm()
  }

  const handleEdit = (employee: Funcionario) => {
    setEditingEmployee(employee)
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (employee: Funcionario) => {
    setEmployeeToDelete(employee)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return
    
    setIsDeleting(true)
    try {
      // TODO: Implementar exclusão real
      // const result = await deleteFuncionario(employeeToDelete.id_matricula)
      // if (result.success) {
        toast({
          title: "Funcionário excluído",
          description: "O funcionário foi excluído com sucesso.",
        })

        // TODO: Atualizar a lista de funcionários
        // const updatedEmployees = await getFuncionarios()
        // setEmployees(updatedEmployees)
        setIsDeleteDialogOpen(false)
        setEmployeeToDelete(null)
      // } else {
      //   toast({
      //     title: "Erro",
      //     description: result.error || "Ocorreu um erro ao excluir o funcionário.",
      //     variant: "destructive",
      //   })
      // }
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
    setEmployeeToDelete(null)
  }

  const resetForm = () => {
    setEditingEmployee(null)
  }

  const handleDialogClose = (open: boolean) => {
    console.log("Dialog state changing to:", open)
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const filteredCentrosCusto = centrosCusto.filter((cc) =>
    editingEmployee?.id_empresa ? cc.id_empresa === editingEmployee.id_empresa : true,
  )

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-blue">Cadastro de Funcionários</h1>
            <p className="text-primary-gray mt-2">Gerencie os funcionários do sistema</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button
                className="bg-primary-blue hover:bg-primary-blue/90"
                onClick={() => {
                  setEditingEmployee(null)
                  setIsDialogOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingEmployee ? "Editar Funcionário" : "Novo Funcionário"}</DialogTitle>
                <DialogDescription>
                  {editingEmployee
                    ? "Edite as informações do funcionário selecionado."
                    : "Preencha os dados para cadastrar um novo funcionário."}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="matricula">Matrícula</Label>
                    <Input
                      id="matricula"
                      name="matricula"
                      defaultValue={editingEmployee?.matricula || ""}
                      placeholder="Matrícula do funcionário"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      name="nome"
                      defaultValue={editingEmployee?.nome || ""}
                      placeholder="Nome do funcionário"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={editingEmployee?.email || ""}
                    placeholder="funcionario@empresa.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_adm">Data de Admissão</Label>
                  <Input
                    id="data_adm"
                    name="data_adm"
                    type="date"
                    defaultValue={editingEmployee?.data_adm || ""}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="id_empresa">Empresa</Label>
                  <Select name="id_empresa" defaultValue={editingEmployee?.id_empresa || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresas.map((empresa) => (
                        <SelectItem key={empresa.id_empresa} value={empresa.id_empresa}>
                          {empresa.cod_estabel} - {empresa.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="id_centro_custo">Centro de Custo</Label>
                  <Select name="id_centro_custo" defaultValue={editingEmployee?.id_centro_custo || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um centro de custo" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCentrosCusto.map((centroCusto) => (
                        <SelectItem key={centroCusto.id_centro_custo} value={centroCusto.id_centro_custo}>
                          {centroCusto.cod_centro_custo} - {centroCusto.setor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="id_turno">Turno</Label>
                  <Select name="id_turno" defaultValue={editingEmployee?.id_turno || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um turno" />
                    </SelectTrigger>
                    <SelectContent>
                      {turnos.map((turno) => (
                        <SelectItem key={turno.id_turno} value={turno.id_turno}>
                          {turno.nome} ({turno.hr_entrada} - {turno.hr_saida})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foto">Foto do Funcionário</Label>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={editingEmployee?.foto_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        <Users className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <Button type="button" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Foto
                    </Button>
                  </div>
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
                        {editingEmployee ? "Salvando..." : "Cadastrando..."}
                      </>
                    ) : editingEmployee ? (
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
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary-blue" />
              <span>Funcionários Cadastrados</span>
            </CardTitle>
            <CardDescription>Total de {employees.length} funcionário(s) cadastrado(s)</CardDescription>
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
                    <TableHead style={{ color: '#ffffff' }}>Foto</TableHead>
                    <TableHead style={{ color: '#ffffff' }}>Matrícula</TableHead>
                    <TableHead style={{ color: '#ffffff' }}>Nome</TableHead>
                    <TableHead style={{ color: '#ffffff' }}>Empresa</TableHead>
                    <TableHead style={{ color: '#ffffff' }}>Centro de Custo</TableHead>
                    <TableHead style={{ color: '#ffffff' }}>Turno</TableHead>
                    <TableHead className="text-right" style={{ color: '#ffffff' }}>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Nenhum funcionário cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees.map((employee) => (
                      <TableRow key={employee.id_matricula}>
                        <TableCell>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={employee.foto_url || "/placeholder.svg"} />
                            <AvatarFallback>{employee.nome.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{employee.matricula}</TableCell>
                        <TableCell>{employee.nome}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(employee)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(employee)}
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
                Tem certeza que deseja excluir o funcionário <strong>{employeeToDelete?.nome}</strong>?
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
