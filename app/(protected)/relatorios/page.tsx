"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileDown, FileText, Printer } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { DateFilter } from "@/components/ui/date-filter"

export default function RelatoriosPage() {
  const [tipoRelatorio, setTipoRelatorio] = useState<string>("faltas")
  const [formato, setFormato] = useState<string>("pdf")
  const [isGenerating, setIsGenerating] = useState(false)
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
  const { toast } = useToast()

  const handleGenerateReport = () => {
    setIsGenerating(true)

    // Simulação de geração de relatório
    setTimeout(() => {
      setIsGenerating(false)
      toast({
        title: "Relatório gerado com sucesso",
        description: `O relatório de ${getTipoRelatorioLabel(tipoRelatorio)} foi gerado em formato ${formato.toUpperCase()}.`,
      })
    }, 2000)
  }

  const getTipoRelatorioLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      faltas: "Horas de Falta e Atraso",
      extras: "Horas Extras",
      planejamento: "Planejamento vs Realizado",
      funcionarios: "Funcionários",
      empresas: "Empresas",
      centros: "Centros de Custo",
      turnos: "Turnos",
      batidas: "Batidas de Ponto",
      monitoramento: "Monitoramento de Horas",
      dashboard: "Dashboard Executivo",
    }
    return tipos[tipo] || tipo
  }

  const relatoriosDisponiveis = [
    {
      categoria: "Horas",
      relatorios: [
        { id: "faltas", nome: "Horas de Falta e Atraso", descricao: "Relatório detalhado de faltas e atrasos" },
        { id: "extras", nome: "Horas Extras", descricao: "Relatório de horas extras por funcionário" },
        {
          id: "planejamento",
          nome: "Planejamento vs Realizado",
          descricao: "Comparativo entre horas planejadas e realizadas",
        },
        { id: "monitoramento", nome: "Monitoramento de Horas", descricao: "Relatório completo de monitoramento" },
      ],
    },
    {
      categoria: "Cadastros",
      relatorios: [
        { id: "funcionarios", nome: "Funcionários", descricao: "Lista completa de funcionários cadastrados" },
        { id: "empresas", nome: "Empresas", descricao: "Lista de empresas e estabelecimentos" },
        { id: "centros", nome: "Centros de Custo", descricao: "Relatório de centros de custo" },
        { id: "turnos", nome: "Turnos", descricao: "Configuração de turnos de trabalho" },
        { id: "batidas", nome: "Batidas de Ponto", descricao: "Histórico de batidas de ponto" },
      ],
    },
    {
      categoria: "Executivo",
      relatorios: [
        { id: "dashboard", nome: "Dashboard Executivo", descricao: "Relatório executivo com indicadores principais" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-clockflow-blue">Relatórios</h2>
      </div>

      <Tabs defaultValue="gerar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gerar">Gerar Relatório</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="gerar" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-clockflow-blue">Configuração do Relatório</CardTitle>
                <CardDescription>Configure os parâmetros para gerar o relatório</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo-relatorio">Tipo de Relatório</Label>
                  <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
                    <SelectTrigger id="tipo-relatorio">
                      <SelectValue placeholder="Selecione o tipo de relatório" />
                    </SelectTrigger>
                    <SelectContent>
                      {relatoriosDisponiveis.map((categoria) => (
                        <div key={categoria.categoria}>
                          <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                            {categoria.categoria}
                          </div>
                          {categoria.relatorios.map((relatorio) => (
                            <SelectItem key={relatorio.id} value={relatorio.id}>
                              {relatorio.nome}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data inicial</Label>
                    <DateFilter value={dateFrom} onChange={setDateFrom} placeholder="Selecione a data inicial" />
                  </div>
                  <div className="space-y-2">
                    <Label>Data final</Label>
                    <DateFilter value={dateTo} onChange={setDateTo} placeholder="Selecione a data final" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa</Label>
                  <Select>
                    <SelectTrigger id="empresa">
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as empresas</SelectItem>
                      <SelectItem value="matriz">Matriz</SelectItem>
                      <SelectItem value="filial-sp">Filial SP</SelectItem>
                      <SelectItem value="filial-rj">Filial RJ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="centro-custo">Centro de Custo</Label>
                  <Select>
                    <SelectTrigger id="centro-custo">
                      <SelectValue placeholder="Selecione o centro de custo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os centros</SelectItem>
                      <SelectItem value="producao">Produção</SelectItem>
                      <SelectItem value="administrativo">Administrativo</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formato">Formato</Label>
                  <Select value={formato} onValueChange={setFormato}>
                    <SelectTrigger id="formato">
                      <SelectValue placeholder="Selecione o formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="w-full bg-clockflow-blue hover:bg-clockflow-blue/90"
                >
                  {isGenerating ? (
                    "Gerando..."
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4" />
                      Gerar Relatório
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-clockflow-blue">Relatórios Disponíveis</CardTitle>
                <CardDescription>Lista de todos os relatórios disponíveis no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {relatoriosDisponiveis.map((categoria) => (
                    <div key={categoria.categoria}>
                      <h4 className="font-medium text-clockflow-blue mb-2">{categoria.categoria}</h4>
                      <div className="space-y-2">
                        {categoria.relatorios.map((relatorio) => (
                          <div
                            key={relatorio.id}
                            className={`p-3 border rounded-md cursor-pointer transition-colors ${
                              tipoRelatorio === relatorio.id
                                ? "border-clockflow-blue bg-clockflow-blue/10"
                                : "border-border hover:border-clockflow-blue/50"
                            }`}
                            onClick={() => setTipoRelatorio(relatorio.id)}
                          >
                            <div className="flex items-start space-x-2">
                              <FileText className="h-4 w-4 mt-0.5 text-clockflow-blue" />
                              <div>
                                <p className="text-sm font-medium">{relatorio.nome}</p>
                                <p className="text-xs text-muted-foreground">{relatorio.descricao}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-clockflow-blue">Histórico de Relatórios</CardTitle>
              <CardDescription>Relatórios gerados anteriormente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    nome: "Horas de Falta e Atraso",
                    data: "15/12/2023",
                    formato: "PDF",
                    tamanho: "2.3 MB",
                  },
                  {
                    nome: "Horas Extras",
                    data: "14/12/2023",
                    formato: "Excel",
                    tamanho: "1.8 MB",
                  },
                  {
                    nome: "Dashboard Executivo",
                    data: "13/12/2023",
                    formato: "PDF",
                    tamanho: "3.1 MB",
                  },
                  {
                    nome: "Funcionários",
                    data: "12/12/2023",
                    formato: "CSV",
                    tamanho: "0.5 MB",
                  },
                ].map((relatorio, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-clockflow-blue" />
                      <div>
                        <p className="text-sm font-medium">{relatorio.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {relatorio.data} • {relatorio.formato} • {relatorio.tamanho}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon">
                        <FileDown className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Printer className="h-4 w-4" />
                        <span className="sr-only">Imprimir</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
