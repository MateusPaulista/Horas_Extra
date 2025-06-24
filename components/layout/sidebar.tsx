"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, ClipboardList, Clock, FileText, Home, LogOut, Menu, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export function Sidebar({ className, collapsed = false, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(collapsed)

  useEffect(() => {
    setIsCollapsed(collapsed)
  }, [collapsed])

  const toggleCollapsed = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsed)
    }
  }

  const routes = [
    {
      label: "Início",
      icon: Home,
      href: "/dashboard",
      color: "text-clockflow-blue",
    },
    {
      label: "Cadastros",
      icon: ClipboardList,
      href: "/cadastros",
      color: "text-clockflow-blue",
      submenu: [
        {
          label: "Empresas",
          href: "/cadastros/empresas",
        },
        {
          label: "Funcionários",
          href: "/cadastros/funcionarios",
        },
        {
          label: "Centro de Custo",
          href: "/cadastros/centro-custo",
        },
        {
          label: "Turnos",
          href: "/cadastros/turnos",
        },
        {
          label: "Planejamento",
          href: "/cadastros/planejamento",
        },
        {
          label: "Batida de Ponto",
          href: "/cadastros/batida-ponto",
        },
        {
          label: "Liberação Horas Extras",
          href: "/cadastros/liberacao-horas-extras",
        },
        {
          label: "Afastamentos",
          href: "/cadastros/afastamentos",
        },
        {
          label: "Horas Justificadas",
          href: "/cadastros/horas-justificadas",
        },
        {
          label: "Eventos",
          href: "/cadastros/eventos",
        },
      ],
    },
    {
      label: "Monitoramento",
      icon: Clock,
      href: "/monitoramento",
      color: "text-clockflow-blue",
    },
    {
      label: "Dashboards",
      icon: BarChart3,
      href: "/dashboards",
      color: "text-clockflow-blue",
    },
    {
      label: "Relatórios",
      icon: FileText,
      href: "/relatorios",
      color: "text-clockflow-blue",
    },
    {
      label: "Parametrização",
      icon: Settings,
      href: "/configuracoes",
      color: "text-clockflow-blue",
    },
  ]

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="outline" size="icon" className="h-10 w-10">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 bg-[#2c3739] text-white">
          <SidebarContent routes={routes} pathname={pathname} setIsOpen={setIsOpen} />
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          "hidden md:flex md:flex-col h-screen border-r bg-[#2c3739] text-white overflow-hidden sticky top-0 left-0 transition-all duration-300",
          isCollapsed ? "w-16" : "w-72",
          className,
        )}
      >
        <SidebarContent
          routes={routes}
          pathname={pathname}
          isCollapsed={isCollapsed}
          toggleCollapsed={toggleCollapsed}
        />
      </div>
    </>
  )
}

interface SidebarContentProps {
  routes: {
    label: string
    icon: any
    href: string
    color: string
    submenu?: { label: string; href: string }[]
  }[]
  pathname: string
  setIsOpen?: (open: boolean) => void
  isCollapsed?: boolean
  toggleCollapsed?: () => void
}

function SidebarContent({ routes, pathname, setIsOpen, isCollapsed, toggleCollapsed }: SidebarContentProps) {
  // Automaticamente abrir o submenu se estiver em uma página de cadastro
  const initialOpenSubmenu = pathname.includes("/cadastros") ? "Cadastros" : null
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(initialOpenSubmenu)

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label)
  }

  const handleLinkClick = () => {
    if (setIsOpen) {
      setIsOpen(false)
    }
  }

  return (
    <>
      <div className="flex h-16 items-center border-b px-6">
        <div
          className={cn(
            "flex items-center gap-2 font-semibold cursor-pointer",
            isCollapsed ? "justify-center px-0" : "",
          )}
          onClick={toggleCollapsed}
        >
          <Clock className="h-6 w-6 text-white" />
          {!isCollapsed && <span className="text-xl font-bold text-white">ClockFlow</span>}
        </div>
      </div>
      <ScrollArea className="flex-1 py-2 h-full">
        <nav className={cn("grid gap-1", isCollapsed ? "px-1" : "px-2")}>
          {routes.map((route) => (
            <div key={route.label}>
              {route.submenu && !isCollapsed ? (
                <div className="flex flex-col">
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex justify-between items-center w-full",
                      pathname.includes(route.href) && "bg-gray-600",
                    )}
                    onClick={() => toggleSubmenu(route.label)}
                  >
                    <div className="flex items-center">
                      <route.icon className={cn("mr-2 h-5 w-5", route.color)} />
                      <span className="text-clockflow-blue font-medium text-base">{route.label}</span>
                    </div>
                    <div
                      className={cn("transform transition-transform", openSubmenu === route.label ? "rotate-90" : "")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-clockflow-blue"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </Button>
                  {openSubmenu === route.label && (
                    <div className="ml-6 mt-1 grid gap-1">
                      {route.submenu.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={handleLinkClick}
                          className={cn(
                            "flex items-center py-2 px-3 rounded-md hover:bg-gray-600 text-clockflow-blue font-medium text-base",
                            pathname === item.href && "bg-gray-600",
                          )}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={route.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center py-2 rounded-md hover:bg-gray-600 text-clockflow-blue font-medium",
                    pathname === route.href && "bg-gray-600",
                    isCollapsed ? "justify-center px-2" : "px-3",
                  )}
                  title={isCollapsed ? route.label : undefined}
                >
                  <route.icon className={cn("h-5 w-5", route.color)} />
                  {!isCollapsed && <span className="ml-2">{route.label}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>
      <div className={cn("mt-auto p-4 border-t", isCollapsed && "p-2")}>
        <Button
          variant="outline"
          className={cn("w-full", isCollapsed ? "justify-center px-0" : "justify-start")}
          onClick={() => {
            localStorage.removeItem("clockflow-token")
            window.location.href = "/login"
          }}
        >
          <LogOut className={cn("h-4 w-4", isCollapsed ? "mr-0" : "mr-2")} />
          {!isCollapsed && <span className="text-clockflow-blue font-medium">Sair</span>}
        </Button>
      </div>
    </>
  )
}
