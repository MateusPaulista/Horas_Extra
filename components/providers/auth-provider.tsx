"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { Session, User } from "@supabase/supabase-js"

interface AuthUser extends User {
  name?: string
  role?: string
}

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any | null }>
  signOut: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar sessão atual
    const getSession = async () => {
      setIsLoading(true)

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Erro ao buscar sessão:", error)
        }

        if (session) {
          setSession(session)
          setUser(processUser(session.user))
        } else {
          setUser(null)
          setSession(null)
        }
      } catch (error) {
        console.error("Erro inesperado ao buscar sessão:", error)
        setUser(null)
        setSession(null)
      }

      setIsLoading(false)
    }

    getSession()

    // Configurar listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)

      setSession(session)

      if (session?.user) {
        setUser(processUser(session.user))
      } else {
        setUser(null)
      }

      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const processUser = (user: User): AuthUser => {
    const userData = user as AuthUser

    // Extrair informações do user_metadata ou raw_user_meta_data
    const metadata = user.user_metadata || user.raw_user_meta_data || {}

    userData.name = metadata.name || user.email?.split("@")[0] || "Usuário"
    userData.role = metadata.role || "user"

    return userData
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error("Erro inesperado no login:", error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  const logout = signOut // Alias para compatibilidade

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signOut, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
