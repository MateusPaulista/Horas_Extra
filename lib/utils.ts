import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h${m > 0 ? ` ${m}m` : ""}`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR").format(date)
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function calculateWorkingHours(entries: string[]): number {
  if (entries.length < 2) return 0

  let totalMinutes = 0

  for (let i = 0; i < entries.length - 1; i += 2) {
    const start = entries[i]
    const end = entries[i + 1]

    if (start && end) {
      const startMinutes = timeToMinutes(start)
      const endMinutes = timeToMinutes(end)
      totalMinutes += endMinutes - startMinutes
    }
  }

  return totalMinutes / 60
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

export function getStatusColor(status: "positive" | "negative"): string {
  return status === "positive" ? "text-green-600" : "text-red-600"
}

export function getStatusBgColor(status: "positive" | "negative"): string {
  return status === "positive" ? "bg-green-50" : "bg-red-50"
}
