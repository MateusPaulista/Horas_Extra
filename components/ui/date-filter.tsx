"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DateFilterProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function DateFilter({ value, onChange, placeholder = "Selecionar data", className }: DateFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  // Atualizar input quando value muda
  React.useEffect(() => {
    if (value) {
      setInputValue(format(value, "dd/MM/yyyy"))
    } else {
      setInputValue("")
    }
  }, [value])

  // Função para formatar data automaticamente durante a digitação
  const formatarDataInput = (valor: string) => {
    // Remove tudo que não é número
    const apenasNumeros = valor.replace(/\D/g, "")

    // Aplica formatação progressiva
    if (apenasNumeros.length <= 2) {
      return apenasNumeros
    } else if (apenasNumeros.length <= 4) {
      return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2)}`
    } else if (apenasNumeros.length <= 8) {
      return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2, 4)}/${apenasNumeros.slice(4, 8)}`
    }

    return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2, 4)}/${apenasNumeros.slice(4, 8)}`
  }

  // Função para validar e converter data
  const parseData = (dataString: string): Date | null => {
    const match = dataString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (!match) return null

    const [, dia, mes, ano] = match
    const data = new Date(Number.parseInt(ano), Number.parseInt(mes) - 1, Number.parseInt(dia))

    // Verificar se a data é válida
    if (
      data.getDate() === Number.parseInt(dia) &&
      data.getMonth() === Number.parseInt(mes) - 1 &&
      data.getFullYear() === Number.parseInt(ano)
    ) {
      return data
    }

    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value
    const valorFormatado = formatarDataInput(valor)
    setInputValue(valorFormatado)

    // Se a data estiver completa, tentar fazer o parse
    if (valorFormatado.length === 10) {
      const dataParsed = parseData(valorFormatado)
      if (dataParsed) {
        onChange(dataParsed)
      }
    } else if (valorFormatado === "") {
      onChange(undefined)
    }
  }

  const handleInputBlur = () => {
    if (inputValue.length === 10) {
      const dataParsed = parseData(inputValue)
      if (dataParsed) {
        onChange(dataParsed)
      } else {
        // Se a data não for válida, limpar o campo
        setInputValue("")
        onChange(undefined)
      }
    }
  }

  const handleCalendarSelect = (date: Date | undefined) => {
    onChange(date)
    setIsOpen(false)
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="pr-10"
          maxLength={10}
        />
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setIsOpen(true)}
            >
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Abrir calendário</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white" align="start">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleCalendarSelect}
              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
