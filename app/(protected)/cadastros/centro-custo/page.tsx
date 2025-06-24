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
import { Plus, Pencil, Trash2, Search, ArrowUp, ArrowDown, Filter } from "lucide-react"
import { useCentroCustos } from "@/hooks/use-centro-custos"
import { useEmpresas } from "@/hooks/use-empresas"
import type { CentroCusto } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

type SortField = "nome" | "codigo" | "empresas"
type SortDirection = "asc" | "desc"

export default function CentroCustoPage() {
  const { centrosCusto, loading, createCentroCusto, updateCentroCusto, deleteCentroCusto, refetch } = useCentroCustos()
  const { empresas, loading: empresasLoading } = useEmpresas()
  const { toast } = useToast()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentCentroCusto, setCurrentCentroCusto] = useState<CentroCusto | null>(null)
  const [formData, setFormData] = useState({
    codigo: "",
    nome: "",
    empresa_id: "",
  })
  const [filtroNome, setFiltroNome] = useState("")
  const [filtroEmpresa, setFiltroEmpresa] = useState("all")
  const [sortField, setSortField] = useState<SortField>("nome")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [dataLoaded, setDataLoaded] = useState(false)

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

  useEffect(() => {
    if (!loading && centrosCusto.length > 0) {
      setDataLoaded(true)
    }
  }, [loading, centrosCusto])

  // Aplicar filtros usando useMemo para otimização
  const centrosCustoFiltrados = useMemo(() => {
    if (!centrosCusto || centrosCusto.length === 0) return []

    return centrosCusto.filter((cc) => {
      // Filtro por nome
      const nomeMatch = !filtroNome || (cc.nome && cc.nome.toLowerCase().includes(filtroNome.toLowerCase()))

      // Filtro por empresa
      let empresaMatch = true
      if (filtroEmpresa !== "all") {
        const empresaIdFiltro = Number.parseInt(filtroEmpresa, 10)
        empresaMatch = cc.empresa_id === empresaIdFiltro
      }

      return nomeMatch && empresaMatch
    })
  }, [centrosCusto, filtroNome, filtroEmpresa])

  const centrosCustoOrdenados = useMemo(() => {
    return [...centrosCustoFiltrados].sort((a, b) => {
      let aValue = ""
      let bValue = ""

      if (sortField === "empresas") {
        aValue = a.empresas?.Estabelecimento || ""
        bValue = b.empresas?.Estabelecimento || ""
      } else {
        aValue = a[sortField] || ""
        bValue = b[sortField] || ""
      }

      if (sortDirection === "asc") {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })
  }, [centrosCustoFiltrados, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddCentroCusto = () => {
    setCurrentCentroCusto(null)
    setFormData({
      codigo: "",
      nome: "",
      empresa_id: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditCentroCusto = (centroCusto: CentroCusto) => {
    setCurrentCentroCusto(centroCusto)
    setFormData({
      codigo: centroCusto.codigo || "",
      nome: centroCusto.nome || "",
      empresa_id: centroCusto.empresa_id ? centroCusto.empresa_id.toString() : "",
    })
    setIsDialogOpen(true)
  }

  const handleDeleteCentroCusto = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este centro de custo?")) {
      try {
        await deleteCentroCusto(id)
        toast({
          title: "Centro de custo excluído",
          description: "O centro de custo foi excluído com sucesso.",
        })
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o centro de custo.",
          variant: "destructive",
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const data = {
        codigo: formData.codigo,
        nome: formData.nome,
        empresa_id: formData.empresa_id ? Number.parseInt(formData.empresa_id, 10) : null,
      }

      if (currentCentroCusto) {
        await updateCentroCusto(currentCentroCusto.id, data)
        toast({
          title: "Centro de custo atualizado",
          description: "O centro de custo foi atualizado com sucesso.",
        })
      } else {
        await createCentroCusto(data)
        toast({
          title: "Centro de custo criado",
          description: "O centro de custo foi criado com sucesso.",
        })
      }

      setIsDialogOpen(false)
      refetch()
    } catch (error) {
      console.error("Erro ao salvar centro de custo:", error)
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o centro de custo.",
        variant: "destructive",
      })
    }
  }

  if (loading || empresasLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Carregando centros de custo...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header fixo */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#0c9abe]">Centro de Custo</h2>
        </div>
      </div>

      {/* Card principal com altura controlada */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-[#0c9abe]">Lista de Centros de Custo</CardTitle>
          <CardDescription>Gerencie os centros de custo cadastrados no sistema</CardDescription>
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
            <Button onClick={handleAddCentroCusto} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Novo Centro de Custo
            </Button>
          </div>

          <div className="flex items-center mt-2 text-sm text-gray-500">
            <Filter className="h-3 w-3 mr-1" />
            {filtroEmpresa === "all"
              ? "Mostrando todos os centros de custo"
              : `Filtrando pela empresa: ${empresas.find((e) => e.id.toString() === filtroEmpresa)?.Estabelecimento || filtroEmpresa}`}
            {filtroNome && ` | Nome contém: "${filtroNome}"`}
            <span className="ml-2 font-medium">
              ({centrosCustoFiltrados.length} de {centrosCusto.length} registros)
            </span>
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
                    <th className="text-left p-3 text-[#FFFFFF] cursor-pointer" onClick={() => handleSort("codigo")}>
                      <div className="flex items-center">
                        Código
                        {sortField === "codigo" &&
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
                    <th
                      className="text-left p-3 text-[#FFFFFF] cursor-pointer hidden sm:table-cell"
                      onClick={() => handleSort("empresas")}
                    >
                      <div className="flex items-center">
                        Empresa
                        {sortField === "empresas" &&
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
                  {centrosCustoOrdenados.length > 0 ? (
                    centrosCustoOrdenados.map((cc) => (
                      <tr key={cc.id} className="border-t hover:bg-muted/50">
                        <td className="p-3">{cc.codigo}</td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{cc.nome}</div>
                            <div className="text-sm text-gray-500 sm:hidden">
                              {cc.empresas?.Estabelecimento || "Não definida"}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 hidden sm:table-cell">{cc.empresas?.Estabelecimento || "Não definida"}</td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditCentroCusto(cc)}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteCentroCusto(cc.id)}>
                              <Trash2 className="h-4 w-4 text-[#be3e37]" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center p-6">
                        {loading ? (
                          "Carregando dados..."
                        ) : dataLoaded ? (
                          <>
                            <div className="text-gray-500 mb-2">Nenhum centro de custo encontrado</div>
                            {filtroEmpresa !== "all" && (
                              <div className="text-sm text-gray-400">
                                Tente selecionar "Todas as empresas" ou outro filtro
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="text-gray-500 mb-2">Nenhum centro de custo cadastrado</div>
                            <Button variant="outline" size="sm" onClick={handleAddCentroCusto}>
                              <Plus className="mr-1 h-3 w-3" />
                              Cadastrar Novo
                            </Button>
                          </>
                        )}
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
            <DialogTitle className="text-[#0c9abe]">
              {currentCentroCusto ? "Editar Centro de Custo" : "Novo Centro de Custo"}
            </DialogTitle>
            <DialogDescription>
              {currentCentroCusto
                ? "Edite as informações do centro de custo selecionado."
                : "Preencha os dados para cadastrar um novo centro de custo."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="codigo" className="text-right">
                  Código
                </Label>
                <Input
                  id="codigo"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nome" className="text-right">
                  Nome
                </Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="empresa_id" className="text-right">
                  Empresa
                </Label>
                <Select value={formData.empresa_id} onValueChange={(value) => handleSelectChange("empresa_id", value)}>
                  <SelectTrigger id="empresa_id" className="col-span-3 bg-white">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
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
