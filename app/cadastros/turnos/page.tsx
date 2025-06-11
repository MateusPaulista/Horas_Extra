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
import { Plus, Edit, Trash2, Clock, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Turno {
  id_turno: string
  nome: string
  hr_entrada: string
  hr_saida: string
  tempo_refeicao: number
  id_empresa: string
  created_at: string
  updated_at: string
}

interface Empresa {
  id_empresa: string
  cod_estabel: string
  descricao: string
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Turno[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<Turno | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      // TODO: Implementar carregamento de dados reais do Supabase
      // const [shiftsData, empresasData] = await Promise.all([
      //   getTurnos(),
      //   getEmpresas()
      // ])
      // setShifts(shiftsData)
      // setEmpresas(empresasData)
      setIsLoading(false)
    }

    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)

    // TODO: Implementar criação/atualização de turno
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A integração com o banco de dados será implementada.",
      variant: "default",
    })

    setIsSubmitting(false)
    setIsDialogOpen(false)
    resetForm()
  }

  const handleEdit = (shift: Turno) => {
    setEditingShift(shift)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este turno?")) {
      // TODO: Implementar exclusão
      toast({
        title: "Funcionalidade em desenvolvimento",
        description: "A exclusão será implementada.",
        variant: "default",
      })
    }
  }

  const resetForm = () => {
    setEditingShift(null)
  }

  const handleDialogClose = (open: boolean) => {
    console.log("Dialog state changing to:", open)
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const formatBreakTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-blue">Cadastro de Turnos</h1>
            <p className="text-primary-gray mt-2">Gerencie os turnos de trabalho do sistema</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button
                className="bg-primary-blue hover:bg-primary-blue/90"
                onClick={() => {
                  setEditingShift(null)
                  setIsDialogOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Turno
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingShift ? "Editar Turno" : "Novo Turno"}</DialogTitle>
                <DialogDescription>
                  {editingShift
                    ? "Edite as informações do turno selecionado."
                    : "Preencha os dados para cadastrar um novo turno."}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Turno</Label>
                  <Input
                    id="nome"
                    name="nome"
                    defaultValue={editingShift?.nome || ""}
                    placeholder="Ex: Manhã, Tarde, Noite"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hr_entrada">Horário de Entrada</Label>
                    <Input
                      id="hr_entrada"
                      name="hr_entrada"
                      type="time"
                      defaultValue={editingShift?.hr_entrada || ""}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hr_saida">Horário de Saída</Label>
                    <Input
                      id="hr_saida"
                      name="hr_saida"
                      type="time"
                      defaultValue={editingShift?.hr_saida || ""}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tempo_refeicao">Tempo de Refeição (minutos)</Label>
                  <Input
                    id="tempo_refeicao"
                    name="tempo_refeicao"
                    type="number"
                    min="0"
                    defaultValue={editingShift?.tempo_refeicao || 60}
                    placeholder="60"
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
                        {editingShift ? "Salvando..." : "Cadastrando..."}
                      </>
                    ) : editingShift ? (
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
              <Clock className="h-5 w-5 text-primary-blue" />
              <span>Turnos Cadastrados</span>
            </CardTitle>
            <CardDescription>Total de {shifts.length} turno(s) cadastrado(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Horário de Entrada</TableHead>
                    <TableHead>Horário de Saída</TableHead>
                    <TableHead>Tempo de Refeição</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shifts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Nenhum turno cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    shifts.map((shift) => (
                      <TableRow key={shift.id_turno}>
                        <TableCell className="font-medium">{shift.nome}</TableCell>
                        <TableCell>{shift.hr_entrada}</TableCell>
                        <TableCell>{shift.hr_saida}</TableCell>
                        <TableCell>{formatBreakTime(shift.tempo_refeicao)}</TableCell>
                        <TableCell>{new Date(shift.created_at).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(shift)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(shift.id_turno)}
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
      </div>
    </MainLayout>
  )
}
