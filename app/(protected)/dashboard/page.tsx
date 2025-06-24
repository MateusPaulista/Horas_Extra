import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { BarChart3, ClipboardList, Clock, FileText } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#0C9FC0]">Horas Feitas</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.248h</div>
            <p className="text-xs text-muted-foreground">+20% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#0C9FC0]">Horas Planejadas</CardTitle>
            <ClipboardList className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.320h</div>
            <p className="text-xs text-muted-foreground">+5% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#0C9FC0]">% Atendimento</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.5%</div>
            <p className="text-xs text-muted-foreground">+15% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#0C9FC0]">Ticket Médio</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42h</div>
            <p className="text-xs text-muted-foreground">-2% em relação ao mês anterior</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="cadastros" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cadastros">Cadastros</TabsTrigger>
          <TabsTrigger value="monitoramento">Monitoramento</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
        </TabsList>
        <TabsContent value="cadastros" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0C9FC0]">Empresas</CardTitle>
                <CardDescription>Gerencie o cadastro de empresas</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end">
                <Button asChild>
                  <Link href="/cadastros/empresas">Acessar</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0C9FC0]">Funcionários</CardTitle>
                <CardDescription>Gerencie o cadastro de funcionários</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end">
                <Button asChild>
                  <Link href="/cadastros/funcionarios">Acessar</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0C9FC0]">Centro de Custo</CardTitle>
                <CardDescription>Gerencie os centros de custo</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end">
                <Button asChild>
                  <Link href="/cadastros/centro-custo">Acessar</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0C9FC0]">Turnos</CardTitle>
                <CardDescription>Gerencie os turnos de trabalho</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end">
                <Button asChild>
                  <Link href="/cadastros/turnos">Acessar</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0C9FC0]">Planejamento</CardTitle>
                <CardDescription>Gerencie o planejamento de horas</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end">
                <Button asChild>
                  <Link href="/cadastros/planejamento">Acessar</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0C9FC0]">Batida de Ponto</CardTitle>
                <CardDescription>Registre ou importe batidas de ponto</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end">
                <Button asChild>
                  <Link href="/cadastros/batida-ponto">Acessar</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="monitoramento" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0C9FC0]">Monitoramento de Horas</CardTitle>
              <CardDescription>Visualize e gerencie as horas trabalhadas</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end">
              <Button asChild>
                <Link href="/monitoramento">Acessar</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="dashboards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0C9FC0]">Dashboards Analíticos</CardTitle>
              <CardDescription>Visualize indicadores e gráficos de desempenho</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end">
              <Button asChild>
                <Link href="/dashboards">Acessar</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
