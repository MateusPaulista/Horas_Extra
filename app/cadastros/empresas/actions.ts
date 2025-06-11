"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getEmpresas() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("empresa").select("*").order("cod_estabel", { ascending: true })

  if (error) {
    console.error("Erro ao buscar empresas:", error)
    return []
  }

  return data
}

export async function getEmpresa(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("empresa").select("*").eq("id_empresa", id).single()

  if (error) {
    console.error("Erro ao buscar empresa:", error)
    return null
  }

  return data
}

export async function createEmpresa(formData: FormData) {
  const supabase = await createClient()

  const cod_estabel = formData.get("cod_estabel") as string
  const descricao = formData.get("descricao") as string

  console.log("Criando empresa:", { cod_estabel, descricao })

  try {
    const { data, error } = await supabase
      .from("empresa")

      .insert([
        {
          cod_estabel: cod_estabel.trim(),
          descricao: descricao.trim(),
        },
      ])
      .select()

    if (error) {
      console.error("Erro ao criar empresa:", error)
      return { success: false, error: error.message }
    }

    console.log("Empresa criada com sucesso:", data)
    revalidatePath("/cadastros/empresas")
    return { success: true, data }
  } catch (error) {
    console.error("Erro inesperado ao criar empresa:", error)
    return { success: false, error: "Erro inesperado ao criar empresa" }
  }
}

export async function updateEmpresa(id: string, formData: FormData) {
  const supabase = await createClient()

  const cod_estabel = formData.get("cod_estabel") as string
  const descricao = formData.get("descricao") as string

  console.log("Atualizando empresa:", { id, cod_estabel, descricao })

  try {
    const { data, error } = await supabase
      .from("empresa")

      .update({
        cod_estabel: cod_estabel.trim(),
        descricao: descricao.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id_empresa", id)
      .select()

    if (error) {
      console.error("Erro ao atualizar empresa:", error)
      return { success: false, error: error.message }
    }

    console.log("Empresa atualizada com sucesso:", data)
    revalidatePath("/cadastros/empresas")
    return { success: true, data }
  } catch (error) {
    console.error("Erro inesperado ao atualizar empresa:", error)
    return { success: false, error: "Erro inesperado ao atualizar empresa" }
  }
}

export async function deleteEmpresa(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("empresa").delete().eq("id_empresa", id)

  if (error) {
    console.error("Erro ao excluir empresa:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/cadastros/empresas")
  return { success: true }
}
