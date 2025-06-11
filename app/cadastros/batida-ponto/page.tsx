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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ClipboardList, Upload, Download, Clock } from "lucide-react"
import type { TimeEntry, Employee } from "@/lib/types"
import { calculateWorkingHours } from "@/lib/utils"
import { useAuth } from "@/components/providers/auth-provider"

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

const mockTimeEntries: TimeEntry[] = [
  {
    id: "1",
    employeeId: "1",
    date: new Date("2024-01-15"),
    entries: ["08:00", "12:00", "13:00", "17:00"],
    totalHours: 8,
    status: "positive",
    createdBy: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    employeeId: "2",
    date: new Date("2024-01-15"),
    entries: ["14:00", "18:00", "19:00", "22:30"],
    totalHours: 7.5,
    status: "negative",
    createdBy: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function TimeEntryPage() {
  const { user } = useAuth()
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(mockTimeEntries)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [formData, setFormData] = useState({
    employeeId: "",
    date: "",
    entries: ["", "", "", "", "", "", "", ""],
  })
  const [csvFile, setCsvFile] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validEntries = formData.entries.filter((entry) => entry.trim() !== "")
    const totalHours = calculateWorkingHours(validEntries)
    const status: "positive" | "negative" = totalHours >= 8 ? "positive" : "negative"

    if (editingEntry) {
      setTimeEntries((prev) =>
        prev.map((entry) =>
          entry.id === editingEntry.id
            ? {
                ...entry,
                employeeId: formData.employeeId,
                date: new Date(formData.date),
                entries: validEntries,
                totalHours,
                status,
                updatedBy: user?.name || "admin",
                updatedAt: new Date(),
              }
            : entry,
        ),
      )
    } else {
      const newEntry: TimeEntry = {
        id: Date.now().toString(),
        employeeId: formData.employeeId,
        date: new Date(formData.date),
        entries: validEntries,
        totalHours,
        status,
        createdBy: user?.name || "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setTimeEntries((prev) => [...prev, newEntry])
    }

    resetForm()
  }

  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry)
    const paddedEntries = [...entry.entries]
    while (paddedEntries.length < 8) {
      paddedEntries.push("")
    }
    setFormData({
      employeeId: entry.employeeId,
      date: entry.date.toISOString().split("T")[0],
      entries: paddedEntries,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta batida de ponto?")) {
      setTimeEntries((prev) => prev.filter((entry) => entry.id !== id))
    }
  }

  const resetForm = () => {
    setFormData({
      employeeId: "",
      date: "",
      entries: ["", "", "", "", "", "", "", ""],
    })
    setEditingEntry(null)
    setIsDialogOpen(false)
  }

  const getEmployeeName = (employeeId: string) => {
    return mockEmployees.find((e) => e.id === employeeId)?.name || "N/A"
  }

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCsvFile(file)
      // Aqui você implementaria a lógica de processamento do CSV
      console.log("Arquivo CSV selecionado:", file.name)
    }
  }

  const processCsvFile = () => {
    if (!csvFile) return

    // Simulação de processamento do CSV
    alert(
      `Processando arquivo: ${csvFile.name}\nEsta funcionalidade será implementada para ler e importar os dados do CSV.`,
    )
    setCsvFile(null)
  }

  const downloadCsvTemplate = () => {
    // Simulação de download do template CSV
    const csvContent =
      "Matricula,Data,Entrada1,Saida1,Entrada2,Saida2,Entrada3,Saida3,Entrada4,Saida4\nFUN001,2024-01-15,08:00,12:00,13:00,17:00,,,,"
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "template_batida_ponto.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-red">Cadastro de Batida de Ponto</h1>
            <p className="text-primary-gray mt-2">Gerencie as batidas de ponto dos funcionários</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary-blue hover:bg-primary-blue/90">
                <Plus className="h-4 w-4 mr-2" />
                Nova Batida
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingEntry ? "Editar Batida de Ponto" : "Nova Batida de Ponto"}</DialogTitle>
                <DialogDescription>
                  {editingEntry
                    ? "Edite as informações da batida de ponto selecionada."
                    : "Preencha os dados para cadastrar uma nova batida de ponto."}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Horários (até 8 batidas por dia)</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {formData.entries.map((entry, index) => (
                      <div key={index} className="space-y-1">
                        <Label className="text-xs text-gray-500">Batida {index + 1}</Label>
                        <Input
                          type="time"
                          value={entry}
                          onChange={(e) => {
                            const newEntries = [...formData.entries]
                            newEntries[index] = e.target.value
                            setFormData((prev) => ({ ...prev, entries: newEntries }))
                          }}
                          placeholder="--:--"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-primary-blue hover:bg-primary-blue/90">
                    {editingEntry ? "Salvar" : "Cadastrar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="manual" className="space-y-4">
          <TabsList>
            <TabsTrigger value="manual">Cadastro Manual</TabsTrigger>
            <TabsTrigger value="import">Importação CSV</TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ClipboardList className="h-5 w-5 text-primary-blue" />
                  <span>Batidas de Ponto Cadastradas</span>
                </CardTitle>
                <CardDescription>Total de {timeEntries.length} batida(s) cadastrada(s)</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Funcionário</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Horários</TableHead>
                      <TableHead>Total de Horas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{getEmployeeName(entry.employeeId)}</TableCell>
                        <TableCell>{entry.date.toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {entry.entries.map((time, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {time}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{entry.totalHours}h</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={entry.status === "positive" ? "default" : "destructive"}>
                            {entry.status === "positive" ? "Positivo" : "Negativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">{entry.createdBy}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(entry)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(entry.id)}
                              className="text-primary-red hover:text-primary-red"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-primary-blue" />
                  <span>Importação via CSV</span>
                </CardTitle>
                <CardDescription>Importe múltiplas batidas de ponto através de arquivo CSV</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button variant="outline" onClick={downloadCsvTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Template CSV
                  </Button>
                  <span className="text-sm text-gray-500">Baixe o template para ver o formato correto do arquivo</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="csvFile">Selecionar arquivo CSV</Label>
                  <Input id="csvFile" type="file" accept=".csv" onChange={handleCsvUpload} className="cursor-pointer" />
                </div>

                {csvFile && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-900">Arquivo selecionado:</p>
                        <p className="text-sm text-blue-700">{csvFile.name}</p>
                      </div>
                      <Button onClick={processCsvFile} className="bg-primary-blue hover:bg-primary-blue/90">
                        Processar Arquivo
                      </Button>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Formato do CSV:</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Matricula: Código do funcionário</li>
                    <li>• Data: Formato YYYY-MM-DD</li>
                    <li>• Entrada1, Saida1, Entrada2, Saida2, etc.: Horários no formato HH:MM</li>
                    <li>• Máximo de 8 batidas por dia (4 pares entrada/saída)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
