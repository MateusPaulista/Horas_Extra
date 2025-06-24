"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { uploadFotoPerfil, getFotoPerfilUrl, supabase } from "@/lib/supabase"

interface ProfileEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUser: {
    name: string
    avatar: string
    initials: string
  }
  onSave: (userData: { name: string; avatar: string }) => void
}

export function ProfileEditDialog({ open, onOpenChange, currentUser, onSave }: ProfileEditDialogProps) {
  const [username, setUsername] = useState("")
  const [avatar, setAvatar] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (open && user?.email) {
      const loadUserData = async () => {
        try {
          // Carregar nome de usuário usando a função RPC
          const { data: usernameData, error: usernameError } = await supabase.rpc(
            'get_username_by_email',
            { user_email: user.email }
          )
          
          if (!usernameError && usernameData) {
            setUsername(usernameData)
          } else {
            // Fallback para o username do user_metadata ou email sem domínio
            setUsername(user?.user_metadata?.username || user?.email?.split('@')[0] || '')
          }
          
          // Carregar foto do bucket usando email + .jpg
          const photoFileName = `${user.email}.jpg`
          const photoUrl = await getFotoPerfilUrl(photoFileName)
          
          if (photoUrl) {
            setAvatar(photoUrl)
          } else {
            setAvatar("")
          }
          
        } catch (err) {
          console.error("Erro ao carregar dados do usuário:", err)
          setUsername(user?.email?.split('@')[0] || '')
          setAvatar("")
        }
      }
      
      loadUserData()
    }
  }, [open, user])

  const handleSave = async () => {
    if (!user?.email) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    let hasError = false
    let profileUpdated = false

    try {
      // Atualizar nome de usuário usando a função RPC
      if (username.trim()) {
        const { error: updateError } = await supabase.rpc(
          'update_user_username',
          { 
            user_id: user.id,
            new_username: username.trim() 
          }
        )
        
        if (updateError) {
          console.error("Erro ao atualizar nome de usuário:", updateError.message || updateError)
          toast({
            title: "Erro",
            description: `Erro ao atualizar nome de usuário: ${updateError.message || 'Erro desconhecido'}`,
            variant: "destructive",
          })
          hasError = true
        } else {
          console.log("Nome de usuário atualizado com sucesso")
          profileUpdated = true
        }
      }

      // Upload da foto se foi selecionada (sempre com nome email.jpg)
      if (selectedFile) {
        const photoFileName = `${user.email}.jpg`
        const uploadResult = await uploadFotoPerfil(selectedFile, photoFileName)
        const uploadError = uploadResult instanceof Error ? uploadResult : null
        
        if (uploadError) {
          console.error("Erro ao fazer upload da foto:", uploadError)
          toast({
            title: "Erro",
            description: "Erro ao fazer upload da foto de perfil",
            variant: "destructive",
          })
          hasError = true
        } else {
          console.log("Foto de perfil atualizada com sucesso")
          profileUpdated = true
          
          // Atualizar o avatar local com a nova foto
          const newPhotoUrl = await getFotoPerfilUrl(photoFileName)
          if (newPhotoUrl) {
            setAvatar(newPhotoUrl)
          }
        }
      }

      if (!hasError) {
        toast({
          title: "Sucesso",
          description: "Perfil atualizado com sucesso!",
        })
        
        // Limpar estados
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        
        // Atualizar o header com os novos dados do perfil
        if (profileUpdated || selectedFile) {
          const updatedAvatar = selectedFile ? avatar : currentUser.avatar
          onSave({
            name: username.trim() || currentUser.name,
            avatar: updatedAvatar
          })
        }
        
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Erro inesperado:", error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar perfil",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Use apenas arquivos JPG, PNG ou WebP.",
          variant: "destructive",
        })
        return
      }
      
      // Validar tamanho (5MB)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 5MB.",
          variant: "destructive",
        })
        return
      }
      
      setSelectedFile(file)
      
      // Criar preview da imagem
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setAvatar(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
      
      toast({
        title: "Imagem selecionada",
        description: "A foto será atualizada quando você salvar.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#0c9abe]">Editar Perfil</DialogTitle>
          <DialogDescription>Atualize suas informações de perfil. Clique em salvar quando terminar.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatar || "/placeholder.svg"} alt="Foto de perfil" />
              <AvatarFallback>{currentUser.initials}</AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              onClick={handleImageUpload}
              disabled={isUploading}
              className="w-full max-w-[200px]"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Carregando..." : "Alterar foto"}
            </Button>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nome de Usuário</Label>
              <Input 
                id="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Seu nome de usuário" 
              />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isUploading}>
            {isUploading ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
