"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react"

export default function RedefinirSenhaPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [senha, setSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false)
  const [senhaRedefinida, setSenhaRedefinida] = useState(false)
  const [erro, setErro] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Verificar se há um token de redefinição de senha na URL
  useEffect(() => {
    const checkSession = async () => {
      // O Supabase já processa automaticamente o token na URL
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        setErro("Link de redefinição de senha inválido ou expirado.")
      }
    }

    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErro("")

    // Validar senhas
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.")
      return
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password: senha })

      if (error) throw error

      setSenhaRedefinida(true)
      toast({
        title: "Senha redefinida com sucesso",
        description: "Sua senha foi atualizada. Você já pode fazer login com a nova senha.",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao redefinir senha",
        description: error.message || "Não foi possível redefinir sua senha.",
        variant: "destructive",
      })
      setErro(error.message || "Não foi possível redefinir sua senha.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/placeholder.svg?height=80&width=80"
              alt="ClockFlow Logo"
              width={80}
              height={80}
              className="rounded-md"
            />
          </div>
          <CardTitle className="text-2xl text-[#0c9fae]">Redefinir Senha</CardTitle>
          <CardDescription>
            {senhaRedefinida ? "Sua senha foi redefinida com sucesso." : "Crie uma nova senha para sua conta."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{erro}</div>
          )}

          {!senhaRedefinida ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="senha">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                  >
                    {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmarSenha"
                    type={mostrarConfirmarSenha ? "text" : "password"}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                  >
                    {mostrarConfirmarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-[#0c9fae] hover:bg-[#0c9fae]/90" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redefinindo...
                  </>
                ) : (
                  "Redefinir Senha"
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Sua senha foi redefinida com sucesso. Agora você pode fazer login com sua nova senha.
              </p>
              <Link href="/login">
                <Button className="w-full bg-[#0c9fae] hover:bg-[#0c9fae]/90">Ir para o login</Button>
              </Link>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {!senhaRedefinida && (
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o login
              </Button>
            </Link>
          )}
          <p className="w-full text-center text-sm text-muted-foreground">
            ClockFlow &copy; {new Date().getFullYear()} - Controle de Jornada de Trabalho
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
