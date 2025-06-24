"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Bell, Save, History, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useParametros } from "@/hooks/use-parametros"
import { useCentroCustos } from "@/hooks/use-centro-custos"
import { supabase } from "@/lib/supabase"

// Interface para a configuração dos parâmetros
interface ConfiguracaoParametro {
  horasExtraDia: number
  horasExtraMes: number
  horasAtraso: number
  notificarEmail: boolean
  notificarSistema: boolean
  frequenciaNotificacao: string
  centrosCustoAtivos: number[]
}

export default function ConfiguracoesPage() {
  const { toast } = useToast()
  const { parametros, loading, createParametro, updateParametro, getParametroAtivo, getParametrosUsuario } =
    useParametros()
  const { centrosCusto } = useCentroCustos()

  // Estados para os parâmetros
  const [userId, setUserId] = useState<string>("")
  const [parametroAtual, setParametroAtual] = useState<any>(null)

  // Estados para os sliders
  const [horasExtraDia, setHorasExtraDia] = useState([2])
  const [horasExtraMes, setHorasExtraMes] = useState([40])
  const [horasAtraso, setHorasAtraso] = useState([1])

  // Estados para configurações de notificações
  const [centrosCustoSelecionados, setCentrosCustoSelecionados] = useState<number[]>([])

  // Estados para configurações gerais
  const [notificarEmail, setNotificarEmail] = useState(true)
  const [notificarSistema, setNotificarSistema] = useState(true)
  const [frequenciaNotificacao, setFrequenciaNotificacao] = useState("diaria")

  // Estado para o diálogo de histórico
  const [isHistoricoDialogOpen, setIsHistoricoDialogOpen] = useState(false)
  const [parametroSelecionado, setParametroSelecionado] = useState<any>(null)

  // Carregar usuário atual e parâmetros
  useEffect(() => {
    const loadUserAndParams = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)

        // Buscar parâmetro ativo do usuário
        const parametroAtivo = getParametroAtivo(user.id)
        if (parametroAtivo && parametroAtivo.configuracao) {
          const config = parametroAtivo.configuracao as ConfiguracaoParametro
          setParametroAtual(parametroAtivo)
          setHorasExtraDia([config.horasExtraDia || 2])
          setHorasExtraMes([config.horasExtraMes || 40])
          setHorasAtraso([config.horasAtraso || 1])
          setNotificarEmail(config.notificarEmail ?? true)
          setNotificarSistema(config.notificarSistema ?? true)
          setFrequenciaNotificacao(config.frequenciaNotificacao || "diaria")
          setCentrosCustoSelecionados(config.centrosCustoAtivos || [])
        }
      }
    }

    if (!loading) {
      loadUserAndParams()
    }
  }, [loading, parametros, getParametroAtivo])

  // Função para alternar o estado ativo de um centro de custo
  const toggleCentroCusto = (id: number) => {
    setCentrosCustoSelecionados((prev) => (prev.includes(id) ? prev.filter((ccId) => ccId !== id) : [...prev, id]))
  }

  // Função para salvar configurações
  const salvarConfiguracoes = async () => {
    if (!userId) {
      toast({
        title: "Erro",
        description: "Usuário não identificado",
        variant: "destructive",
      })
      return
    }

    const configuracao: ConfiguracaoParametro = {
      horasExtraDia: horasExtraDia[0],
      horasExtraMes: horasExtraMes[0],
      horasAtraso: horasAtraso[0],
      notificarEmail,
      notificarSistema,
      frequenciaNotificacao,
      centrosCustoAtivos: centrosCustoSelecionados,
    }

    const novoParametro = {
      user_id: userId,
      nome: `Configuração ${new Date().toLocaleDateString("pt-BR")}`,
      configuracao,
      descricao: `Parâmetros salvos em ${new Date().toLocaleString("pt-BR")}`,
      ativo: true,
    }

    try {
      const parametroCriado = await createParametro(novoParametro)
      setParametroAtual(parametroCriado)

      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram salvas com sucesso como uma nova versão.",
      })
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
    }
  }

  // Função para visualizar detalhes de um parâmetro histórico
  const visualizarParametro = (parametro: any) => {
    setParametroSelecionado(parametro)
    setIsHistoricoDialogOpen(true)
  }

  // Função para restaurar um parâmetro histórico
  const restaurarParametro = (parametro: any) => {
    if (parametro.configuracao) {
      const config = parametro.configuracao as ConfiguracaoParametro
      setHorasExtraDia([config.horasExtraDia || 2])
      setHorasExtraMes([config.horasExtraMes || 40])
      setHorasAtraso([config.horasAtraso || 1])
      setNotificarEmail(config.notificarEmail ?? true)
      setNotificarSistema(config.notificarSistema ?? true)
      setFrequenciaNotificacao(config.frequenciaNotificacao || "diaria")
      setCentrosCustoSelecionados(config.centrosCustoAtivos || [])
    }

    setIsHistoricoDialogOpen(false)
    setParametroSelecionado(null)

    toast({
      title: "Parâmetros restaurados",
      description: `Os parâmetros foram restaurados. Clique em Salvar para aplicar as mudanças.`,
    })
  }

  const parametrosUsuario = userId ? getParametrosUsuario(userId) : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando configurações...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#0C9FC0]">Parametrização</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsHistoricoDialogOpen(true)}>
            <History className="mr-2 h-4 w-4" />
            Histórico de Parâmetros
          </Button>
          <Button onClick={salvarConfiguracoes}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Configurações
          </Button>
        </div>
      </div>

      {parametroAtual && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#0C9FC0]">Parâmetros Ativos</CardTitle>
                <CardDescription>
                  {parametroAtual.nome} - Atualizado em {new Date(parametroAtual.updated_at).toLocaleString("pt-BR")}
                </CardDescription>
              </div>
              <Badge className="bg-[#0C9FC0]">Ativo</Badge>
            </div>
          </CardHeader>
        </Card>
      )}

      <Tabs defaultValue="limites" className="space-y-4">
        <TabsList>
          <TabsTrigger value="limites">Limites</TabsTrigger>
          <TabsTrigger value="notificacoes">Configurações de Notificações</TabsTrigger>
          <TabsTrigger value="centros-custo">Centros de Custo</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações Gerais</TabsTrigger>
        </TabsList>

        {/* Aba de Limites */}
        <TabsContent value="limites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0C9FC0]">Limites de Horas</CardTitle>
              <CardDescription>Configure os limites de horas extras e atrasos para os funcionários</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="horas-extra-dia">Limite de Horas Extras por Dia</Label>
                    <span className="font-medium text-[#0C9FC0]">{horasExtraDia[0]} horas</span>
                  </div>
                  <Slider
                    id="horas-extra-dia"
                    min={0}
                    max={4}
                    step={0.5}
                    value={horasExtraDia}
                    onValueChange={setHorasExtraDia}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0h</span>
                    <span>2h</span>
                    <span>4h</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="horas-extra-mes">Limite de Horas Extras por Mês</Label>
                    <span className="font-medium text-[#0C9FC0]">{horasExtraMes[0]} horas</span>
                  </div>
                  <Slider
                    id="horas-extra-mes"
                    min={0}
                    max={150}
                    step={5}
                    value={horasExtraMes}
                    onValueChange={setHorasExtraMes}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0h</span>
                    <span>75h</span>
                    <span>150h</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="horas-atraso">Limite de Horas de Atraso por Dia</Label>
                    <span className="font-medium text-[#0C9FC0]">{horasAtraso[0]} horas</span>
                  </div>
                  <Slider
                    id="horas-atraso"
                    min={0}
                    max={2}
                    step={0.25}
                    value={horasAtraso}
                    onValueChange={setHorasAtraso}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0h</span>
                    <span>1h</span>
                    <span>2h</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Configurações de Notificações */}
        <TabsContent value="notificacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0C9FC0]">Configurações de Notificações</CardTitle>
              <CardDescription>Configure como deseja receber as notificações de excedentes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificar-email">Receber notificações por e-mail</Label>
                    <p className="text-sm text-muted-foreground">Receba alertas de excedentes de horas por e-mail</p>
                  </div>
                  <Switch id="notificar-email" checked={notificarEmail} onCheckedChange={setNotificarEmail} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificar-sistema">Receber notificações no sistema</Label>
                    <p className="text-sm text-muted-foreground">Receba alertas de excedentes de horas no sistema</p>
                  </div>
                  <Switch id="notificar-sistema" checked={notificarSistema} onCheckedChange={setNotificarSistema} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequencia-notificacao">Frequência de notificações</Label>
                  <Select value={frequenciaNotificacao} onValueChange={setFrequenciaNotificacao}>
                    <SelectTrigger id="frequencia-notificacao" className="bg-white">
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="diaria">Diária</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Centros de Custo */}
        <TabsContent value="centros-custo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0C9FC0]">Centros de Custo</CardTitle>
              <CardDescription>Selecione os centros de custo para receber notificações de excedentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {centrosCusto.map((centro) => (
                  <div key={centro.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`centro-${centro.id}`}
                        checked={centrosCustoSelecionados.includes(centro.id)}
                        onCheckedChange={() => toggleCentroCusto(centro.id)}
                      />
                      <Label htmlFor={`centro-${centro.id}`} className="font-medium">
                        {centro.codigo} - {centro.nome}
                      </Label>
                    </div>
                    <Badge variant={centrosCustoSelecionados.includes(centro.id) ? "default" : "outline"}>
                      {centrosCustoSelecionados.includes(centro.id) ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Configurações Gerais */}
        <TabsContent value="configuracoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0C9FC0]">Informações Adicionais</CardTitle>
              <CardDescription>Informações sobre o sistema de parametrização</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg border bg-muted/50">
                  <AlertCircle className="h-6 w-6 text-[#0C9FC0] flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Sobre o versionamento de parâmetros</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ao salvar novas configurações, uma nova versão de parâmetros será criada e automaticamente
                      definida como ativa. Versões anteriores são mantidas para histórico e podem ser consultadas ou
                      restauradas a qualquer momento.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg border bg-muted/50">
                  <Bell className="h-6 w-6 text-[#0C9FC0] flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Sobre as notificações</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      As notificações são geradas com base nos parâmetros ativos. Você pode visualizar todas as
                      notificações clicando no ícone de sino no cabeçalho do sistema.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de Histórico de Parâmetros */}
      <Dialog open={isHistoricoDialogOpen} onOpenChange={setIsHistoricoDialogOpen}>
        <DialogContent className="sm:max-w-[700px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#0C9FC0]">Histórico de Parâmetros</DialogTitle>
            <DialogDescription>Visualize e restaure versões anteriores de parâmetros</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {parametrosUsuario.map((parametro) => (
              <div
                key={parametro.id}
                className={`p-4 rounded-lg border ${parametro.ativo ? "bg-primary/5 border-primary" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{parametro.nome}</h4>
                    <p className="text-sm text-muted-foreground">
                      Criado em {new Date(parametro.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {parametro.ativo && <Badge className="bg-[#0C9FC0]">Ativo</Badge>}
                    <Button variant="outline" size="sm" onClick={() => visualizarParametro(parametro)}>
                      Detalhes
                    </Button>
                    {!parametro.ativo && (
                      <Button size="sm" onClick={() => restaurarParametro(parametro)}>
                        Restaurar
                      </Button>
                    )}
                  </div>
                </div>
                {parametro.configuracao && (
                  <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Horas Extra/Dia:</span>{" "}
                      {parametro.configuracao.horasExtraDia}h
                    </div>
                    <div>
                      <span className="text-muted-foreground">Horas Extra/Mês:</span>{" "}
                      {parametro.configuracao.horasExtraMes}h
                    </div>
                    <div>
                      <span className="text-muted-foreground">Horas Atraso:</span> {parametro.configuracao.horasAtraso}h
                    </div>
                  </div>
                )}
              </div>
            ))}
            {parametrosUsuario.length === 0 && (
              <div className="text-center p-4 text-muted-foreground">Nenhum parâmetro encontrado</div>
            )}
          </div>

          {parametroSelecionado && parametroSelecionado.configuracao && (
            <div className="mt-4 p-4 rounded-lg border bg-muted/50">
              <h4 className="font-medium">Detalhes: {parametroSelecionado.nome}</h4>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <span className="text-muted-foreground">Horas Extra/Dia:</span>{" "}
                    {parametroSelecionado.configuracao.horasExtraDia}h
                  </p>
                  <p>
                    <span className="text-muted-foreground">Horas Extra/Mês:</span>{" "}
                    {parametroSelecionado.configuracao.horasExtraMes}h
                  </p>
                  <p>
                    <span className="text-muted-foreground">Horas Atraso:</span>{" "}
                    {parametroSelecionado.configuracao.horasAtraso}h
                  </p>
                </div>
                <div>
                  <p>
                    <span className="text-muted-foreground">Notificar por Email:</span>{" "}
                    {parametroSelecionado.configuracao.notificarEmail ? "Sim" : "Não"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Notificar no Sistema:</span>{" "}
                    {parametroSelecionado.configuracao.notificarSistema ? "Sim" : "Não"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Frequência:</span>{" "}
                    {parametroSelecionado.configuracao.frequenciaNotificacao}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-muted-foreground">Centros de Custo Ativos:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {parametroSelecionado.configuracao.centrosCustoAtivos?.map((ccId: number) => {
                    const centro = centrosCusto.find((cc) => cc.id === ccId)
                    return centro ? (
                      <Badge key={ccId} variant="outline">
                        {centro.codigo} - {centro.nome}
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHistoricoDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
