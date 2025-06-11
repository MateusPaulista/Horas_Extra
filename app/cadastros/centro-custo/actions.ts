"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getCentrosCusto() {
  const supabase = await createClient()

  try {
    console.log("Buscando centros de custo...")

    // Primeiro, buscar os centros de custo
    const { data: centrosCusto, error: centrosError } = await supabase
      .from("centro_custo")
      .select(`
        id_centro,
        codigo,
        descricao,
        cod_estabel,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false })

    if (centrosError) {
      console.error("Erro ao buscar centros de custo:", centrosError)
      return []
    }

    console.log("Centros de custo encontrados:", centrosCusto?.length || 0)

    if (!centrosCusto || centrosCusto.length === 0) {
      return []
    }

    // Buscar todas as empresas
    const { data: empresas, error: empresasError } = await supabase
      .from("empresa")
      .select("id_empresa, cod_estabel, descricao")

    if (empresasError) {
      console.error("Erro ao buscar empresas:", empresasError)
      // Retornar centros de custo sem empresa
      return centrosCusto
    }

    // Fazer o join manualmente
    const centrosCustoComEmpresa = centrosCusto.map(centro => {
      const empresa = empresas?.find(emp => emp.cod_estabel === centro.cod_estabel)
      return {
        ...centro,
        empresa: empresa || null
      }
    })

    console.log("Dados dos centros de custo com empresa:", JSON.stringify(centrosCustoComEmpresa, null, 2))
    return centrosCustoComEmpresa
  } catch (error) {
    console.error("Erro ao buscar centros de custo:", error)
    return []
  }
}

export async function getEmpresas() {
  const supabase = await createClient()

  try {
    console.log("Buscando empresas...")

    const { data, error } = await supabase
      .from("empresa")
      .select("id_empresa, cod_estabel, descricao")
      .order("descricao", { ascending: true })

    if (error) {
      console.error("Erro ao buscar empresas:", error)
      return []
    }

    console.log("Empresas encontradas:", data?.length || 0)
    return data || []
  } catch (error) {
    console.error("Erro ao buscar empresas:", error)
    return []
  }
}

export async function createCentroCusto(data: {
  codigo: string
  descricao: string
  cod_estabel: string
}) {
  const supabase = await createClient()

  const { data: centroCusto, error } = await supabase
    .from('centro_custo')
    .insert({
      codigo: data.codigo,
      descricao: data.descricao,
      cod_estabel: data.cod_estabel
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar centro de custo:', error)
    throw new Error('Erro ao criar centro de custo')
  }

  return centroCusto
}

export async function updateCentroCusto(id: string, data: {
  codigo: string
  descricao: string
  cod_estabel: string
}) {
  const supabase = await createClient()

  const { data: centroCusto, error } = await supabase
    .from('centro_custo')
    .update({
      codigo: data.codigo,
      descricao: data.descricao,
      cod_estabel: data.cod_estabel,
      updated_at: new Date().toISOString()
    })
    .eq('id_centro', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar centro de custo:', error)
    throw new Error('Erro ao atualizar centro de custo')
  }

  return centroCusto
}

export async function deleteCentroCusto(id: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from("centro_custo").delete().eq("id_centro", id)

    if (error) {
      console.error("Erro ao excluir centro de custo:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/cadastros/centro-custo")
    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir centro de custo:", error)
    return { success: false, error: "Ocorreu um erro ao excluir o centro de custo." }
  }
}
