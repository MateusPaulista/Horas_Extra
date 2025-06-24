"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DateFilter } from "@/components/ui/date-filter"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  type TooltipProps,
} from "recharts"

// Dados para os gráficos
const setoresHorasExtras = [
  { name: "Produção", horas: 120 },
  { name: "Admin", horas: 85 },
  { name: "Logística", horas: 95 },
  { name: "Comercial", horas: 65 },
  { name: "TI", horas: 110 },
]

const setoresFaltas = [
  { name: "Produção", horas: 45 },
  { name: "Admin", horas: 30 },
  { name: "Logística", horas: 60 },
  { name: "Comercial", horas: 25 },
  { name: "TI", horas: 15 },
]

const distribuicaoHoras = [
  { name: "Trabalhadas", value: 4320 },
  { name: "Extras", value: 320 },
  { name: "Faltas", value: 180 },
  { name: "Justificadas", value: 120 },
]

const COLORS = ["#0C9ABE", "#BE3E37", "#4A5C60", "#82ca9d"]

const funcionariosFaltas = [
  { name: "João Silva", setor: "Produção", horas: 12 },
  { name: "Maria Oliveira", setor: "Admin", horas: 10 },
  { name: "Carlos Santos", setor: "Logística", horas: 8 },
  { name: "Ana Pereira", setor: "Comercial", horas: 7 },
  { name: "Roberto Almeida", setor: "TI", horas: 6 },
]

const tendenciaHoras = [
  { name: "Jan", planejadas: 1800, realizadas: 1750 },
  { name: "Fev", planejadas: 1700, realizadas: 1680 },
  { name: "Mar", planejadas: 1900, realizadas: 1850 },
  { name: "Abr", planejadas: 1800, realizadas: 1820 },
  { name: "Mai", planejadas: 1850, realizadas: 1900 },
  { name: "Jun", planejadas: 1950, realizadas: 1980 },
]

// Componente personalizado para o tooltip
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow-md">
        <p className="font-medium">{`${label}`}</p>
        <p className="text-clockflow-blue">{`${payload[0].name}: ${payload[0].value} horas`}</p>
      </div>
    )
  }

  return null
}

// Componente para renderizar o label do gráfico de pizza
const renderCustomizedLabel = ({ name, percent }: any) => {
  return `${name}: ${(percent * 100).toFixed(0)}%`
}

export default function DashboardsPage() {
  const [activeBar, setActiveBar] = useState<string | null>(null)
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null)
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)

  const handleBarClick = (data: any) => {
    setActiveBar(activeBar === data.name ? null : data.name)
  }

  const handlePieEnter = (_, index: number) => {
    setActivePieIndex(index)
  }

  const handlePieLeave = () => {
    setActivePieIndex(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-clockflow-blue">Dashboards</h2>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-clockflow-blue">Filtros</CardTitle>
          <CardDescription>Selecione os filtros para visualizar os dados</CardDescription>
        </CardHeader>
        <CardContent className="py-2">
          <div className="grid gap-3 md:grid-cols-5">
            <div className="space-y-1">
              <Label htmlFor="empresa">Empresa</Label>
              <Select>
                <SelectTrigger id="empresa" className="h-8">
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="matriz">Matriz</SelectItem>
                  <SelectItem value="filial-sp">Filial SP</SelectItem>
                  <SelectItem value="filial-rj">Filial RJ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="centro-custo">Centro de Custo</Label>
              <Select>
                <SelectTrigger id="centro-custo" className="h-8">
                  <SelectValue placeholder="Selecione o centro de custo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="producao">Produção</SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="turno">Turno</Label>
              <Select>
                <SelectTrigger id="turno" className="h-8">
                  <SelectValue placeholder="Selecione o turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="manha">Manhã</SelectItem>
                  <SelectItem value="tarde">Tarde</SelectItem>
                  <SelectItem value="noite">Noite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Data inicial</Label>
              <DateFilter value={dateFrom} onChange={setDateFrom} placeholder="Selecione" className="h-8" />
            </div>
            <div className="space-y-1">
              <Label>Data final</Label>
              <DateFilter value={dateTo} onChange={setDateTo} placeholder="Selecione" className="h-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="indicadores" className="space-y-4">
        <TabsList>
          <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
          <TabsTrigger value="tendencias">Tendências</TabsTrigger>
        </TabsList>
        <TabsContent value="indicadores" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-clockflow-blue">Horas Totais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.320h</div>
                <p className="text-xs text-muted-foreground">+5% em relação ao período anterior</p>
                <div className="mt-4 h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 w-[75%] rounded-full bg-clockflow-blue" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-clockflow-blue">Horas Extras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">320h</div>
                <p className="text-xs text-muted-foreground">-2% em relação ao período anterior</p>
                <div className="mt-4 h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 w-[15%] rounded-full bg-clockflow-blue" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-clockflow-blue">Horas Planejadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.500h</div>
                <p className="text-xs text-muted-foreground">+3% em relação ao período anterior</p>
                <div className="mt-4 h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 w-[80%] rounded-full bg-clockflow-blue" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-clockflow-blue">Horas de Falta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">180h</div>
                <p className="text-xs text-muted-foreground">-10% em relação ao período anterior</p>
                <div className="mt-4 h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 w-[8%] rounded-full bg-[#BE3E37]" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="graficos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-clockflow-blue">Top 10 Setores com Horas Extras</CardTitle>
                <CardDescription>Setores com maior quantidade de horas extras</CardDescription>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={setoresHorasExtras}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="horas" name="Horas Extras" fill="#0C9ABE" onClick={handleBarClick} cursor="pointer">
                      {setoresHorasExtras.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={activeBar === entry.name ? "#BE3E37" : "#0C9ABE"}
                          opacity={activeBar && activeBar !== entry.name ? 0.5 : 1}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-clockflow-blue">Top 10 Setores com Faltas</CardTitle>
                <CardDescription>Setores com maior quantidade de faltas</CardDescription>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={setoresFaltas}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="horas" name="Horas de Falta" fill="#BE3E37" onClick={handleBarClick} cursor="pointer">
                      {setoresFaltas.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={activeBar === entry.name ? "#0C9ABE" : "#BE3E37"}
                          opacity={activeBar && activeBar !== entry.name ? 0.5 : 1}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-clockflow-blue">Distribuição de Horas</CardTitle>
                <CardDescription>Distribuição percentual das horas trabalhadas</CardDescription>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribuicaoHoras}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={renderCustomizedLabel}
                      onMouseEnter={handlePieEnter}
                      onMouseLeave={handlePieLeave}
                    >
                      {distribuicaoHoras.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          opacity={activePieIndex !== null && activePieIndex !== index ? 0.5 : 1}
                          stroke={activePieIndex === index ? "#fff" : "none"}
                          strokeWidth={activePieIndex === index ? 2 : 0}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-clockflow-blue">Funcionários com Mais Faltas</CardTitle>
                <CardDescription>Lista dos funcionários com maior número de faltas</CardDescription>
              </CardHeader>
              <CardContent className="h-56 overflow-auto">
                <div className="space-y-3">
                  {funcionariosFaltas.map((funcionario, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-clockflow-blue text-white flex items-center justify-center">
                          {funcionario.name.substring(0, 1)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{funcionario.name}</p>
                          <p className="text-xs text-muted-foreground">{funcionario.setor}</p>
                        </div>
                      </div>
                      <div className="font-medium text-[#BE3E37]">{funcionario.horas}h</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="tendencias" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-clockflow-blue">Tendência de Horas</CardTitle>
              <CardDescription>Comparação entre horas planejadas e realizadas nos últimos meses</CardDescription>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={tendenciaHoras}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="planejadas"
                    name="Horas Planejadas"
                    stroke="#0C9ABE"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="realizadas"
                    name="Horas Realizadas"
                    stroke="#BE3E37"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
