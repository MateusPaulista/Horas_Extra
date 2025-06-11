"use client"

import type React from "react"

import { useState } from "react"
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
import { Plus, Edit, Trash2, Calendar, TrendingUp, TrendingDown } from "lucide-react"
import type { Planning, Employee } from "@/lib/types"

// Mock data
const mockEmployees: Employee[] = [
  {
    id: "1",
    registration: "FUN001",
    name: "João Silva",
    companyId: "1",
    costCenterId: "1",
    shiftId: "1",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    registration: "FUN002",
    name: "Maria Santos",
    companyId: "1",
    costCenterId: "2",
    shiftId: "2",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const mockPlannings: Planning[] = [
  {
    id: "1",
    employeeId: "1",
    month: "2024-01",
    plannedHours: 176,
    workedHours: 180,
    overtimeHours: 4,
    absenceHours: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    employeeId: "2",
    month: "2024-01",
    plannedHours: 176,
    workedHours: 168,
    overtimeHours: 0,
    absenceHours: 8,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function PlanningPage() {
  const [plannings, setPlannings] = useState<Planning[]>(mockPlannings)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlanning, setEditingPlanning] = useState<Planning | null>(null)
  const [formData, setFormData] = useState({
    employeeId: "",
    month: "",
    plannedHours: 0,
    workedHours: 0,
    overtimeHours: 0,
    absenceHours: 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingPlanning) {
      setPlannings((prev) =>
        prev.map((planning) =>
          planning.id === editingPlanning.id ? { ...planning, ...formData, updatedAt: new Date() } : planning,
        ),
      )
    } else {
      const newPlanning: Planning = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setPlannings((prev) => [...prev, newPlanning])
    }

    resetForm()
  }

  const handleEdit = (planning: Planning) => {
    setEditingPlanning(planning)
    setFormData({
      employeeId: planning.employeeId,
      month: planning.month,
      plannedHours: planning.plannedHours,
      workedHours: planning.workedHours,
      overtimeHours: planning.overtimeHours,
      absenceHours: planning.absenceHours,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este planejamento?")) {
      setPlannings((prev) => prev.filter((planning) => planning.id !== id))
    }
  }

  const resetForm = () => {
    setFormData({
      employeeId: "",
      month: "",
      plannedHours: 0,
      workedHours: 0,
      overtimeHours: 0,
      absenceHours: 0,
    })
    setEditingPlanning(null)
    setIsDialogOpen(false)
  }

  const getEmployeeName = (employeeId: string) => {
    return mockEmployees.find((e) => e.id === employeeId)?.name || "N/A"
  }

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split("-")
    const monthNames = [
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
    return `${monthNames[Number.parseInt(monthNum) - 1]} ${year}`
  }

  const getVariance = (planned: number, worked: number) => {
    return worked - planned
  }

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return "text-green-600"
    if (variance < 0) return "text-red-600"
    return "text-gray-600"
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-red">Cadastro de Planejamento</h1>
            <p className="text-primary-gray mt-2">Gerencie o planejamento de horas dos funcionários</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary-blue hover:bg-primary-blue/90">
                <Plus className="h-4 w-4 mr-2" />
                Novo Planejamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingPlanning ? "Editar Planejamento" : "Novo Planejamento"}</DialogTitle>
                <DialogDescription>
                  {editingPlanning
                    ? "Edite as informações do planejamento selecionado."
                    : "Preencha os dados para cadastrar um novo planejamento."}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Funcionário</Label>
                  <Select
                    value={formData.employeeId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, employeeId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um funcionário" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockEmployees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.registration} - {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="month">Mês Planejado</Label>
                  <Input
                    id="month"
                    type="month"
                    value={formData.month}
                    onChange={(e) => setFormData((prev) => ({ ...prev, month: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plannedHours">Horas Planejadas</Label>
                    <Input
                      id="plannedHours"
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.plannedHours}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, plannedHours: Number.parseFloat(e.target.value) || 0 }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workedHours">Horas Realizadas</Label>
                    <Input
                      id="workedHours"
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.workedHours}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, workedHours: Number.parseFloat(e.target.value) || 0 }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="overtimeHours">Horas Extra</Label>
                    <Input
                      id="overtimeHours"
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.overtimeHours}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, overtimeHours: Number.parseFloat(e.target.value) || 0 }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="absenceHours">Horas de Falta/Atraso</Label>
                    <Input
                      id="absenceHours"
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.absenceHours}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, absenceHours: Number.parseFloat(e.target.value) || 0 }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-primary-blue hover:bg-primary-blue/90">
                    {editingPlanning ? "Salvar" : "Cadastrar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary-blue" />
              <span>Planejamentos Cadastrados</span>
            </CardTitle>
            <CardDescription>Total de {plannings.length} planejamento(s) cadastrado(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Mês</TableHead>
                  <TableHead>Horas Planejadas</TableHead>
                  <TableHead>Horas Realizadas</TableHead>
                  <TableHead>Horas Extra</TableHead>
                  <TableHead>Faltas/Atrasos</TableHead>
                  <TableHead>Variação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plannings.map((planning) => {
                  const variance = getVariance(planning.plannedHours, planning.workedHours)
                  return (
                    <TableRow key={planning.id}>
                      <TableCell className="font-medium">{getEmployeeName(planning.employeeId)}</TableCell>
                      <TableCell>{formatMonth(planning.month)}</TableCell>
                      <TableCell>{planning.plannedHours}h</TableCell>
                      <TableCell>{planning.workedHours}h</TableCell>
                      <TableCell>{planning.overtimeHours}h</TableCell>
                      <TableCell>{planning.absenceHours}h</TableCell>
                      <TableCell className={getVarianceColor(variance)}>
                        <div className="flex items-center space-x-1">
                          {variance > 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : variance < 0 ? (
                            <TrendingDown className="h-4 w-4" />
                          ) : null}
                          <span>
                            {variance > 0 ? "+" : ""}
                            {variance}h
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(planning)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(planning.id)}
                            className="text-primary-red hover:text-primary-red"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
