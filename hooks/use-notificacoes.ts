"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"

export interface Notificacao {
  id: number
  parametro_id?: number
  user_id: string
  titulo: string
  mensagem: string
  tipo: string
  lida: boolean
  data_envio: string
  data_leitura?: string
  created_at: string
  updated_at: string
}

export function useNotificacoes() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  // Dados mockados para garantir que o componente funcione mesmo sem conexão com o banco
  const notificacoesMock = [
    {
      id: 1,
      user_id: user?.id || "",
      parametro_id: 1,
      titulo: "Horas extras",
      mensagem: "João Silva excedeu o limite de horas extras diárias (3h)",
      tipo: "horas_extra",
      lida: false,
      data_envio: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      user_id: user?.id || "",
      parametro_id: 1,
      titulo: "Horas extras",
      mensagem: "Maria Oliveira excedeu o limite de horas extras mensais (45h)",
      tipo: "horas_extra",
      lida: true,
      data_envio: new Date().toISOString(),
      data_leitura: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      user_id: user?.id || "",
      parametro_id: 1,
      titulo: "Atraso",
      mensagem: "Carlos Santos excedeu o limite de horas de atraso (2h)",
      tipo: "atraso",
      lida: false,
      data_envio: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]

  const fetchNotificacoes = async () => {
    if (!user) {
      setNotificacoes(notificacoesMock)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("notificacoes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao buscar notificações:", error)
        setError("Erro ao buscar notificações")
        setNotificacoes(notificacoesMock) // Usa dados mockados em caso de erro
      } else {
        setNotificacoes(data || notificacoesMock)
      }
    } catch (err) {
      console.error("Erro ao buscar notificações:", err)
      setError("Erro ao buscar notificações")
      setNotificacoes(notificacoesMock) // Usa dados mockados em caso de erro
    } finally {
      setLoading(false)
    }
  }

  const marcarComoLida = async (id: number) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("notificacoes")
        .update({
          lida: true,
          data_leitura: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) {
        console.error("Erro ao marcar notificação como lida:", error)
        toast({
          title: "Erro",
          description: "Não foi possível marcar a notificação como lida",
          variant: "destructive",
        })
      } else {
        // Atualiza o estado local
        setNotificacoes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, lida: true, data_leitura: new Date().toISOString() } : n)),
        )
        toast({
          title: "Sucesso",
          description: "Notificação marcada como lida",
        })
      }
    } catch (err) {
      console.error("Erro ao marcar notificação como lida:", err)
      toast({
        title: "Erro",
        description: "Não foi possível marcar a notificação como lida",
        variant: "destructive",
      })
    }
  }

  const marcarTodasComoLidas = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("notificacoes")
        .update({
          lida: true,
          data_leitura: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("lida", false)

      if (error) {
        console.error("Erro ao marcar todas notificações como lidas:", error)
        toast({
          title: "Erro",
          description: "Não foi possível marcar as notificações como lidas",
          variant: "destructive",
        })
      } else {
        // Atualiza o estado local
        setNotificacoes((prev) =>
          prev.map((n) => (!n.lida ? { ...n, lida: true, data_leitura: new Date().toISOString() } : n)),
        )
        toast({
          title: "Sucesso",
          description: "Todas as notificações foram marcadas como lidas",
        })
      }
    } catch (err) {
      console.error("Erro ao marcar todas notificações como lidas:", err)
      toast({
        title: "Erro",
        description: "Não foi possível marcar as notificações como lidas",
        variant: "destructive",
      })
    }
  }

  const excluirNotificacao = async (id: number) => {
    if (!user) return

    try {
      const { error } = await supabase.from("notificacoes").delete().eq("id", id).eq("user_id", user.id)

      if (error) {
        console.error("Erro ao excluir notificação:", error)
        toast({
          title: "Erro",
          description: "Não foi possível excluir a notificação",
          variant: "destructive",
        })
      } else {
        // Atualiza o estado local
        setNotificacoes((prev) => prev.filter((n) => n.id !== id))
        toast({
          title: "Sucesso",
          description: "Notificação excluída com sucesso",
        })
      }
    } catch (err) {
      console.error("Erro ao excluir notificação:", err)
      toast({
        title: "Erro",
        description: "Não foi possível excluir a notificação",
        variant: "destructive",
      })
    }
  }

  const criarNotificacao = async (notificacao: Omit<Notificacao, "id" | "created_at" | "updated_at">) => {
    if (!user) return

    try {
      const { error } = await supabase.from("notificacoes").insert({
        ...notificacao,
        user_id: user.id,
      })

      if (error) {
        console.error("Erro ao criar notificação:", error)
        toast({
          title: "Erro",
          description: "Não foi possível criar a notificação",
          variant: "destructive",
        })
      } else {
        // Recarrega as notificações
        fetchNotificacoes()
        toast({
          title: "Sucesso",
          description: "Notificação criada com sucesso",
        })
      }
    } catch (err) {
      console.error("Erro ao criar notificação:", err)
      toast({
        title: "Erro",
        description: "Não foi possível criar a notificação",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchNotificacoes()
  }, [user])

  return {
    notificacoes,
    loading,
    error,
    fetchNotificacoes,
    marcarComoLida,
    marcarTodasComoLidas,
    excluirNotificacao,
    criarNotificacao,
  }
}
