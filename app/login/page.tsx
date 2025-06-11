"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { signIn, user, isLoading: authLoading } = useAuth()

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!email || !password) {
      setError("Por favor, preencha todos os campos.")
      setIsLoading(false)
      return
    }

    try {
      const { error: loginError } = await signIn(email.trim().toLowerCase(), password)

      if (loginError) {
        console.error("Erro de login:", loginError)

        // Mapear erros específicos para mensagens mais claras
        if (loginError.message?.includes("Invalid login credentials")) {
          setError("Email ou senha incorretos. Verifique suas credenciais.")
        } else if (loginError.message?.includes("Email not confirmed")) {
          setError("Email não confirmado. Entre em contato com o administrador.")
        } else if (loginError.message?.includes("Too many requests")) {
          setError("Muitas tentativas de login. Tente novamente em alguns minutos.")
        } else if (loginError.message?.includes("User not found")) {
          setError("Usuário não encontrado. Verifique o email informado.")
        } else {
          setError("Erro ao fazer login. Verifique suas credenciais.")
        }

        setIsLoading(false)
        return
      }

      // Login bem-sucedido - o redirecionamento será feito pelo useEffect
    } catch (err) {
      console.error("Erro inesperado:", err)
      setError("Ocorreu um erro inesperado. Tente novamente.")
      setIsLoading(false)
    }
  }

  // Mostrar loading se ainda estiver verificando autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#4A5C60] via-[#0C9ABE] to-[#4A5C60]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#0C9ABE] mx-auto"></div>
          <p className="mt-4 text-white/80">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#4A5C60] via-[#0C9ABE] to-[#4A5C60] p-4">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-[#0C9ABE] rounded-full blur-lg opacity-30"></div>
                <div className="relative p-4 bg-[#0C9ABE] rounded-full">
                  <Clock className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-[#0C9ABE]">ClockFlow</CardTitle>
            <CardDescription className="text-[#4A5C60] text-base mt-2">
              Sistema de Controle de Jornada de Trabalho
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#4A5C60] font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-12 border-slate-200 focus:border-[#0C9ABE] focus:ring-[#0C9ABE]/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#4A5C60] font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="h-12 pr-12 border-slate-200 focus:border-[#0C9ABE] focus:ring-[#0C9ABE]/20 transition-all duration-200"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="flex items-start space-x-3 text-red-600 text-sm p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-[#0C9ABE] hover:bg-[#0C9ABE]/90 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-200">
              <p className="text-center text-sm text-[#4A5C60]">
                Para criar uma conta, entre em contato com o administrador do sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
