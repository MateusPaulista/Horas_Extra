"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Parametrizador } from "@/lib/types"

export async function getParametros(): Promise<Parametrizador[]> {
  try {
    console.log("Buscando parâmetros...")
    const supabase = createClient()

    const { data, error } = await supabase
      .from("parametrizador")
      .select("*")
      .order("categoria", { ascending: true })
      .order("chave", { ascending: true })

    if (error) {
      console.error("Erro ao buscar parâmetros:", error)
      throw error
    }

    console.log("Parâmetros encontrados:", data?.length || 0)
    return data || []
  } catch (error) {
    console.error("Erro ao buscar parâmetros:", error)
    throw error
  }
}

export async function updateParametro(id: number, valor: string) {
  try {
    console.log("Atualizando parâmetro:", { id, valor })
    const supabase = createClient()

    const { data, error } = await supabase
      .from("parametrizador")
      .update({
        valor: valor.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Erro ao atualizar parâmetro:", error)
      throw error
    }

    console.log("Parâmetro atualizado:", data)
    revalidatePath("/configuracoes")
    return { success: true, data }
  } catch (error) {
    console.error("Erro ao atualizar parâmetro:", error)
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" }
  }
}

export async function createParametro(parametro: Omit<Parametrizador, "id" | "created_at" | "updated_at">) {
  try {
    console.log("Criando parâmetro:", parametro)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("parametrizador")
      .insert({
        chave: parametro.chave.trim(),
        valor: parametro.valor.trim(),
        descricao: parametro.descricao?.trim(),
        tipo: parametro.tipo,
        categoria: parametro.categoria.trim(),
      })
      .select()
      .single()

    if (error) {
      console.error("Erro ao criar parâmetro:", error)
      throw error
    }

    console.log("Parâmetro criado:", data)
    revalidatePath("/configuracoes")
    return { success: true, data }
  } catch (error) {
    console.error("Erro ao criar parâmetro:", error)
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" }
  }
}

export async function deleteParametro(id: number) {
  try {
    console.log("Excluindo parâmetro:", id)
    const supabase = createClient()

    const { error } = await supabase.from("parametrizador").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir parâmetro:", error)
      throw error
    }

    console.log("Parâmetro excluído com sucesso")
    revalidatePath("/configuracoes")
    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir parâmetro:", error)
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" }
  }
}
