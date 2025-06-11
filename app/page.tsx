"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Target, TrendingUp, Users, BarChart3, FileText, UserPlus, Monitor } from "lucide-react"
import Link from "next/link"

// Mock data para os cards de resumo
const summaryData = {
  horasFeitas: 1240,
  horasPlanejadas: 1320,
  percentualAtendimento: 93.9,
  ticketMedio: 8.5,
}

const quickActions = [
  {
    title: "Cadastros",
    description: "Gerencie empresas, funcionários e configurações",
    icon: UserPlus,
    href: "/cadastros/empresas",
    color: "bg-blue-500",
  },
  {
    title: "Monitoramento",
    description: "Acompanhe o status das jornadas em tempo real",
    icon: Monitor,
    href: "/monitoramento",
    color: "bg-green-500",
  },
  {
    title: "Dashboards",
    description: "Visualize indicadores e gráficos analíticos",
    icon: BarChart3,
    href: "/dashboards",
    color: "bg-purple-500",
  },
  {
    title: "Relatórios",
    description: "Gere relatórios detalhados em PDF ou Excel",
    icon: FileText,
    href: "/relatorios",
    color: "bg-orange-500",
  },
]

export default function HomePage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Título da página */}
        <div>
          <h1 className="text-3xl font-bold text-primary-red">Dashboard Principal</h1>
          <p className="text-primary-gray mt-2">Visão geral do sistema de controle de jornada de trabalho</p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary-gray">Horas Feitas</CardTitle>
              <Clock className="h-4 w-4 text-primary-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-blue">{summaryData.horasFeitas.toLocaleString()}h</div>
              <p className="text-xs text-gray-500 mt-1">Total de horas trabalhadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary-gray">Horas Planejadas</CardTitle>
              <Target className="h-4 w-4 text-primary-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-blue">
                {summaryData.horasPlanejadas.toLocaleString()}h
              </div>
              <p className="text-xs text-gray-500 mt-1">Meta estabelecida</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary-gray">% Atendimento</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summaryData.percentualAtendimento}%</div>
              <p className="text-xs text-gray-500 mt-1">Eficiência atual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary-gray">Ticket Médio</CardTitle>
              <Users className="h-4 w-4 text-primary-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-blue">{summaryData.ticketMedio}h</div>
              <p className="text-xs text-gray-500 mt-1">Horas por funcionário</p>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Ações Rápidas */}
        <div>
          <h2 className="text-xl font-semibold text-primary-gray mb-4">Acesso Rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Card key={action.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg text-primary-gray">{action.title}</CardTitle>
                    <CardDescription className="text-sm">{action.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={action.href}>
                      <Button className="w-full bg-primary-blue hover:bg-primary-blue/90">Acessar</Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Seção de Estatísticas Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary-red">Resumo Mensal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-primary-gray">Funcionários Ativos</span>
                <span className="font-semibold text-primary-blue">156</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-primary-gray">Empresas Cadastradas</span>
                <span className="font-semibold text-primary-blue">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-primary-gray">Centros de Custo</span>
                <span className="font-semibold text-primary-blue">28</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-primary-gray">Turnos Configurados</span>
                <span className="font-semibold text-primary-blue">8</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary-red">Alertas e Notificações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>5 funcionários</strong> com horas extras acima do limite
                </p>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>3 funcionários</strong> com faltas não justificadas
                </p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Relatório mensal</strong> pronto para geração
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
