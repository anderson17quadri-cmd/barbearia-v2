import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { User, Session } from '@supabase/supabase-js'
import type { UserRole } from '../config/types'
import { supabase } from '../config/supabase'
import {
  signInWithEmail as apiSignIn,
  signUpWithEmail as apiSignUp,
  signInWithOtp as apiSignInOtp,
  signOut as apiSignOut,
  getSession as apiGetSession,
  fetchClientByEmail,
  createClient,
} from '../services/api'

const CLIENT_STORAGE_KEY = '@barbearia:client'

interface AuthContextValue {
  user: User | null
  session: Session | null
  role: UserRole
  loading: boolean
  barbershopId: string | null
  clientId: string | null
  barbershopName: string | null
  login: (email: string, password: string) => Promise<{ error?: string }>
  register: (email: string, password: string, nome: string, telefone: string) => Promise<{ error?: string }>
  loginWithOtp: (email: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  setClientInfo: (id: string, name: string) => void
  refreshBarbershop: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)
  const [barbershopId, setBarbershopId] = useState<string | null>(null)
  const [clientId, setClientId] = useState<string | null>(null)
  const [barbershopName, setBarbershopName] = useState<string | null>(null)

  const determineRole = useCallback(async (userId: string) => {
    try {
      const { data: barbershop, error } = await supabase
        .from('barbearias')
        .select('id, nome')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) throw error

      if (barbershop) {
        setRole('admin')
        setBarbershopId(barbershop.id)
        setBarbershopName(barbershop.nome)
        setClientId(null)
      } else {
        setRole('client')
        setBarbershopId(null)
        setBarbershopName(null)

        const existingClient = await fetchClientByEmail(user?.email || '')
        if (existingClient) {
          setClientId(existingClient.id)
        } else {
          const stored = await AsyncStorage.getItem(CLIENT_STORAGE_KEY)
          if (stored) {
            const parsed = JSON.parse(stored)
            setClientId(parsed.id || null)
          }
        }
      }
    } catch {
      setRole('client')
      setBarbershopId(null)
      setBarbershopName(null)
    }
  }, [user?.email])

  const refreshBarbershop = useCallback(async () => {
    if (!barbershopId) return
    try {
      const { data } = await supabase
        .from('barbearias')
        .select('nome')
        .eq('id', barbershopId)
        .maybeSingle()
      if (data) {
        setBarbershopName(data.nome)
      }
    } catch {
      // silently fail
    }
  }, [barbershopId])

  useEffect(() => {
    const init = async () => {
      try {
        const currentSession = await apiGetSession()
        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
          await determineRole(currentSession.user.id)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    init()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user || null)

      if (newSession?.user) {
        await determineRole(newSession.user.id)
      } else {
        setRole(null)
        setBarbershopId(null)
        setClientId(null)
        setBarbershopName(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [determineRole])

  const login = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      await apiSignIn(email, password)
      return {}
    } catch (err: any) {
      return { error: err.message || 'Erro ao iniciar sessão' }
    }
  }, [])

  const register = useCallback(
    async (email: string, password: string, nome: string, telefone: string): Promise<{ error?: string }> => {
      try {
        const { user: newUser } = await apiSignUp(email, password)
        if (!newUser) throw new Error('Erro ao criar conta')

        await createClient({
          email,
          nome,
          telefone,
          barbearia_id: null,
        })

        await AsyncStorage.setItem(
          CLIENT_STORAGE_KEY,
          JSON.stringify({ nome, telefone, email }),
        )

        return {}
      } catch (err: any) {
        return { error: err.message || 'Erro ao registar' }
      }
    },
    [],
  )

  const loginWithOtp = useCallback(async (email: string): Promise<{ error?: string }> => {
    try {
      await apiSignInOtp(email)
      return {}
    } catch (err: any) {
      return { error: err.message || 'Erro ao enviar código' }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiSignOut()
    } catch {
      // ignore
    }
    setUser(null)
    setSession(null)
    setRole(null)
    setBarbershopId(null)
    setClientId(null)
    setBarbershopName(null)
    await AsyncStorage.removeItem(CLIENT_STORAGE_KEY)
  }, [])

  const setClientInfo = useCallback(async (id: string, name: string) => {
    setClientId(id)
    await AsyncStorage.setItem(
      CLIENT_STORAGE_KEY,
      JSON.stringify({ id, nome: name }),
    )
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        loading,
        barbershopId,
        clientId,
        barbershopName,
        login,
        register,
        loginWithOtp,
        logout,
        setClientInfo,
        refreshBarbershop,
      }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
