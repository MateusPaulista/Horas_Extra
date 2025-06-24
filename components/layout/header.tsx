"use client"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Bell, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProfileEditDialog } from "@/components/profile-edit-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { getFotoPerfilUrl, verificarFotoPerfilExiste, supabase } from "@/lib/supabase"

// Add this interface before the Header component:
interface UserProfile {
  name: string
  avatar: string
  initials: string
}

export function Header({
  useTitleColor = false,
  onToggleSidebar,
}: {
  useTitleColor?: boolean
  onToggleSidebar?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { user, signOut } = useAuth()
  const [pageTitle, setPageTitle] = useState("")
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Admin",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "AD",
  })
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)

  // Contador de notificações (será integrado com dados reais posteriormente)
  const notificacoesNaoLidas = 0

  useEffect(() => {
    // Define o título da página com base no pathname
    const path = pathname.split("/").filter(Boolean)

    if (path.length === 0 || path[0] === "dashboard") {
      setPageTitle("Dashboard")
    } else if (path[0] === "cadastros") {
      if (path.length === 1) {
        setPageTitle("Cadastros")
      } else {
        const subpath = path[1]
        const titles: Record<string, string> = {
          empresas: "Cadastro de Empresas",
          funcionarios: "Cadastro de Funcionários",
          "centro-custo": "Cadastro de Centro de Custo",
          turnos: "Cadastro de Turnos",
          planejamento: "Cadastro de Planejamento",
          "batida-ponto": "Cadastro de Batida de Ponto",
        }
        setPageTitle(titles[subpath] || "Cadastros")
      }
    } else if (path[0] === "monitoramento") {
      setPageTitle("Monitoramento")
    } else if (path[0] === "dashboards") {
      setPageTitle("Dashboards")
    } else if (path[0] === "relatorios") {
      setPageTitle("Relatórios")
    } else if (path[0] === "configuracoes") {
      setPageTitle("Parametrização")
    } else if (path[0] === "notificacoes") {
      setPageTitle("Notificações")
    } else {
      setPageTitle("ClockFlow")
    }

    // Carregar dados do usuário atual com foto melhorada
    if (user && user.email) {
      const loadUserProfile = async () => {
        try {
          const userEmail = user.email
          if (!userEmail) {
            console.warn("⚠️ Email do usuário não disponível")
            return
          }
          
          console.log(`👤 Carregando perfil para usuário: ${userEmail}`)
          
          // Tentar obter o nome de usuário personalizado
          let userName = user.user_metadata?.username || user.email?.split("@")[0] || "Usuário"
          
          // Verificar se existe um username personalizado na tabela auth (apenas se autenticado)
          try {
            const { data: usernameData, error: usernameError } = await supabase.rpc(
              'get_username_by_email',
              { user_email: userEmail }
            )
            
            if (!usernameError && usernameData) {
              userName = usernameData
              console.log(`✅ Nome de usuário carregado: ${usernameData}`)
            } else if (usernameError) {
              console.warn("⚠️ Erro ao carregar nome de usuário personalizado:", usernameError.message || usernameError)
            }
          } catch (rpcError) {
            console.warn("⚠️ Falha na chamada RPC para username:", rpcError)
          }
          
          const userInitials = userName.substring(0, 2).toUpperCase()

          // Carregar foto de perfil apenas se o usuário estiver autenticado
          let avatarUrl = "/placeholder.svg?height=40&width=40"
          
          try {
            const photoFileName = `${userEmail}.jpg`
            const fotoExiste = await verificarFotoPerfilExiste(photoFileName)

            if (fotoExiste) {
              const fotoUrl = await getFotoPerfilUrl(photoFileName)
              if (fotoUrl) {
                avatarUrl = fotoUrl
                console.log(`✅ Foto de perfil carregada: ${fotoUrl}`)
              }
            } else {
              console.log(`📷 Nenhuma foto de perfil encontrada para: ${photoFileName}`)
            }
          } catch (photoError) {
            console.warn("⚠️ Erro ao carregar foto de perfil:", photoError)
          }

          setUserProfile({
            name: userName,
            avatar: avatarUrl,
            initials: userInitials,
          })
        } catch (error) {
          console.error("❌ Erro ao carregar perfil do usuário:", error)
          const fallbackName = user.user_metadata?.username || user.email?.split("@")[0] || "Usuário"
          const fallbackInitials = fallbackName.substring(0, 2).toUpperCase()
          
          setUserProfile({
            name: fallbackName,
            avatar: "/placeholder.svg?height=40&width=40",
            initials: fallbackInitials,
          })
        }
      }

      loadUserProfile()
    }
  }, [pathname, user])

  const handleProfileUpdate = (userData: { name: string; avatar: string }) => {
    setUserProfile((prev) => ({
      ...prev,
      name: userData.name,
      avatar: userData.avatar,
    }))
  }

  const handleLogout = async () => {
    try {
      await signOut()
      toast({
        title: "Logout realizado com sucesso",
        description: "Até logo!",
      })
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente",
        variant: "destructive",
      })
    }
  }

  // Função para navegar para a página de notificações
  const irParaNotificacoes = () => {
    router.push("/notificacoes")
  }

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
      <div className="flex-1">
        <div className="flex items-center cursor-pointer" onClick={onToggleSidebar}>
          <h1 className="text-lg font-semibold md:text-xl text-[#0c9fae]">
            Seja Bem-vindo ao ClockFlow, {userProfile.name}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="relative" onClick={irParaNotificacoes}>
          <Bell className="h-5 w-5" />
          {notificacoesNaoLidas > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-xs text-white flex items-center justify-center">
              {notificacoesNaoLidas > 9 ? "9+" : notificacoesNaoLidas}
            </span>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={userProfile.avatar || "/placeholder.svg"}
                  alt={`Avatar de ${userProfile.name}`}
                  onError={(e) => {
                    console.warn(`⚠️ Erro ao carregar avatar: ${userProfile.avatar}`)
                    // Fallback para placeholder se a imagem falhar
                    e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                  }}
                />
                <AvatarFallback>{userProfile.initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setProfileDialogOpen(true)}>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={irParaNotificacoes}>
              <Bell className="mr-2 h-4 w-4" />
              <span>Notificações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ProfileEditDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        currentUser={userProfile}
        onSave={handleProfileUpdate}
      />
    </header>
  )
}
