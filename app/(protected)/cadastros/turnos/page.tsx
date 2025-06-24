"use client"

import { DialogFooter } from "@/components/ui/dialog"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Search } from "lucide-react"
import { useTurnos } from "@/hooks/use-turnos"
import { useEmpresas } from "@/hooks/use-empresas"
import type { Turno } from "@/lib/supabase"

type SortField = "nome" | "hora_inicio" | "hora_fim" | "tempo_refeicao"
type SortDirection = "asc" | "desc"

export default function TurnosPage() {
  const { turnos, loading, createTurno, updateTurno, deleteTurno, refetch } = useTurnos()
  const { empresas } = useEmpresas()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTurno, setCurrentTurno] = useState<Turno | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    hora_inicio: "",
    hora_fim: "",
    tempo_refeicao: "",
    empresa_id: "",
  })
  const [sortField, setSortField] = useState<SortField>("nome")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  // Estados para filtros
  const [filtroNome, setFiltroNome] = useState("")
  const [filtroEmpresa, setFiltroEmpresa] = useState("all")

  // Debug: Log dos dados para verificar estrutura
  useEffect(() => {
    if (turnos.length > 0) {
      console.log("=== DEBUG TURNOS ===")
      console.log("Primeiro turno completo:", turnos[0])
      console.log("Estrutura dos campos:")
      const primeiro = turnos[0]
      console.log("- nome:", typeof primeiro.nome, primeiro.nome)
      console.log("- hora_inicio:", typeof primeiro.hora_inicio, primeiro.hora_inicio)
      console.log("- hora_fim:", typeof primeiro.hora_fim, primeiro.hora_fim)
      console.log("- tempo_refeicao:", typeof primeiro.tempo_refeicao, primeiro.tempo_refeicao)
      console.log("- empresa_id:", typeof primeiro.empresa_id, primeiro.empresa_id)
    }

    if (empresas.length > 0) {
      console.log("=== DEBUG EMPRESAS ===")
      console.log(
        "Empresas disponíveis:",
        empresas.map((e) => ({
          id: e.id,
          nome: e.Estabelecimento,
        })),
      )
    }
  }, [turnos, empresas])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    console.log(`Campo ${name} alterado para:`, value, typeof value)
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    console.log(`Select ${name} alterado para:`, value, typeof value)
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddTurno = () => {
    setCurrentTurno(null)
    setFormData({
      nome: "",
      hora_inicio: "",
      hora_fim: "",
      tempo_refeicao: "",
      empresa_id: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditTurno = (turno: Turno) => {
    console.log("=== EDITANDO TURNO ===")
    console.log("Turno selecionado:", turno)

    setCurrentTurno(turno)

    // Converter tempo_refeicao de minutos para HH:MM se necessário
    const formatTimeFromMinutes = (minutes: number): string => {
      if (typeof minutes === "string") return minutes // Já está em formato HH:MM
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
    }

    const tempoRefeicao =
      typeof turno.tempo_refeicao === "number" ? formatTimeFromMinutes(turno.tempo_refeicao) : turno.tempo_refeicao

    setFormData({
      nome: turno.nome,
      hora_inicio: turno.hora_inicio,
      hora_fim: turno.hora_fim,
      tempo_refeicao: tempoRefeicao,
      empresa_id: turno.empresa_id !== null && turno.empresa_id !== undefined ? turno.empresa_id.toString() : "none",
    })
    setIsDialogOpen(true)
  }

  const handleDeleteTurno = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este turno?")) {
      await deleteTurno(id)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("=== DADOS DO FORMULÁRIO ===")
    console.log("Form data completo:", formData)
    console.log("Tipos dos dados:")
    Object.entries(formData).forEach(([key, value]) => {
      console.log(`- ${key}:`, typeof value, value)
    })

    // Validar campos obrigatórios
    if (!formData.nome || !formData.hora_inicio || !formData.hora_fim || !formData.tempo_refeicao) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    // Preparar dados para envio
    const data = {
      nome: formData.nome.trim(),
      hora_inicio: formData.hora_inicio,
      hora_fim: formData.hora_fim,
      tempo_refeicao: formData.tempo_refeicao,
      empresa_id: formData.empresa_id && formData.empresa_id !== "none" ? Number.parseInt(formData.empresa_id) : null,
    }

    console.log("=== DADOS PREPARADOS PARA ENVIO ===")
    console.log("Data to send:", data)
    console.log("Tipos dos dados preparados:")
    Object.entries(data).forEach(([key, value]) => {
      console.log(`- ${key}:`, typeof value, value)
    })

    try {
      if (currentTurno) {
        await updateTurno(currentTurno.id, data)
      } else {
        await createTurno(data)
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Erro ao salvar turno:", error)
      // O toast já é mostrado no hook
    }
  }

  // Função para ordenar os turnos
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Função auxiliar para conversão segura
  const safeToString = (value: any): string => {
    if (value === null || value === undefined) return ""
    return String(value)
  }

  // Função para formatar tempo_refeicao na exibição
  const formatTempoRefeicao = (tempo: any): string => {
    if (typeof tempo === "number") {
      // Se for número (minutos), converter para HH:MM
      const hours = Math.floor(tempo / 60)
      const minutes = tempo % 60
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    }
    return tempo || ""
  }

  // Filtrar turnos
  const turnosFiltrados = useMemo(() => {
    return turnos.filter((turno) => {
      // Filtro por nome
      const nomeMatch = !filtroNome || turno.nome.toLowerCase().includes(filtroNome.toLowerCase())

      // Filtro por empresa usando empresa_id
      let empresaMatch = true
      if (filtroEmpresa !== "all") {
        const empresaIdFiltro = Number.parseInt(filtroEmpresa)
        if (turno.empresa_id !== null && turno.empresa_id !== undefined) {
          empresaMatch = turno.empresa_id === empresaIdFiltro
        } else {
          empresaMatch = false
        }
      }

      return nomeMatch && empresaMatch
    })
  }, [turnos, filtroNome, filtroEmpresa])

  // Ordenar turnos filtrados
  const turnosOrdenados = useMemo(() => {
    return [...turnosFiltrados].sort((a, b) => {
      const aValue = safeToString(a[sortField])
      const bValue = safeToString(b[sortField])

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [turnosFiltrados, sortField, sortDirection])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center overflow-hidden">
        <div className="text-lg">Carregando turnos...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#0c9abe]">Turnos</h2>
      </div>

      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-[#0c9abe]">Lista de Turnos</CardTitle>
          <CardDescription>
            Gerencie os turnos de trabalho cadastrados no sistema
            {turnosOrdenados.length !== turnos.length && (
              <span className="ml-2 text-sm font-medium">
                ({turnosOrdenados.length} de {turnos.length} registros)
              </span>
            )}
          </CardDescription>
          <div className="flex flex-col sm:flex-row items-start sm:items-center mt-4 gap-4">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filtrar por nome..."
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="w-full sm:w-[200px]">
              <Select value={filtroEmpresa} onValueChange={setFiltroEmpresa}>
                <SelectTrigger className="bg-white border border-gray-300">
                  <SelectValue placeholder="Filtrar por empresa" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300">
                  <SelectItem value="all" className="hover:bg-gray-100">
                    Todas as empresas
                  </SelectItem>
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id.toString()} className="hover:bg-gray-100">
                      {empresa.Estabelecimento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddTurno} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Novo Turno
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          <div className="relative border rounded-md flex-1 min-h-0">
            <div className="overflow-auto max-h-full" data-scrollable="true">
              <table className="w-full">
                <thead className="bg-[#2c3739] sticky top-0 z-10">
                  <tr>
                    <th className="text-left p-3 text-[#FFFFFF] cursor-pointer" onClick={() => handleSort("nome")}>
                      <div className="flex items-center">
                        Nome
                        {sortField === "nome" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="text-left p-3 text-[#FFFFFF] cursor-pointer"
                      onClick={() => handleSort("hora_inicio")}
                    >
                      <div className="flex items-center">
                        Horário Entrada
                        {sortField === "hora_inicio" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </th>
                    <th className="text-left p-3 text-[#FFFFFF] cursor-pointer" onClick={() => handleSort("hora_fim")}>
                      <div className="flex items-center">
                        Horário Saída
                        {sortField === "hora_fim" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="text-left p-3 text-[#FFFFFF] cursor-pointer hidden sm:table-cell"
                      onClick={() => handleSort("tempo_refeicao")}
                    >
                      <div className="flex items-center">
                        Tempo de Refeição
                        {sortField === "tempo_refeicao" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </th>
                    <th className="text-left p-3 text-[#FFFFFF] hidden md:table-cell">Empresa</th>
                    <th className="w-[100px] text-left p-3 text-[#FFFFFF]">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {turnosOrdenados.map((turno) => (
                    <tr key={turno.id} className="border-t hover:bg-muted/50">
                      <td className="p-3">{turno.nome}</td>
                      <td className="p-3">{turno.hora_inicio}</td>
                      <td className="p-3">{turno.hora_fim}</td>
                      <td className="p-3 hidden sm:table-cell">{formatTempoRefeicao(turno.tempo_refeicao)}</td>
                      <td className="p-3 hidden md:table-cell">{turno.empresas?.Estabelecimento || "Não definida"}</td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditTurno(turno)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteTurno(turno.id)}>
                            <Trash2 className="h-4 w-4 text-[#be3e37]" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {turnosOrdenados.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center p-8">
                        {turnos.length === 0
                          ? "Nenhum turno cadastrado"
                          : filtroNome || filtroEmpresa !== "all"
                            ? "Nenhum turno encontrado com os filtros aplicados"
                            : "Nenhum turno encontrado"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#0c9abe]">{currentTurno ? "Editar Turno" : "Novo Turno"}</DialogTitle>
            <DialogDescription>
              {currentTurno
                ? "Edite as informações do turno selecionado."
                : "Preencha os dados para cadastrar um novo turno."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nome" className="text-right">
                  Nome *
                </Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="col-span-3 bg-white"
                  required
                  placeholder="Ex: Manhã, Tarde, Noite"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="hora_inicio" className="text-right">
                  Horário Entrada *
                </Label>
                <Input
                  id="hora_inicio"
                  name="hora_inicio"
                  type="time"
                  value={formData.hora_inicio}
                  onChange={handleInputChange}
                  className="col-span-3 bg-white"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="hora_fim" className="text-right">
                  Horário Saída *
                </Label>
                <Input
                  id="hora_fim"
                  name="hora_fim"
                  type="time"
                  value={formData.hora_fim}
                  onChange={handleInputChange}
                  className="col-span-3 bg-white"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tempo_refeicao" className="text-right">
                  Tempo de Refeição *
                </Label>
                <Input
                  id="tempo_refeicao"
                  name="tempo_refeicao"
                  type="time"
                  value={formData.tempo_refeicao}
                  onChange={handleInputChange}
                  className="col-span-3 bg-white"
                  required
                  placeholder="Ex: 01:00"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="empresa_id" className="text-right">
                  Empresa
                </Label>
                <Select value={formData.empresa_id} onValueChange={(value) => handleSelectChange("empresa_id", value)}>
                  <SelectTrigger id="empresa_id" className="col-span-3 bg-white border border-gray-300">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300">
                    <SelectItem value="none" className="hover:bg-gray-100">
                      Nenhuma empresa
                    </SelectItem>
                    {empresas.map((empresa) => (
                      <SelectItem key={empresa.id} value={empresa.id.toString()} className="hover:bg-gray-100">
                        {empresa.Estabelecimento}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <Button type="button" onClick={() => setIsDialogOpen(false)} className="bg-[#be3e37] hover:bg-[#a83530]">
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
