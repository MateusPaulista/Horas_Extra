"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, Trash2, Filter } from "lucide-react"
import { Label } from "@/components/ui/label"
import { DateFilter } from "@/components/ui/date-filter"
import { useNotificacoes } from "@/hooks/use-notificacoes"
import { useState } from "react"

export default function NotificacoesPage() {
  const { notificacoes, loading, marcarComoLida, marcarTodasComoLidas, excluirNotificacao } = useNotificacoes()

  const [filtroTipo, setFiltroTipo] = useState<string>("all")
  const [filtroCategoria, setFiltroCategoria] = useState<string>("all")
  const [filtroStatus, setFiltroStatus] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "info":
        return "bg-blue-100 text-blue-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "success":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "info":
        return "ℹ️"
      case "warning":
        return "⚠️"
      case "error":
        return "❌"
      case "success":
        return "✅"
      default:
        return "📢"
    }
  }

  // Filtrar notificações
  const notificacoesFiltradas = notificacoes.filter((notif) => {
    const matchesTipo = filtroTipo === "all" || notif.tipo === filtroTipo
    const matchesCategoria = filtroCategoria === "all" || notif.categoria === filtroCategoria
    const matchesStatus = filtroStatus === "all" || (filtroStatus === "lida" ? notif.lida : !notif.lida)
    const matchesDateFrom = !dateFrom || new Date(notif.data_envio) >= dateFrom
    const matchesDateTo = !dateTo || new Date(notif.data_envio) <= dateTo

    return matchesTipo && matchesCategoria && matchesStatus && matchesDateFrom && matchesDateTo
  })

  // Ordenar por data (mais recentes primeiro)
  const notificacoesOrdenadas = [...notificacoesFiltradas].sort(
    (a, b) => new Date(b.data_envio).getTime() - new Date(a.data_envio).getTime(),
  )

  // Obter categorias únicas
  const categorias = Array.from(new Set(notificacoes.map((notif) => notif.categoria)))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clockflow-blue mx-auto mb-4"></div>
          <p>Carregando notificações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-clockflow-blue">Notificações</h2>
        <Button
          onClick={marcarTodasComoLidas}
          variant="outline"
          className="border-clockflow-blue text-clockflow-blue hover:bg-clockflow-blue hover:text-white"
        >
          <Check className="mr-2 h-4 w-4" />
          Marcar todas como lidas
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-clockflow-blue flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros
          </CardTitle>
          <CardDescription>Filtre as notificações por tipo, categoria e período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="info">Informação</SelectItem>
                  <SelectItem value="warning">Aviso</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="lida">Lidas</SelectItem>
                  <SelectItem value="nao-lida">Não lidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data inicial</Label>
              <DateFilter value={dateFrom} onChange={setDateFrom} placeholder="Data inicial" />
            </div>
            <div className="space-y-2">
              <Label>Data final</Label>
              <DateFilter value={dateTo} onChange={setDateTo} placeholder="Data final" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-clockflow-blue flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Lista de Notificações ({notificacoesOrdenadas.length})
          </CardTitle>
          <CardDescription>Visualize e gerencie suas notificações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {notificacoesOrdenadas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Nenhuma notificação encontrada</p>
              </div>
            ) : (
              notificacoesOrdenadas.map((notificacao) => (
                <div
                  key={notificacao.id}
                  className={`p-3 border rounded-lg transition-colors ${
                    notificacao.lida ? "bg-muted/30" : "bg-background border-clockflow-blue/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="text-lg">{getTipoIcon(notificacao.tipo)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`text-sm font-medium ${notificacao.lida ? "text-muted-foreground" : ""}`}>
                            {notificacao.titulo}
                          </h4>
                          <Badge variant="outline" className={getTipoColor(notificacao.tipo)}>
                            {notificacao.categoria}
                          </Badge>
                          {!notificacao.lida && (
                            <Badge variant="default" className="bg-clockflow-blue">
                              Nova
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm ${notificacao.lida ? "text-muted-foreground" : "text-foreground"}`}>
                          {notificacao.mensagem}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notificacao.data_envio).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      {!notificacao.lida && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => marcarComoLida(notificacao.id)}
                          className="h-8 w-8"
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Marcar como lida</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => excluirNotificacao(notificacao.id)}
                        className="h-8 w-8 text-[#be3e37] hover:text-[#be3e37]"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
