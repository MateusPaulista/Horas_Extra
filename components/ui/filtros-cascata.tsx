"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { DateFilter } from "@/components/ui/date-filter"
import { Search, Filter } from "lucide-react"

interface FiltrosCascataProps {
  filtros: any
  opcoesFiltradas: any
  updateFiltro: (campo: string, valor: any) => void
  empresasExternas?: any[]
  mostrarEmpresa?: boolean
  mostrarCentroCusto?: boolean
  mostrarTurno?: boolean
  mostrarFuncionario?: boolean
  mostrarDataInicio?: boolean
  mostrarDataFim?: boolean
  mostrarBusca?: boolean
  placeholderBusca?: string
  valorBusca?: string
  onBuscaChange?: (valor: string) => void
}

export function FiltrosCascata({
  filtros,
  opcoesFiltradas,
  updateFiltro,
  empresasExternas,
  mostrarEmpresa = true,
  mostrarCentroCusto = true,
  mostrarTurno = true,
  mostrarFuncionario = false,
  mostrarDataInicio = false,
  mostrarDataFim = false,
  mostrarBusca = true,
  placeholderBusca = "Buscar...",
  valorBusca = "",
  onBuscaChange,
}: FiltrosCascataProps) {
  
  console.log("🎯 FiltrosCascata - Empresas externas:", empresasExternas?.length || 0)
  console.log("🎯 FiltrosCascata - Empresas filtradas:", opcoesFiltradas?.empresas?.length || 0)
  console.log("🎯 FiltrosCascata - Dados empresas externas:", empresasExternas)
  console.log("🎯 FiltrosCascata - Dados empresas filtradas:", opcoesFiltradas?.empresas)
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Campo de busca */}
      {mostrarBusca && (
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={placeholderBusca}
            value={valorBusca}
            onChange={(e) => onBuscaChange?.(e.target.value)}
            className="pl-8"
          />
        </div>
      )}

      {/* Filtro por empresa */}
      {mostrarEmpresa && (
        <div className="w-[200px]">
          <Select value={filtros.empresa} onValueChange={(value) => updateFiltro("empresa", value)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Filtrar por empresa" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">Todas as empresas</SelectItem>
              {(empresasExternas || opcoesFiltradas.empresas).map((empresa: any) => (
                <SelectItem key={empresa.id} value={empresa.id.toString()}>
                  {empresa.Estabelecimento}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Filtro por centro de custo */}
      {mostrarCentroCusto && (
        <div className="w-[200px]">
          <Select value={filtros.centroCusto} onValueChange={(value) => updateFiltro("centroCusto", value)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Filtrar por centro de custo" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">
                Todos os centros {filtros.empresa !== "all" && `(${opcoesFiltradas.centrosCusto.length})`}
              </SelectItem>
              {opcoesFiltradas.centrosCusto.map((centro: any) => (
                <SelectItem key={centro.id} value={centro.id.toString()}>
                  {centro.codigo ? `${centro.codigo} - ${centro.nome}` : centro.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Filtro por turno */}
      {mostrarTurno && (
        <div className="w-[200px]">
          <Select value={filtros.turno} onValueChange={(value) => updateFiltro("turno", value)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Filtrar por turno" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">
                Todos os turnos {filtros.empresa !== "all" && `(${opcoesFiltradas.turnos.length})`}
              </SelectItem>
              {opcoesFiltradas.turnos.map((turno: any) => (
                <SelectItem key={turno.id} value={turno.id.toString()}>
                  {turno.nome} ({turno.hora_inicio} - {turno.hora_fim})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Filtro por funcionário */}
      {mostrarFuncionario && (
        <div className="w-[200px]">
          <Select value={filtros.funcionario} onValueChange={(value) => updateFiltro("funcionario", value)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Filtrar por funcionário" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">
                Todos os funcionários {filtros.empresa !== "all" && `(${opcoesFiltradas.funcionarios.length})`}
              </SelectItem>
              {opcoesFiltradas.funcionarios.map((funcionario: any) => (
                <SelectItem key={funcionario.id} value={funcionario.id.toString()}>
                  {funcionario.matricula} - {funcionario.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Filtro por data início */}
      {mostrarDataInicio && (
        <div className="w-[180px]">
          <DateFilter
            value={filtros.dataInicio}
            onChange={(date) => updateFiltro("dataInicio", date)}
            placeholder="Data início"
          />
        </div>
      )}

      {/* Filtro por data fim */}
      {mostrarDataFim && (
        <div className="w-[180px]">
          <DateFilter
            value={filtros.dataFim}
            onChange={(date) => updateFiltro("dataFim", date)}
            placeholder="Data fim"
          />
        </div>
      )}

      {/* Indicador de filtros ativos */}
      {(filtros.empresa !== "all" ||
        filtros.centroCusto !== "all" ||
        filtros.turno !== "all" ||
        filtros.funcionario !== "all") && (
        <div className="flex items-center text-sm text-gray-500">
          <Filter className="h-3 w-3 mr-1" />
          Filtros ativos
        </div>
      )}
    </div>
  )
}
