"use client"

import type React from "react"

import { useState } from "react"
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
import { Plus, Pencil, Trash2, Search, ArrowUp, ArrowDown, Loader2 } from "lucide-react"
import { useEmpresas } from "@/hooks/use-empresas"
import type { Empresa } from "@/lib/supabase"

type SortField = "Estabelecimento" | "Descricao"
type SortDirection = "asc" | "desc"

export default function EmpresasPage() {
  const { empresas, loading, createEmpresa, updateEmpresa, deleteEmpresa } = useEmpresas()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentEmpresa, setCurrentEmpresa] = useState<Empresa | null>(null)
  const [formData, setFormData] = useState({
    Estabelecimento: "",
    Descricao: "",
  })
  const [filtroEstabelecimento, setFiltroEstabelecimento] = useState("")
  const [sortField, setSortField] = useState<SortField>("Estabelecimento")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [submitting, setSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddEmpresa = () => {
    setCurrentEmpresa(null)
    setFormData({
      Estabelecimento: "",
      Descricao: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditEmpresa = (empresa: Empresa) => {
    setCurrentEmpresa(empresa)
    setFormData({
      Estabelecimento: empresa.Estabelecimento,
      Descricao: empresa.Descricao,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteEmpresa = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta empresa?")) {
      await deleteEmpresa(id)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (currentEmpresa) {
        await updateEmpresa(currentEmpresa.id, formData)
      } else {
        await createEmpresa(formData)
      }
      setIsDialogOpen(false)
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setSubmitting(false)
    }
  }

  // Função para ordenar as empresas
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Filtrar empresas pelo estabelecimento
  const empresasFiltradas = empresas.filter(
    (empresa) =>
      filtroEstabelecimento === "" ||
      empresa.Estabelecimento.toLowerCase().includes(filtroEstabelecimento.toLowerCase()),
  )

  // Ordenar as empresas filtradas
  const empresasOrdenadas = [...empresasFiltradas].sort((a, b) => {
    if (sortDirection === "asc") {
      return a[sortField] > b[sortField] ? 1 : -1
    } else {
      return a[sortField] < b[sortField] ? 1 : -1
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando empresas...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#0c9abe]">Empresas</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#0c9abe]">Lista de Empresas</CardTitle>
          <CardDescription>Gerencie as empresas cadastradas no sistema</CardDescription>
          <div className="flex flex-col sm:flex-row items-start sm:items-center mt-4 gap-4">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filtrar por estabelecimento..."
                value={filtroEstabelecimento}
                onChange={(e) => setFiltroEstabelecimento(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={handleAddEmpresa} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nova Empresa
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative border rounded-md">
            <div className="overflow-auto max-h-[500px]" data-scrollable="true">
              <table className="w-full">
                <thead className="bg-[#2c3739] sticky top-0 z-10">
                  <tr>
                    <th
                      className="text-left p-3 text-[#FFFFFF] cursor-pointer"
                      onClick={() => handleSort("Estabelecimento")}
                    >
                      <div className="flex items-center">
                        Estabelecimento
                        {sortField === "Estabelecimento" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </th>
                    <th className="text-left p-3 text-[#FFFFFF] cursor-pointer" onClick={() => handleSort("Descricao")}>
                      <div className="flex items-center">
                        Descrição
                        {sortField === "Descricao" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </th>
                    <th className="text-left p-3 text-[#FFFFFF] w-[100px]">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {empresasOrdenadas.map((empresa) => (
                    <tr key={empresa.id} className="border-t hover:bg-muted/50">
                      <td className="p-3">{empresa.Estabelecimento}</td>
                      <td className="p-3">{empresa.Descricao}</td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditEmpresa(empresa)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteEmpresa(empresa.id)}>
                            <Trash2 className="h-4 w-4 text-[#be3e37]" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {empresasOrdenadas.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center p-3">
                        Nenhuma empresa encontrada
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
            <DialogTitle className="text-[#0c9abe]">{currentEmpresa ? "Editar Empresa" : "Nova Empresa"}</DialogTitle>
            <DialogDescription>
              {currentEmpresa
                ? "Edite as informações da empresa selecionada."
                : "Preencha os dados para cadastrar uma nova empresa."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="Estabelecimento" className="text-right">
                  Estabelecimento
                </Label>
                <Input
                  id="Estabelecimento"
                  name="Estabelecimento"
                  value={formData.Estabelecimento}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="Descricao" className="text-right">
                  Descrição
                </Label>
                <Input
                  id="Descricao"
                  name="Descricao"
                  value={formData.Descricao}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
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
