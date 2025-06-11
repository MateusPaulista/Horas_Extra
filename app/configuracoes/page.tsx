"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Plus, Edit, Trash2, Save, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { Parametrizador } from "@/lib/types"
import { getParametros, updateParametro, createParametro, deleteParametro } from "./actions"

export default function ConfiguracoesPage() {
  const [parametros, setParametros] = useState<Parametrizador[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingParam, setEditingParam] = useState<Parametrizador | null>(null)
  const [editingValues, setEditingValues] = useState<{ [key: number]: string }>({})

  // Estados do formulário
  const [formData, setFormData] = useState({
    chave: "",
    valor: "",
    descricao: "",
    tipo: "string" as "string" | "number" | "boolean" | "email",
    categoria: "geral",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await getParametros()
      setParametros(data)
    } catch (error) {
      console.error("Erro ao carregar parâmetros:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar parâmetros",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.chave.trim() || !formData.valor.trim()) {
      toast({
        title: "Erro",
        description: "Chave e valor são obrigatórios",
        variant: "destructive",
      })
      return
    }

    try {
      const result = editingParam
        ? await updateParametro(editingParam.id, formData.valor)
        : await createParametro(formData)

      if (result.success) {
        toast({
          title: "Sucesso",
          description: editingParam ? "Parâmetro atualizado com sucesso!" : "Parâmetro criado com sucesso!",
        })
        setIsDialogOpen(false)
        resetForm()
        loadData()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Erro no formulário:", error)
      toast({
        title: "Erro",
        description: `Erro ao ${editingParam ? "atualizar" : "criar"} parâmetro`,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (param: Parametrizador) => {
    setEditingParam(param)
    setFormData({
      chave: param.chave,
      valor: param.valor,
      descricao: param.descricao || "",
      tipo: param.tipo,
      categoria: param.categoria,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este parâmetro?")) return

    try {
      const result = await deleteParametro(id)
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Parâmetro excluído com sucesso!",
        })
        loadData()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Erro ao excluir:", error)
      toast({
        title: "Erro",
        description: "Erro ao excluir parâmetro",
        variant: "destructive",
      })
    }
  }

  const handleQuickUpdate = async (id: number, valor: string) => {
    try {
      const result = await updateParametro(id, valor)
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Parâmetro atualizado!",
        })
        loadData()
        setEditingValues((prev) => {
          const newValues = { ...prev }
          delete newValues[id]
          return newValues
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Erro ao atualizar:", error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar parâmetro",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      chave: "",
      valor: "",
      descricao: "",
      tipo: "string",
      categoria: "geral",
    })
    setEditingParam(null)
  }

  const renderParameterValue = (param: Parametrizador) => {
    const isEditing = editingValues[param.id] !== undefined
    const currentValue = isEditing ? editingValues[param.id] : param.valor

    if (param.tipo === "boolean") {
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={currentValue === "true"}
            onCheckedChange={(checked) => handleQuickUpdate(param.id, checked.toString())}
          />
          <span className="text-sm">{currentValue === "true" ? "Ativo" : "Inativo"}</span>
        </div>
      )
    }

    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          <Input
            type={param.tipo === "number" ? "number" : param.tipo === "email" ? "email" : "text"}
            value={currentValue}
            onChange={(e) => setEditingValues((prev) => ({ ...prev, [param.id]: e.target.value }))}
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={() => handleQuickUpdate(param.id, currentValue)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setEditingValues((prev) => {
                const newValues = { ...prev }
                delete newValues[param.id]
                return newValues
              })
            }
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{param.valor}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setEditingValues((prev) => ({ ...prev, [param.id]: param.valor }))}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const categorias = [...new Set(parametros.map((p) => p.categoria))]

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando configurações...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-blue">Configurações do Sistema</h1>
          <p className="text-primary-gray mt-2">Gerencie os parâmetros de configuração do ClockFlow</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-primary-blue hover:bg-primary-blue/90"
              onClick={() => {
                console.log("Dialog state changing to:", true)
                resetForm()
                setIsDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Parâmetro
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingParam ? "Editar Parâmetro" : "Novo Parâmetro"}</DialogTitle>
              <DialogDescription>
                {editingParam
                  ? "Edite as informações do parâmetro."
                  : "Preencha os dados para criar um novo parâmetro."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chave">Chave *</Label>
                  <Input
                    id="chave"
                    value={formData.chave}
                    onChange={(e) => setFormData((prev) => ({ ...prev, chave: e.target.value }))}
                    placeholder="nome_parametro"
                    disabled={!!editingParam}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, categoria: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="geral">Geral</SelectItem>
                      <SelectItem value="ponto">Ponto</SelectItem>
                      <SelectItem value="notificacao">Notificação</SelectItem>
                      <SelectItem value="sistema">Sistema</SelectItem>
                      <SelectItem value="seguranca">Segurança</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: "string" | "number" | "boolean" | "email") =>
                      setFormData((prev) => ({ ...prev, tipo: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">Texto</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="boolean">Verdadeiro/Falso</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor *</Label>
                  <Input
                    id="valor"
                    type={formData.tipo === "number" ? "number" : formData.tipo === "email" ? "email" : "text"}
                    value={formData.valor}
                    onChange={(e) => setFormData((prev) => ({ ...prev, valor: e.target.value }))}
                    placeholder="Valor do parâmetro"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição do parâmetro"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary-blue hover:bg-primary-blue/90">
                  {editingParam ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue={categorias[0] || "geral"} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {categorias.map((categoria) => (
            <TabsTrigger key={categoria} value={categoria} className="capitalize">
              {categoria}
            </TabsTrigger>
          ))}
        </TabsList>

        {categorias.map((categoria) => (
          <TabsContent key={categoria} value={categoria} className="space-y-4">
            <div className="grid gap-4">
              {parametros
                .filter((param) => param.categoria === categoria)
                .map((param) => (
                  <Card key={param.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{param.chave}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {param.tipo}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(param)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(param.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {param.descricao && <CardDescription>{param.descricao}</CardDescription>}
                    </CardHeader>
                    <CardContent>{renderParameterValue(param)}</CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {parametros.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum parâmetro encontrado</h3>
            <p className="text-gray-500 text-center mb-4">Comece criando seu primeiro parâmetro de configuração.</p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-primary-blue hover:bg-primary-blue/90">
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Parâmetro
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
