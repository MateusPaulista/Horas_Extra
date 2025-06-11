// Tipos principais do sistema ClockFlow

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "user"
  createdAt: Date
  updatedAt: Date
}

export interface Company {
  id: string
  code: string
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
}

export interface CostCenter {
  id: string
  code: string
  sector: string
  companyId: string
  company?: Company
  createdAt: Date
  updatedAt: Date
}

export interface Shift {
  id: string
  name: string
  startTime: string
  endTime: string
  breakTime: number // em minutos
  createdAt: Date
  updatedAt: Date
}

export interface Employee {
  id: string
  registration: string
  name: string
  email?: string
  companyId: string
  company?: Company
  costCenterId: string
  costCenter?: CostCenter
  shiftId: string
  shift?: Shift
  photoUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Planning {
  id: string
  employeeId: string
  employee?: Employee
  month: string // formato YYYY-MM
  plannedHours: number
  workedHours: number
  overtimeHours: number
  absenceHours: number
  createdAt: Date
  updatedAt: Date
}

export interface TimeEntry {
  id: string
  employeeId: string
  employee?: Employee
  date: Date
  entries: string[] // array com até 8 horários
  totalHours: number
  status: "positive" | "negative"
  createdBy: string
  updatedBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface DashboardData {
  totalHours: number
  plannedHours: number
  overtimeHours: number
  absenceHours: number
  attendancePercentage: number
  averageTicket: number
}

export interface MonitoringItem {
  employee: Employee
  totalHours: number
  status: "positive" | "negative"
  sectorPercentage: number
  companyPercentage: number
}

export interface Parametrizador {
  id: number
  chave: string
  valor: string
  descricao?: string
  tipo: "string" | "number" | "boolean" | "email"
  categoria: string
  created_at: Date
  updated_at: Date
}
