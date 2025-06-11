"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Filter, Clock, TrendingDown, TrendingUp } from "lucide-react"
import type { Company, CostCenter, Shift, Employee } from "@/lib/types"

// Mock data
const mockCompanies: Company[] = [
  {
    id: "1",
    code: "EMP001",
    name: "Empresa Alpha Ltda",
    description: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    code: "EMP002",
    name: "Beta Soluções S.A.",
    description: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const mockCostCenters: CostCenter[] = [
  { id: "1", code: "CC001", sector: "Tecnologia", companyId: "1", createdAt: new Date(), updatedAt: new Date() },
  { id: "2", code: "CC002", sector: "Recursos Humanos", companyId: "1", createdAt: new Date(), updatedAt: new Date() },
  { id: "3", code: "CC003", sector: "Financeiro", companyId: "2", createdAt: new Date(), updatedAt: new Date() },
]

const mockShifts: Shift[] = [
  {
    id: "1",
    name: "Manhã",
    startTime: "08:00",
    endTime: "17:00",
    breakTime: 60,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Tarde",
    startTime: "14:00",
    endTime: "23:00",
    breakTime: 60,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Noite",
    startTime: "22:00",
    endTime: "06:00",
    breakTime: 60,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

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

const reportTypes = [
  {
    id: "absence",
    title: "Horas de Falta e Atraso",
    description: "Relatório detalhado de faltas e atrasos dos funcionários",
    icon: TrendingDown,
    color: "text-red-600",
  },
  {
    id: "overtime",
    title: "Horas Extra",
    description: "Relatório de horas extras trabalhadas",
    icon: TrendingUp,
    color: "text-yellow-600",
  },
  {
    id: "availability",
    title: "Disponibilidade de Horas",
    description: "Relatório de disponibilidade e utilização de horas",
    icon: Clock,
    color: "text-blue-600",
  },
]

export default function ReportsPage() {
  const [selectedReportType, setSelectedReportType] = useState("")
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    company: "",
    costCenter: "",
    employee: "",
    shift: "",
  })
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "employee",
    "company",
    "sector",
    "totalHours",
    "status",
  ])
  const [outputFormat, setOutputFormat] = useState("pdf")
  const [isGenerating, setIsGenerating] = useState(false)

  const availableColumns = [
    { id: "employee", label: "Funcionário" },
    { id: "registration", label: "Matrícula" },
    { id: "company", label: "Empresa" },
    { id: "sector", label: "Setor" },
    { id: "shift", label: "Turno" },
    { id: "totalHours", label: "Total de Horas" },
    { id: "plannedHours", label: "Horas Planejadas" },
    { id: "overtimeHours", label: "Horas Extras" },
    { id: "absenceHours", label: "Horas de Falta" },
    { id: "status", label: "Status" },
    { id: "percentage", label: "Percentual" },
  ]

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleColumnToggle = (columnId: string) => {
    setSelectedColumns((prev) => (prev.includes(columnId) ? prev.filter((id) => id !== columnId) : [...prev, columnId]))
  }

  const generateReport = async () => {
    if (!selectedReportType) {
      alert("Selecione um tipo de relatório")
      return
    }

    setIsGenerating(true)

    // Simulação de geração de relatório
    setTimeout(() => {
      const reportData = {
        type: selectedReportType,
        filters,
        columns: selectedColumns,
        format: outputFormat,
        generatedAt: new Date(),
      }

      console.log("Gerando relatório:", reportData)

      // Simulação de download
      const filename = `relatorio_${selectedReportType}_${new Date().toISOString().split("T")[0]}.${outputFormat}`
      alert(
        `Relatório "${filename}" gerado com sucesso!\n\nEm uma implementação real, o download seria iniciado automaticamente.`,
      )

      setIsGenerating(false)
    }, 2000)
  }

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      company: "",
      costCenter: "",
      employee: "",
      shift: "",
    })
  }

  const filteredCostCenters = mockCostCenters.filter((cc) =>
    filters.company ? cc.companyId === filters.company : true,
  )

  const filteredEmployees = mockEmployees.filter((emp) => {
    if (filters.company && emp.companyId !== filters.company) return false
    if (filters.costCenter && emp.costCenterId !== filters.costCenter) return false
    if (filters.shift && emp.shiftId !== filters.shift) return false
    return true
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-red">Relatórios</h1>
            <p className="text-primary-gray mt-2">Gere relatórios detalhados em PDF ou Excel</p>
          </div>
        </div>

        <Tabs defaultValue="generate" className="space-y-4">
          <TabsList>
            <TabsTrigger value="generate">Gerar Relatório</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            {/* Seleção do Tipo de Relatório */}
            <Card>
              <CardHeader>
                <CardTitle>Tipo de Relatório</CardTitle>
                <CardDescription>Selecione o tipo de relatório que deseja gerar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {reportTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <div
                        key={type.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedReportType === type.id
                            ? "border-primary-blue bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedReportType(type.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`h-6 w-6 ${type.color}`} />
                          <div>
                            <h3 className="font-medium">{type.title}</h3>
                            <p className="text-sm text-gray-500">{type.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-primary-blue" />
                  <span>Filtros</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data Inicial</Label>
                    <Input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Final</Label>
                    <Input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange("endDate", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Empresa</Label>
                    <Select value={filters.company} onValueChange={(value) => handleFilterChange("company", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as empresas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as empresas</SelectItem>
                        {mockCompanies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Centro de Custo</Label>
                    <Select
                      value={filters.costCenter}
                      onValueChange={(value) => handleFilterChange("costCenter", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os centros" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os centros</SelectItem>
                        {filteredCostCenters.map((cc) => (
                          <SelectItem key={cc.id} value={cc.id}>
                            {cc.sector}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Funcionário</Label>
                    <Select value={filters.employee} onValueChange={(value) => handleFilterChange("employee", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os funcionários" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os funcionários</SelectItem>
                        {filteredEmployees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Turno</Label>
                    <Select value={filters.shift} onValueChange={(value) => handleFilterChange("shift", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os turnos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os turnos</SelectItem>
                        {mockShifts.map((shift) => (
                          <SelectItem key={shift.id} value={shift.id}>
                            {shift.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Configurações do Relatório */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Colunas do Relatório</CardTitle>
                  <CardDescription>Selecione as colunas que deseja incluir no relatório</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availableColumns.map((column) => (
                      <div key={column.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={column.id}
                          checked={selectedColumns.includes(column.id)}
                          onCheckedChange={() => handleColumnToggle(column.id)}
                        />
                        <Label htmlFor={column.id} className="text-sm">
                          {column.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Formato de Saída</CardTitle>
                  <CardDescription>Escolha o formato do arquivo de saída</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="pdf"
                        name="format"
                        value="pdf"
                        checked={outputFormat === "pdf"}
                        onChange={(e) => setOutputFormat(e.target.value)}
                      />
                      <Label htmlFor="pdf" className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-red-600" />
                        <span>PDF</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="excel"
                        name="format"
                        value="xlsx"
                        checked={outputFormat === "xlsx"}
                        onChange={(e) => setOutputFormat(e.target.value)}
                      />
                      <Label htmlFor="excel" className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span>Excel (XLSX)</span>
                      </Label>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={generateReport}
                      disabled={isGenerating || !selectedReportType}
                      className="w-full bg-primary-blue hover:bg-primary-blue/90"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Gerando Relatório...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Gerar Relatório
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Relatórios</CardTitle>
                <CardDescription>Relatórios gerados anteriormente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock histórico */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium">Relatório de Horas Extras - Janeiro 2024</p>
                        <p className="text-sm text-gray-500">Gerado em 15/01/2024 às 14:30</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">PDF</Badge>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Relatório de Faltas e Atrasos - Dezembro 2023</p>
                        <p className="text-sm text-gray-500">Gerado em 05/01/2024 às 09:15</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Excel</Badge>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Relatório de Disponibilidade - Novembro 2023</p>
                        <p className="text-sm text-gray-500">Gerado em 01/12/2023 às 16:45</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">PDF</Badge>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
