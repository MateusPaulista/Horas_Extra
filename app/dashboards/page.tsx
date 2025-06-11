"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Clock, TrendingUp, TrendingDown, AlertTriangle, Filter, PieChart } from "lucide-react"
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

// Mock dashboard data
const dashboardMetrics = {
  totalHours: 3420,
  overtimeHours: 245,
  plannedHours: 3520,
  absenceHours: 180,
}

const topSectorsData = [
  { sector: "Tecnologia", type: "Direto", overtimeHours: 85, absenceHours: 12 },
  { sector: "Recursos Humanos", type: "Indireto", overtimeHours: 45, absenceHours: 28 },
  { sector: "Financeiro", type: "Direto", overtimeHours: 65, absenceHours: 15 },
  { sector: "Operações", type: "Direto", overtimeHours: 50, absenceHours: 35 },
  { sector: "Marketing", type: "Indireto", overtimeHours: 25, absenceHours: 18 },
]

const resultsData = [
  { label: "Horas Cumpridas", value: 85, color: "bg-green-500" },
  { label: "Horas Extras", value: 10, color: "bg-yellow-500" },
  { label: "Faltas/Atrasos", value: 5, color: "bg-red-500" },
]

const employeesWithMostAbsences = [
  { name: "Carlos Oliveira", absenceHours: 24, company: "Empresa Alpha Ltda" },
  { name: "Ana Costa", absenceHours: 18, company: "Beta Soluções S.A." },
  { name: "Roberto Lima", absenceHours: 15, company: "Empresa Alpha Ltda" },
  { name: "Fernanda Silva", absenceHours: 12, company: "Beta Soluções S.A." },
  { name: "Paulo Santos", absenceHours: 10, company: "Empresa Alpha Ltda" },
]

export default function DashboardsPage() {
  const [filters, setFilters] = useState({
    company: "",
    costCenter: "",
    employee: "",
    shift: "",
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ company: "", costCenter: "", employee: "", shift: "" })
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
            <h1 className="text-3xl font-bold text-primary-red">Dashboards Analíticos</h1>
            <p className="text-primary-gray mt-2">Visualize indicadores e gráficos de performance</p>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-primary-blue" />
              <span>Filtros</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                <Select value={filters.costCenter} onValueChange={(value) => handleFilterChange("costCenter", value)}>
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

            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Indicadores Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary-gray">Horas Totais</CardTitle>
              <Clock className="h-4 w-4 text-primary-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-blue">
                {dashboardMetrics.totalHours.toLocaleString()}h
              </div>
              <p className="text-xs text-gray-500 mt-1">Total trabalhado no período</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary-gray">Horas Extras</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{dashboardMetrics.overtimeHours}h</div>
              <p className="text-xs text-gray-500 mt-1">Acima do planejado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary-gray">Horas Planejadas</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-blue">
                {dashboardMetrics.plannedHours.toLocaleString()}h
              </div>
              <p className="text-xs text-gray-500 mt-1">Meta estabelecida</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary-gray">Horas de Falta</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{dashboardMetrics.absenceHours}h</div>
              <p className="text-xs text-gray-500 mt-1">Faltas e atrasos</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 10 Setores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary-blue" />
                <span>Top 5 Setores - Horas Extras/Faltas</span>
              </CardTitle>
              <CardDescription>Setores com maior incidência de horas extras e faltas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topSectorsData.map((sector, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{sector.sector}</span>
                      <Badge variant={sector.type === "Direto" ? "default" : "secondary"}>{sector.type}</Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {sector.overtimeHours}h extras | {sector.absenceHours}h faltas
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Horas Extras</span>
                        <span>{sector.overtimeHours}h</span>
                      </div>
                      <Progress value={(sector.overtimeHours / 100) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Faltas</span>
                        <span>{sector.absenceHours}h</span>
                      </div>
                      <Progress value={(sector.absenceHours / 50) * 100} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Gráfico de Rosca - % de Resultados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5 text-primary-blue" />
                <span>Distribuição de Resultados</span>
              </CardTitle>
              <CardDescription>Percentual de horas por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resultsData.map((result, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${result.color}`}></div>
                        <span className="font-medium">{result.label}</span>
                      </div>
                      <span className="text-sm font-medium">{result.value}%</span>
                    </div>
                    <Progress value={result.value} className="h-2" />
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Resumo</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">85%</p>
                    <p className="text-xs text-gray-500">Cumpridas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">10%</p>
                    <p className="text-xs text-gray-500">Extras</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">5%</p>
                    <p className="text-xs text-gray-500">Faltas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Funcionários com Mais Faltas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Funcionários com Mais Faltas</span>
            </CardTitle>
            <CardDescription>Top 5 funcionários com maior número de horas de falta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employeesWithMostAbsences.map((employee, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                      <span className="text-sm font-medium text-red-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{employee.name}</p>
                      <p className="text-sm text-gray-500">{employee.company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{employee.absenceHours}h</p>
                    <p className="text-xs text-gray-500">de faltas</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
