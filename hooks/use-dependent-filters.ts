"use client"

import { useState, useEffect, useMemo } from "react"

interface FilterData {
  empresas: Array<{ id: string; nome: string }>
  centrosCusto: Array<{ id: string; nome: string; empresaId: string }>
  turnos: Array<{ id: string; nome: string; empresaId?: string; centroCustoId?: string }>
  funcionarios: Array<{ id: string; nome: string; empresaId: string; centroCustoId: string }>
}

interface FilterState {
  empresa: string
  centroCusto: string
  turno: string
  funcionario: string
}

export function useDependentFilters(data: FilterData) {
  const [filters, setFilters] = useState<FilterState>({
    empresa: "all",
    centroCusto: "all",
    turno: "all",
    funcionario: "all",
  })

  // Reset dependent filters when parent filter changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      centroCusto: "all",
      turno: "all",
      funcionario: "all",
    }))
  }, [filters.empresa])

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      turno: "all",
      funcionario: "all",
    }))
  }, [filters.centroCusto])

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      funcionario: "all",
    }))
  }, [filters.turno])

  // Get filtered options based on current selections
  const filteredOptions = useMemo(() => {
    const centrosCustoFiltrados =
      filters.empresa === "all" ? data.centrosCusto : data.centrosCusto.filter((cc) => cc.empresaId === filters.empresa)

    const turnosFiltrados = data.turnos.filter((turno) => {
      if (filters.empresa !== "all" && turno.empresaId && turno.empresaId !== filters.empresa) {
        return false
      }
      if (filters.centroCusto !== "all" && turno.centroCustoId && turno.centroCustoId !== filters.centroCusto) {
        return false
      }
      return true
    })

    const funcionariosFiltrados = data.funcionarios.filter((funcionario) => {
      if (filters.empresa !== "all" && funcionario.empresaId !== filters.empresa) {
        return false
      }
      if (filters.centroCusto !== "all" && funcionario.centroCustoId !== filters.centroCusto) {
        return false
      }
      return true
    })

    return {
      empresas: data.empresas,
      centrosCusto: centrosCustoFiltrados,
      turnos: turnosFiltrados,
      funcionarios: funcionariosFiltrados,
    }
  }, [data, filters])

  const updateFilter = (filterName: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }))
  }

  return {
    filters,
    filteredOptions,
    updateFilter,
    setFilters,
  }
}
