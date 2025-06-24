"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Upload, ArrowUp, ArrowDown, Search, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useFuncionarios } from "@/hooks/use-funcionarios"
import { useEmpresas } from "@/hooks/use-empresas"
import { supabase, type Funcionario, type CentroCusto, type Turno } from "@/lib/supabase"
import { toast } from "sonner"

// Função helper para garantir que valores sejam strings
const safeString = (value: any): string => {
  if (value === null || value === undefined) {
    return ""
  }
  return String(value)
}

type SortField = "matricula" | "nome" | "data_admissao" | "ativo"
type SortDirection = "asc" | "desc"

const safeToString = (value: any): string => {
  if (value === null || value === undefined) {
    return ""
  }
  return String(value)
}

export default function FuncionariosPage() {
  const { funcionarios, loading, initialized, createFuncionario, updateFuncionario, deleteFuncionario, getFotoUrl, fetchFuncionarios } =
    useFuncionarios()
  const { empresas } = useEmpresas()
  const [shouldLoadData, setShouldLoadData] = useState(false)
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentFuncionario, setCurrentFuncionario] = useState<Funcionario | null>(null)
  const [formData, setFormData] = useState({
    matricula: "",
    nome: "",
    centro_custo_id: 0,
    turno_id: 0,
    data_admissao: new Date().toISOString().split("T")[0],
    ativo: true,
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [sortField, setSortField] = useState<SortField>("nome")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [filtroNome, setFiltroNome] = useState("")
  const [filtroEmpresa, setFiltroEmpresa] = useState("all")
  const [filtroCentroCusto, setFiltroCentroCusto] = useState("all")
  const [filtroTurno, setFiltroTurno] = useState("all")
  const [submitting, setSubmitting] = useState(false)
  const [filtroEmpresaDialog, setFiltroEmpresaDialog] = useState("all")
  const [imageLoadingStates, setImageLoadingStates] = useState<Map<string, boolean>>(new Map())

  // Bloquear scroll da página para áreas em branco
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement

      // Permitir scroll apenas em elementos específicos com scroll
      const isScrollableElement = target.closest(
        '[data-scrollable="true"], .overflow-auto, .overflow-y-auto, .overflow-scroll, [role="listbox"], [role="menu"]',
      )

      if (!isScrollableElement) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    // Bloquear scroll da página
    document.body.style.overflow = "hidden"
    document.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      document.body.style.overflow = "unset"
      document.removeEventListener("wheel", handleWheel)
    }
  }, [])

  // Carregar dados automaticamente quando filtros forem aplicados (mas não na inicialização)
  useEffect(() => {
    const hasFilters = filtroNome || filtroEmpresa !== "all" || filtroCentroCusto !== "all" || filtroTurno !== "all"
    
    if (hasFilters && !initialized && !loading) {
      console.log("🔍 Filtros aplicados, carregando dados automaticamente...")
      setShouldLoadData(true)
      fetchFuncionarios()
    }
  }, [filtroNome, filtroEmpresa, filtroCentroCusto, filtroTurno, initialized, loading, fetchFuncionarios])

  // Inicializar estado de carregamento das imagens quando a lista de funcionários for atualizada
  useEffect(() => {
    if (funcionarios.length > 0) {
      const newImageStates = new Map<string, boolean>()
      funcionarios.forEach(funcionario => {
        if (funcionario.matricula) {
          // Iniciar com estado de carregamento
          newImageStates.set(funcionario.matricula, true)
        }
      })
      setImageLoadingStates(newImageStates)
    }
  }, [funcionarios])

  useEffect(() => {
    const fetchCentrosCusto = async () => {
      try {
        const { data, error } = await supabase
          .from("centro_custos")
          .select(`
        id,
        nome,
        codigo,
        empresa_id,
        created_at,
        updated_at,
        empresas (
          id,
          Estabelecimento,
          Descricao
        )
      `)
          .order("nome")

        if (error) {
          console.error("Erro na consulta de centros de custo:", error)
          throw error
        }

        setCentrosCusto(data || [])
      } catch (error) {
        console.error("Erro ao buscar centros de custo:", error)
        setCentrosCusto([])
      }
    }

    const fetchTurnos = async () => {
      try {
        const { data } = await supabase.from("turnos").select("*, empresas(*)").order("nome")
        setTurnos(data || [])
      } catch (error) {
        console.error("Erro ao buscar turnos:", error)
        setTurnos([])
      }
    }

    fetchCentrosCusto()
    fetchTurnos()
  }, [])

  // Reset filtros dependentes quando empresa mudar
  useEffect(() => {
    setFiltroCentroCusto("all")
    setFiltroTurno("all")
  }, [filtroEmpresa])

  // Reset filtro de turno quando centro de custo mudar
  useEffect(() => {
    setFiltroTurno("all")
  }, [filtroCentroCusto])

  // Filtrar centros de custo por empresa selecionada
  const centrosCustoFiltrados = useMemo(() => {
    if (filtroEmpresa === "all") {
      return centrosCusto
    }
    return centrosCusto.filter((cc) => {
      const empresaId = cc.empresa_id || cc.empresas?.id
      return safeToString(empresaId) === filtroEmpresa
    })
  }, [centrosCusto, filtroEmpresa])

  // Filtrar turnos por empresa selecionada
  const turnosFiltrados = useMemo(() => {
    if (filtroEmpresa === "all") {
      return turnos
    }
    return turnos.filter((turno) => {
      const empresaId = turno.empresa_id || turno.empresas?.id
      return safeToString(empresaId) === filtroEmpresa
    })
  }, [turnos, filtroEmpresa])

  // Aplicar todos os filtros aos funcionários
  const funcionariosFiltrados = useMemo(() => {
    return funcionarios.filter((f) => {
      // Filtro por nome
      const nomeFunc = (f.nome || "").toLowerCase()
      const nomeFilter = (filtroNome || "").toLowerCase()
      const matchesNome = nomeFilter === "" || nomeFunc.includes(nomeFilter)

      // Filtro por empresa
      let matchesEmpresa = filtroEmpresa === "all"
      if (!matchesEmpresa && f.centro_custos?.empresas?.id) {
        matchesEmpresa = safeToString(f.centro_custos.empresas.id) === filtroEmpresa
      }

      // Filtro por centro de custo
      let matchesCentroCusto = filtroCentroCusto === "all"
      if (!matchesCentroCusto && f.centro_custo_id) {
        matchesCentroCusto = safeToString(f.centro_custo_id) === filtroCentroCusto
      }

      // Filtro por turno
      let matchesTurno = filtroTurno === "all"
      if (!matchesTurno && f.turno_id) {
        matchesTurno = safeToString(f.turno_id) === filtroTurno
      }

      return matchesNome && matchesEmpresa && matchesCentroCusto && matchesTurno
    })
  }, [funcionarios, filtroNome, filtroEmpresa, filtroCentroCusto, filtroTurno])

  const funcionariosOrdenados = useMemo(() => {
    return [...funcionariosFiltrados].sort((a, b) => {
      const aValue = a[sortField] !== undefined ? a[sortField] : sortField === "ativo" ? false : ""
      const bValue = b[sortField] !== undefined ? b[sortField] : sortField === "ativo" ? false : ""

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [funcionariosFiltrados, sortField, sortDirection])

  // Filtrar centros de custo por empresa selecionada no dialog
  const centrosCustoDialog = useMemo(() => {
    if (filtroEmpresaDialog === "all") {
      return centrosCusto
    }
    return centrosCusto.filter((cc) => {
      const empresaId = cc.empresa_id || cc.empresas?.id
      return safeToString(empresaId) === filtroEmpresaDialog
    })
  }, [centrosCusto, filtroEmpresaDialog])

  // Filtrar turnos por empresa selecionada no dialog
  const turnosDialog = useMemo(() => {
    if (filtroEmpresaDialog === "all") {
      return turnos
    }
    return turnos.filter((turno) => {
      const empresaId = turno.empresa_id || turno.empresas?.id
      return safeToString(empresaId) === filtroEmpresaDialog
    })
  }, [turnos, filtroEmpresaDialog])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("_id") && value ? Number.parseInt(value) : value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleAddFuncionario = () => {
    setCurrentFuncionario(null)
    setFormData({
      matricula: "",
      nome: "",
      centro_custo_id: 0,
      turno_id: 0,
      data_admissao: new Date().toISOString().split("T")[0],
      ativo: true,
    })
    setSelectedFile(null)
    setFiltroEmpresaDialog("all") // Adicione esta linha
    setIsDialogOpen(true)
  }

  const handleEditFuncionario = (funcionario: Funcionario) => {
    console.log("=== EDITANDO FUNCIONÁRIO ===")
    console.log("Funcionário selecionado:", funcionario)

    setCurrentFuncionario(funcionario)

    // Carregar dados do funcionário no formulário com conversão segura
    const formDataToSet = {
      matricula: safeString(funcionario.matricula),
      nome: safeString(funcionario.nome),
      centro_custo_id: funcionario.centro_custo_id || 0,
      turno_id: funcionario.turno_id || 0,
      data_admissao: funcionario.data_admissao
        ? new Date(funcionario.data_admissao).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      ativo: funcionario.ativo !== undefined ? funcionario.ativo : true,
    }

    console.log("Dados carregados no formulário:", formDataToSet)
    setFormData(formDataToSet)
    setSelectedFile(null)

    // Configurar empresa automaticamente baseada no centro de custo
    const empresaId = funcionario.centro_custos?.empresas?.id || funcionario.centro_custos?.empresa_id
    const empresaIdString = empresaId ? safeToString(empresaId) : "all"

    console.log("Empresa detectada para filtro:", empresaIdString)
    setFiltroEmpresaDialog(empresaIdString)

    setIsDialogOpen(true)
  }

  const handleDeleteFuncionario = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este funcionário?")) {
      await deleteFuncionario(id)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      console.log("=== SALVANDO FUNCIONÁRIO ===")
      console.log("Modo:", currentFuncionario ? "EDIÇÃO" : "CRIAÇÃO")
      console.log("Dados do formulário:", formData)

      // Validar campos obrigatórios
      const nome = formData.nome ? String(formData.nome).trim() : ""
      const matricula = formData.matricula ? String(formData.matricula).trim() : ""

      if (!nome) {
        toast.error("Nome é obrigatório")
        return
      }

      if (!matricula) {
        toast.error("Matrícula é obrigatória")
        return
      }

      if (!formData.centro_custo_id || formData.centro_custo_id === 0) {
        toast.error("Centro de custo é obrigatório")
        return
      }

      if (!formData.turno_id || formData.turno_id === 0) {
        toast.error("Turno é obrigatório")
        return
      }

      // Preparar dados finais
      const dadosParaSalvar = {
        nome: nome,
        matricula: matricula,
        data_admissao: formData.data_admissao,
        ativo: formData.ativo,
        turno_id: Number(formData.turno_id),
        centro_custo_id: Number(formData.centro_custo_id),
      }

      console.log("Dados finais para salvar:", dadosParaSalvar)

      if (currentFuncionario) {
        console.log("🔄 Atualizando funcionário ID:", currentFuncionario.id)
        await updateFuncionario(currentFuncionario.id, dadosParaSalvar, selectedFile || undefined)
      } else {
        console.log("➕ Criando novo funcionário")
        await createFuncionario(dadosParaSalvar, selectedFile || undefined)
      }

      console.log("✅ Funcionário salvo com sucesso!")
      setIsDialogOpen(false)
    } catch (error) {
      console.error("❌ Erro ao salvar funcionário:", error)
      // Error is handled in the hook
    } finally {
      setSubmitting(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando funcionários...</span>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col space-y-6 overflow-hidden">
      {/* Header fixo */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#0c9abe]">Funcionários</h2>
        </div>
      </div>

      {/* Card principal com altura controlada */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-[#0c9abe]">Funcionários</CardTitle>
          <CardDescription>
            Gerencie os funcionários cadastrados no sistema
            {funcionariosFiltrados.length !== funcionarios.length && (
              <span className="text-sm text-muted-foreground ml-2">
                ({funcionariosFiltrados.length} de {funcionarios.length} registros)
              </span>
            )}
          </CardDescription>
          <div className="grid gap-4 mt-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome..."
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="w-[200px]">
                <Select value={filtroEmpresa} onValueChange={setFiltroEmpresa}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Filtrar por empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">Todas as empresas</SelectItem>
                    {empresas.map((empresa) => (
                      <SelectItem key={empresa.id} value={safeToString(empresa.id)}>
                        {empresa.Estabelecimento || `Empresa ${empresa.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[200px]">
                <Select value={filtroCentroCusto} onValueChange={setFiltroCentroCusto}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Filtrar por centro de custo" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">
                      Todos os centros {filtroEmpresa !== "all" && `(${centrosCustoFiltrados.length})`}
                    </SelectItem>
                    {centrosCustoFiltrados.map((centro) => (
                      <SelectItem key={centro.id} value={safeToString(centro.id)}>
                        {centro.nome || `Centro ${centro.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[200px]">
                <Select value={filtroTurno} onValueChange={setFiltroTurno}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Filtrar por turno" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">
                      Todos os turnos {filtroEmpresa !== "all" && `(${turnosFiltrados.length})`}
                    </SelectItem>
                    {turnosFiltrados.map((turno) => (
                      <SelectItem key={turno.id} value={safeToString(turno.id)}>
                        {turno.nome || `Turno ${turno.id}`} ({turno.hora_inicio || "--:--"} -{" "}
                        {turno.hora_fim || "--:--"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!initialized && (
                <Button 
                  onClick={() => {
                    setShouldLoadData(true)
                    fetchFuncionarios()
                  }} 
                  className="w-full sm:w-auto bg-[#0c9abe] hover:bg-[#0a7a94]"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  {loading ? "Carregando..." : "Carregar Funcionários"}
                </Button>
              )}
              <Button onClick={handleAddFuncionario} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Novo Funcionário
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Conteúdo da tabela com scroll controlado */}
        <CardContent className="flex-1 flex flex-col min-h-0">
          <div className="relative border rounded-md flex-1 flex flex-col min-h-0">
            <div
              className="flex-1 overflow-y-auto min-h-0"
              data-scrollable="true"
              style={{ maxHeight: "calc(100vh - 400px)" }}
            >
              <table className="w-full">
                <thead className="bg-[#2c3739] sticky top-0 z-10">
                  <tr>
                    <th className="w-[50px] text-left p-3 text-[#FFFFFF]">Foto</th>
                    <th className="text-left p-3 text-[#FFFFFF] cursor-pointer" onClick={() => handleSort("matricula")}>
                      <div className="flex items-center">
                        Matrícula
                        {sortField === "matricula" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </th>
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
                    <th className="text-left p-3 text-[#FFFFFF] hidden sm:table-cell">Empresa</th>
                    <th className="text-left p-3 text-[#FFFFFF] hidden md:table-cell">Centro de Custo</th>
                    <th className="text-left p-3 text-[#FFFFFF] hidden lg:table-cell">Turno</th>
                    <th
                      className="text-left p-3 text-[#FFFFFF] cursor-pointer hidden lg:table-cell"
                      onClick={() => handleSort("data_admissao")}
                    >
                      <div className="flex items-center">
                        Data Admissão
                        {sortField === "data_admissao" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </th>
                    <th className="text-left p-3 text-[#FFFFFF] cursor-pointer" onClick={() => handleSort("ativo")}>
                      <div className="flex items-center">
                        Status
                        {sortField === "ativo" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </th>
                    <th className="w-[100px] text-left p-3 text-[#FFFFFF]">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {funcionariosOrdenados.map((funcionario) => (
                    <tr key={funcionario.id} className="border-t hover:bg-muted/50">
                      <td className="p-3">
                        <Avatar>
                          <AvatarImage
                            src={funcionario.matricula ? getFotoUrl(funcionario.matricula) : "/placeholder.svg"}
                            alt={funcionario.nome || "Funcionário"}
                            onLoadStart={() => {
                              if (funcionario.matricula) {
                                setImageLoadingStates(prev => {
                                  const newMap = new Map(prev)
                                  newMap.set(funcionario.matricula, true)
                                  return newMap
                                })
                              }
                            }}
                            onLoad={() => {
                              if (funcionario.matricula) {
                                setImageLoadingStates(prev => {
                                  const newMap = new Map(prev)
                                  newMap.set(funcionario.matricula, false)
                                  return newMap
                                })
                              }
                            }}
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                              if (funcionario.matricula) {
                                setImageLoadingStates(prev => {
                                  const newMap = new Map(prev)
                                  newMap.set(funcionario.matricula, false)
                                  return newMap
                                })
                              }
                            }}
                            style={{
                              opacity: imageLoadingStates.get(funcionario.matricula) === true ? 0.5 : 1,
                              transition: 'opacity 0.2s ease-in-out',
                              minHeight: '40px',
                              minWidth: '40px'
                            }}
                          />
                          <AvatarFallback>
                            {funcionario.nome ? funcionario.nome.substring(0, 2).toUpperCase() : "FP"}
                          </AvatarFallback>
                        </Avatar>
                      </td>
                      <td className="p-3">{funcionario.matricula || "N/A"}</td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{funcionario.nome || "Sem nome"}</div>
                          <div className="text-sm text-gray-500 sm:hidden">
                            {funcionario.centro_custos?.empresas?.Estabelecimento || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500 md:hidden sm:block">
                            {funcionario.centro_custos?.nome || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500 lg:hidden md:block">
                            {funcionario.turnos?.nome || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500 lg:hidden">
                            {funcionario.data_admissao
                              ? new Date(funcionario.data_admissao).toLocaleDateString("pt-BR")
                              : "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        {funcionario.centro_custos?.empresas?.Estabelecimento || "N/A"}
                      </td>
                      <td className="p-3 hidden md:table-cell">{funcionario.centro_custos?.nome || "N/A"}</td>
                      <td className="p-3 hidden lg:table-cell">{funcionario.turnos?.nome || "N/A"}</td>
                      <td className="p-3 hidden lg:table-cell">
                        {funcionario.data_admissao
                          ? new Date(funcionario.data_admissao).toLocaleDateString("pt-BR")
                          : "N/A"}
                      </td>
                      <td className="p-3">
                        <Badge variant={funcionario.ativo ? "default" : "destructive"}>
                          {funcionario.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditFuncionario(funcionario)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteFuncionario(funcionario.id)}>
                            <Trash2 className="h-4 w-4 text-[#be3e37]" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {funcionariosOrdenados.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center p-8">
                        {!initialized ? (
                          <div className="flex flex-col items-center gap-4">
                            <div className="text-gray-500">
                              <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                              <p className="text-lg font-medium">Nenhum dado carregado</p>
                              <p className="text-sm">Clique em "Carregar Funcionários" para visualizar os dados</p>
                            </div>
                          </div>
                        ) : filtroNome || filtroEmpresa !== "all" || filtroCentroCusto !== "all" || filtroTurno !== "all"
                          ? "Nenhum funcionário encontrado com os filtros aplicados"
                          : "Nenhum funcionário cadastrado"}
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
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#0c9abe]">
              {currentFuncionario ? "Editar Funcionário" : "Novo Funcionário"}
            </DialogTitle>
            <DialogDescription>
              {currentFuncionario
                ? "Edite as informações do funcionário selecionado."
                : "Preencha os dados para cadastrar um novo funcionário."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
              {/* Campo de seleção de empresa - FILTRO APENAS */}
              <div className="space-y-2">
                <Label htmlFor="empresa_filtro" className="text-sm font-medium text-[#0c9abe]">
                  Empresa (Filtro)
                </Label>
                <Select
                  value={filtroEmpresaDialog}
                  onValueChange={(value) => {
                    setFiltroEmpresaDialog(value)
                    // Reset centro de custo e turno quando empresa mudar
                    setFormData((prev) => ({
                      ...prev,
                      centro_custo_id: 0,
                      turno_id: 0,
                    }))
                  }}
                >
                  <SelectTrigger id="empresa_filtro" className="bg-white">
                    <SelectValue placeholder="Selecione uma empresa para filtrar" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">Todas as empresas</SelectItem>
                    {empresas.map((empresa) => (
                      <SelectItem key={empresa.id} value={safeToString(empresa.id)}>
                        {empresa.Estabelecimento || `Empresa ${empresa.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Este filtro ajuda a reduzir as opções de centro de custo e turno
                </p>
              </div>
              <div className="flex justify-center">
                <div className="space-y-2">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage
                      src={
                        selectedFile
                          ? URL.createObjectURL(selectedFile)
                          : currentFuncionario && currentFuncionario.matricula
                            ? getFotoUrl(currentFuncionario.matricula)
                            : "/placeholder.svg"
                      }
                      alt="Foto do funcionário"
                    />
                    <AvatarFallback>
                      {formData.nome ? formData.nome.substring(0, 2).toUpperCase() : "FP"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="foto-upload"
                    />
                    <Label htmlFor="foto-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" className="w-full" asChild>
                        <span>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload de Foto
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="matricula">Matrícula</Label>
                  <Input
                    id="matricula"
                    name="matricula"
                    value={formData.matricula}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" name="nome" value={formData.nome} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="centro_custo_id">Centro de Custo</Label>
                  <Select
                    value={safeToString(formData.centro_custo_id)}
                    onValueChange={(value) => handleSelectChange("centro_custo_id", value)}
                  >
                    <SelectTrigger id="centro_custo_id" className="bg-white">
                      <SelectValue placeholder="Selecione o centro de custo" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {centrosCustoDialog.map((centro) => (
                        <SelectItem key={centro.id} value={safeToString(centro.id)}>
                          {centro.nome || `Centro ${centro.id}`} - {centro.empresas?.Estabelecimento || "N/A"}
                        </SelectItem>
                      ))}
                      {centrosCustoDialog.length === 0 && (
                        <SelectItem value="" disabled>
                          {filtroEmpresaDialog === "all"
                            ? "Nenhum centro de custo disponível"
                            : "Nenhum centro de custo para esta empresa"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="turno_id">Turno</Label>
                  <Select
                    value={safeToString(formData.turno_id)}
                    onValueChange={(value) => handleSelectChange("turno_id", value)}
                  >
                    <SelectTrigger id="turno_id" className="bg-white">
                      <SelectValue placeholder="Selecione o turno" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {turnosDialog.map((turno) => (
                        <SelectItem key={turno.id} value={safeToString(turno.id)}>
                          {turno.nome || `Turno ${turno.id}`} ({turno.hora_inicio || "--:--"} -{" "}
                          {turno.hora_fim || "--:--"})
                        </SelectItem>
                      ))}
                      {turnosDialog.length === 0 && (
                        <SelectItem value="" disabled>
                          {filtroEmpresaDialog === "all" ? "Nenhum turno disponível" : "Nenhum turno para esta empresa"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_admissao">Data de Admissão</Label>
                  <Input
                    id="data_admissao"
                    name="data_admissao"
                    type="date"
                    value={formData.data_admissao}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ativo">Status</Label>
                  <Select
                    value={safeToString(formData.ativo)}
                    onValueChange={(value) => handleSelectChange("ativo", value)}
                  >
                    <SelectTrigger id="ativo" className="bg-white">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="true">Ativo</SelectItem>
                      <SelectItem value="false">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <Button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="bg-[#be3e37] hover:bg-[#a83530]"
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
