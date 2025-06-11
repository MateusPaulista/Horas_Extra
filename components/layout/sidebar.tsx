"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Clock,
  Home,
  Users,
  Building2,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Calendar,
  Target,
  ClipboardList,
} from "lucide-react"

const menuItems = [
  {
    title: "Início",
    href: "/",
    icon: Home,
  },
  {
    title: "Cadastros",
    icon: UserPlus,
    submenu: [
      { title: "Empresas", href: "/cadastros/empresas", icon: Building2 },
      { title: "Funcionários", href: "/cadastros/funcionarios", icon: Users },
      { title: "Centro de Custo", href: "/cadastros/centro-custo", icon: Target },
      { title: "Turnos", href: "/cadastros/turnos", icon: Clock },
      { title: "Planejamento", href: "/cadastros/planejamento", icon: Calendar },
      { title: "Batida de Ponto", href: "/cadastros/batida-ponto", icon: ClipboardList },
    ],
  },
  {
    title: "Monitoramento",
    href: "/monitoramento",
    icon: BarChart3,
  },
  {
    title: "Dashboards",
    href: "/dashboards",
    icon: BarChart3,
  },
  {
    title: "Relatórios",
    href: "/relatorios",
    icon: FileText,
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(["Cadastros"])
  const pathname = usePathname()

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  return (
    <div
      className={cn(
        "border-r border-gray-200 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64",
      )}
      style={{ backgroundColor: '#2c3739' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-600 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary-blue rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold" style={{ color: '#29b6c5' }}>ClockFlow</h1>
              <p className="text-xs" style={{ color: '#29b6c5' }}>Controle de Jornada</p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="p-2 hover:bg-gray-600">
          {collapsed ? <ChevronRight className="h-4 w-4" style={{ color: '#0c9abe' }} /> : <ChevronLeft className="h-4 w-4" style={{ color: '#0c9abe' }} />}
        </Button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isExpanded = expandedItems.includes(item.title)

          if (item.submenu) {
            return (
              <div key={item.title}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start hover:bg-gray-600",
                    collapsed && "justify-center px-2",
                  )}
                  onClick={() => !collapsed && toggleExpanded(item.title)}
                >
                  <Icon className="h-4 w-4" style={{ color: '#0c9abe' }} />
                  {!collapsed && (
                    <>
                      <span className="ml-2" style={{ color: '#29b6c5' }}>{item.title}</span>
                      <ChevronRight className={cn("h-4 w-4 ml-auto transition-transform", isExpanded && "rotate-90")} style={{ color: '#0c9abe' }} />
                    </>
                  )}
                </Button>
                {!collapsed && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.submenu.map((subItem) => {
                      const SubIcon = subItem.icon
                      const isSubActive = pathname === subItem.href
                      return (
                        <Link key={subItem.href} href={subItem.href}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start text-sm hover:bg-gray-600",
                              isSubActive && "bg-gray-600",
                            )}
                          >
                            <SubIcon className="h-3 w-3" style={{ color: '#0c9abe' }} />
                            <span className="ml-2" style={{ color: '#29b6c5' }}>{subItem.title}</span>
                          </Button>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start hover:bg-gray-600",
                  isActive && "bg-gray-600",
                  collapsed && "justify-center px-2",
                )}
              >
                <Icon className="h-4 w-4" style={{ color: '#0c9abe' }} />
                {!collapsed && <span className="ml-2" style={{ color: '#29b6c5' }}>{item.title}</span>}
              </Button>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
