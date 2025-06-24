import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Users, LayoutGrid, Clock, CalendarClock, ClipboardCheck } from "lucide-react"
import Link from "next/link"

export default function CadastrosPage() {
  const cadastros = [
    {
      title: "Empresas",
      description: "Gerencie o cadastro de empresas",
      icon: Building2,
      href: "/cadastros/empresas",
    },
    {
      title: "Funcionários",
      description: "Gerencie o cadastro de funcionários",
      icon: Users,
      href: "/cadastros/funcionarios",
    },
    {
      title: "Centro de Custo",
      description: "Gerencie os centros de custo",
      icon: LayoutGrid,
      href: "/cadastros/centro-custo",
    },
    {
      title: "Turnos",
      description: "Gerencie os turnos de trabalho",
      icon: Clock,
      href: "/cadastros/turnos",
    },
    {
      title: "Planejamento",
      description: "Gerencie o planejamento de horas",
      icon: CalendarClock,
      href: "/cadastros/planejamento",
    },
    {
      title: "Batida de Ponto",
      description: "Registre ou importe batidas de ponto",
      icon: ClipboardCheck,
      href: "/cadastros/batida-ponto",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#0c9abe]">Cadastros</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cadastros.map((cadastro) => (
          <Card key={cadastro.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold text-[#0c9abe]">{cadastro.title}</CardTitle>
              <cadastro.icon className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription>{cadastro.description}</CardDescription>
              <Button asChild className="w-full">
                <Link href={cadastro.href}>Acessar</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
