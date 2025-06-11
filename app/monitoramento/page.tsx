"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Monitor, Edit, TrendingUp, TrendingDown, Filter } from "lucide-react"
import type { MonitoringItem, Employee, Company, CostCenter, Shift } from "@/lib/types"
import { useAuth } from "@/components/providers/auth-provider"

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
  {
    id: "3",
    registration: "FUN003",
    name: "Pedro Costa",
    companyId: "2",
    costCenterId: "3",
    shiftId: "1",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const mockMonitoringData: MonitoringItem[] = [
  {
    employee: mockEmployees[0],
    totalHours: 180,
    status: "positive",
    sectorPercentage: 85,
    companyPercentage: 92,
  },
  {
    employee: mockEmployees[1],
    totalHours: 165,
    status: "negative",
    sectorPercentage: 78,
    companyPercentage: 88,
  },
  {
    employee: mockEmployees[2],
    totalHours: 175,
    status: "positive",
    sectorPercentage: 82,
    companyPercentage: 90,
  },
]

export default function MonitoringPage() {
  const { user } = useAuth()
  const [monitoringData, setMonitoringData] = useState<MonitoringItem[]>(mockMonitoringData)
  const [filteredData, setFilteredData] = useState<MonitoringItem[]>(mockMonitoringData)
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MonitoringItem | null>(null)
  const [adjustmentData, setAdjustmentData] = useState({
    totalHours: 0,
    reason: "",
  })
  const [filters, setFilters] = useState({
    company: "all",
    sector: "all",
    shift: "all",
    status: "all",
  })

  const handleAdjustment = (item: MonitoringItem) => {
    setSelectedItem(item)
    setAdjustmentData({
      totalHours: item.totalHours,
      reason: "",
    })
    setIsAdjustDialogOpen(true)
  }

  const handleSaveAdjustment = () => {
    if (!selectedItem) return

    const updatedData = monitoringData.map((item) =>
      item.employee.id === selectedItem.employee.id
        ? {
            ...item,
            totalHours: adjustmentData.totalHours,
            status: adjustmentData.totalHours >= 176 ? "positive" : ("negative" as "positive" | "negative"),
          }
        : item,
    )

    setMonitoringData(updatedData)
    applyFilters(updatedData)

    // Log do ajuste
    console.log(`Ajuste realizado por ${user?.name}:`, {
      employee: selectedItem.employee.name,
      oldHours: selectedItem.totalHours,
      newHours: adjustmentData.totalHours,
      reason: adjustmentData.reason,
      timestamp: new Date(),
    })

    setIsAdjustDialogOpen(false)
    setSelectedItem(null)
  }

  const applyFilters = (data: MonitoringItem[] = monitoringData) => {
    let filtered = data

    if (filters.company && filters.company !== "all") {
      filtered = filtered.filter((item) => item.employee.companyId === filters.company)
    }

    if (filters.sector && filters.sector !== "all") {
      filtered = filtered.filter((item) => item.employee.costCenterId === filters.sector)
    }

    if (filters.shift && filters.shift !== "all") {
      filtered = filtered.filter((item) => item.employee.shiftId === filters.shift)
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((item) => item.status === filters.status)
    }

    setFilteredData(filtered)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    applyFilters()
  }

  const clearFilters = () => {
    setFilters({ company: "all", sector: "all", shift: "all", status: "all" })
    setFilteredData(monitoringData)
  }

  const getCompanyName = (companyId: string) => {
    return mockCompanies.find((c) => c.id === companyId)?.name || "N/A"
  }

  const getSectorName = (costCenterId: string) => {
    return mockCostCenters.find((c) => c.id === costCenterId)?.sector || "N/A"
  }

  const getShiftName = (shiftId: string) => {
    return mockShifts.find((s) => s.id === shiftId)?.name || "N/A"
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-red">Monitoramento de Jornada</h1>
            <p className="text-primary-gray mt-2">Acompanhe o status das jornadas de trabalho em tempo real</p>
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
                <Label>Setor</Label>
                <Select value={filters.sector} onValueChange={(value) => handleFilterChange("sector", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os setores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os setores</SelectItem>
                    {mockCostCenters.map((sector) => (
                      <SelectItem key={sector.id} value={sector.id}>
                        {sector.sector}
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

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="positive">Positivo</SelectItem>
                    <SelectItem value="negative">Negativo</SelectItem>
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

        {/* Tabela de Monitoramento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Monitor className="h-5 w-5 text-primary-blue" />
              <span>Status das Jornadas</span>
            </CardTitle>
            <CardDescription>
              Mostrando {filteredData.length} de {monitoringData.length} funcionário(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Horas Trabalhadas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>% Setor</TableHead>
                  <TableHead>% Empresa</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.employee.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p>{item.employee.name}</p>
                        <p className="text-sm text-gray-500">{item.employee.registration}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getCompanyName(item.employee.companyId)}</TableCell>
                    <TableCell>{getSectorName(item.employee.costCenterId)}</TableCell>
                    <TableCell>{getShiftName(item.employee.shiftId)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {item.status === "positive" ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span>{item.totalHours}h</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === "positive" ? "default" : "destructive"}>
                        {item.status === "positive" ? "Positivo" : "Negativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress value={item.sectorPercentage} className="h-2" />
                        <span className="text-xs text-gray-500">{item.sectorPercentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress value={item.companyPercentage} className="h-2" />
                        <span className="text-xs text-gray-500">{item.companyPercentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleAdjustment(item)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Ajustar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog de Ajuste */}
        <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajustar Horas Trabalhadas</DialogTitle>
              <DialogDescription>
                Realize ajustes nas horas trabalhadas de {selectedItem?.employee.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="totalHours">Total de Horas</Label>
                <Input
                  id="totalHours"
                  type="number"
                  step="0.5"
                  value={adjustmentData.totalHours}
                  onChange={(e) =>
                    setAdjustmentData((prev) => ({ ...prev, totalHours: Number.parseFloat(e.target.value) || 0 }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Motivo do Ajuste</Label>
                <Input
                  id="reason"
                  value={adjustmentData.reason}
                  onChange={(e) => setAdjustmentData((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Descreva o motivo do ajuste..."
                  required
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Responsável pelo ajuste:</strong> {user?.name}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Data/Hora:</strong> {new Date().toLocaleString("pt-BR")}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveAdjustment} className="bg-primary-blue hover:bg-primary-blue/90">
                Salvar Ajuste
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
