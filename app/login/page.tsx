"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { signIn, loading, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await signIn(email, password)

      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao ClockFlow",
      })

      // Redirecionar imediatamente após login bem-sucedido
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas",
        variant: "destructive",
      })
    }
  }

  // Se já estiver autenticado, não mostrar a página de login
  if (isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0c9fae] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-[#0c9fae]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Circles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#0c9fae]/20 rounded-full blur-xl animate-float-slow"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-2xl animate-float-slower"></div>
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-cyan-400/25 rounded-full blur-lg animate-float-fast"></div>

        {/* Geometric Shapes */}
        <div className="absolute top-10 right-10 w-20 h-20 border-2 border-[#0c9fae]/30 rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-20 left-20 w-16 h-16 bg-gradient-to-r from-[#0c9fae]/20 to-blue-500/20 rotate-12 animate-pulse-slow"></div>
        <div className="absolute top-1/2 right-20 w-12 h-12 bg-cyan-300/30 rounded-full animate-bounce-slow"></div>

        {/* Clock-inspired Elements */}
        <div className="absolute top-20 left-1/2 w-32 h-32 border border-[#0c9fae]/20 rounded-full animate-spin-very-slow">
          <div className="absolute top-1/2 left-1/2 w-1 h-12 bg-[#0c9fae]/40 origin-bottom -translate-x-1/2 -translate-y-full animate-clock-hand"></div>
        </div>

        {/* Flowing Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1000 1000">
          <path
            d="M0,300 Q250,100 500,300 T1000,300"
            stroke="url(#gradient1)"
            strokeWidth="2"
            fill="none"
            className="animate-flow"
          />
          <path
            d="M0,600 Q250,400 500,600 T1000,600"
            stroke="url(#gradient2)"
            strokeWidth="2"
            fill="none"
            className="animate-flow-reverse"
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0c9fae" stopOpacity="0" />
              <stop offset="50%" stopColor="#0c9fae" stopOpacity="1" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="1" />
              <stop offset="100%" stopColor="#0c9fae" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Particle Effect */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => {
            // Valores pré-definidos para evitar problemas de hidratação
            const positions = [
              { left: 45.71, top: 11.92, delay: 4.18, duration: 11.22 },
              { left: 85.14, top: 89.83, delay: 0.16, duration: 10.74 },
              { left: 29.12, top: 59.10, delay: 4.60, duration: 9.03 },
              { left: 57.13, top: 35.64, delay: 4.01, duration: 8.74 },
              { left: 82.87, top: 47.08, delay: 4.32, duration: 9.50 },
              { left: 15.23, top: 72.45, delay: 2.87, duration: 10.15 },
              { left: 68.91, top: 23.76, delay: 6.42, duration: 8.93 },
              { left: 92.34, top: 81.29, delay: 1.55, duration: 11.67 },
              { left: 37.65, top: 94.12, delay: 7.23, duration: 9.84 },
              { left: 73.28, top: 8.47, delay: 3.91, duration: 10.38 },
              { left: 12.89, top: 56.73, delay: 5.67, duration: 8.21 },
              { left: 89.45, top: 34.91, delay: 2.14, duration: 11.45 },
              { left: 54.76, top: 78.23, delay: 8.32, duration: 9.67 },
              { left: 26.83, top: 15.68, delay: 1.89, duration: 10.92 },
              { left: 71.92, top: 67.45, delay: 6.78, duration: 8.56 },
              { left: 8.34, top: 42.87, delay: 4.56, duration: 11.23 },
              { left: 95.67, top: 29.14, delay: 3.45, duration: 9.78 },
              { left: 43.21, top: 85.92, delay: 7.89, duration: 8.34 },
              { left: 78.45, top: 12.56, delay: 2.67, duration: 10.89 },
              { left: 34.78, top: 91.23, delay: 5.12, duration: 9.45 }
            ];
            const pos = positions[i] || positions[0];
            return (
              <div
                key={i}
                className="absolute w-1 h-1 bg-[#0c9fae]/60 rounded-full animate-particle"
                style={{
                  left: `${pos.left}%`,
                  top: `${pos.top}%`,
                  animationDelay: `${pos.delay}s`,
                  animationDuration: `${pos.duration}s`,
                }}
              ></div>
            );
          })}
        </div>
      </div>

      {/* Login Card */}
      <Card className="relative z-10 w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-lg">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Image
                src="/images/clockflow-logo.png"
                alt="ClockFlow - Sistema de Controle de Jornada"
                width={120}
                height={120}
                className="rounded-2xl shadow-lg"
                priority
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#0c9fae]/20 to-transparent" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#0c9fae] to-blue-600 bg-clip-text text-transparent">
            ClockFlow
          </CardTitle>
          <CardDescription className="text-base text-slate-600">
            Sistema Inteligente de Controle de Jornada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-12 border-slate-200 focus:border-[#0c9fae] focus:ring-[#0c9fae]/20"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  Senha
                </Label>
                <Link href="/recuperar-senha">
                  <Button variant="link" className="px-0 font-normal text-sm text-[#0c9fae] hover:text-[#0c9fae]/80">
                    Esqueceu a senha?
                  </Button>
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-12 border-slate-200 focus:border-[#0c9fae] focus:ring-[#0c9fae]/20"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#0c9fae] to-blue-600 hover:from-[#0c9fae]/90 hover:to-blue-600/90 text-white font-semibold shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar no Sistema"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-slate-500 pb-8">
          <p className="w-full">ClockFlow &copy; {new Date().getFullYear()} - Gestão Inteligente de Tempo</p>
        </CardFooter>
      </Card>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(90deg); }
        }
        
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(270deg); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-very-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes clock-hand {
          0% { transform: translateX(-50%) translateY(-100%) rotate(0deg); }
          100% { transform: translateX(-50%) translateY(-100%) rotate(360deg); }
        }
        
        @keyframes flow {
          0% { stroke-dasharray: 0 1000; }
          50% { stroke-dasharray: 1000 1000; }
          100% { stroke-dasharray: 1000 0; }
        }
        
        @keyframes flow-reverse {
          0% { stroke-dasharray: 1000 0; }
          50% { stroke-dasharray: 1000 1000; }
          100% { stroke-dasharray: 0 1000; }
        }
        
        @keyframes particle {
          0% { 
            transform: translateY(100vh) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% { 
            transform: translateY(-100vh) scale(1);
            opacity: 0;
          }
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        
        .animate-float-slower {
          animation: float-slower 12s ease-in-out infinite;
        }
        
        .animate-float-fast {
          animation: float-fast 6s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-spin-very-slow {
          animation: spin-very-slow 30s linear infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        
        .animate-clock-hand {
          animation: clock-hand 10s linear infinite;
        }
        
        .animate-flow {
          animation: flow 8s ease-in-out infinite;
        }
        
        .animate-flow-reverse {
          animation: flow-reverse 10s ease-in-out infinite;
        }
        
        .animate-particle {
          animation: particle linear infinite;
        }
      `}</style>
    </div>
  )
}
