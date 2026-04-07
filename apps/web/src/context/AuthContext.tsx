import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '@/config/env'

// ── Types ─────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'afiliado' | 'super_admin'

export interface AuthUser {
  id: number
  email: string
  rol: UserRole              // rol primario (más alto en jerarquía)
  roles: UserRole[]          // todos los roles del usuario
  id_agremiado: number | null
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  /** Helpers de conveniencia */
  hasRole: (role: UserRole) => boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  isAfiliado: boolean
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_KEY = 'ciebo_token'

/** Normalizar el usuario recibido del servidor, garantizando que siempre haya `roles[]` */
function normalizeUser(rawUser: any): AuthUser {
  const roles: UserRole[] = Array.isArray(rawUser.roles)
    ? rawUser.roles
    : [rawUser.rol ?? 'afiliado']
  const rol: UserRole = roles.includes('super_admin')
    ? 'super_admin'
    : roles.includes('admin')
      ? 'admin'
      : 'afiliado'
  return { ...rawUser, rol, roles }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]         = useState<AuthUser | null>(null)
  const [token, setToken]       = useState<string | null>(null)
  const [isLoading, setLoading] = useState(true)
  const navigate                = useNavigate()

  // Restore session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (!storedToken) { setLoading(false); return }

    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.user) {
          setToken(storedToken)
          setUser(normalizeUser(data.user))
        } else {
          localStorage.removeItem(TOKEN_KEY)
        }
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false))
  }, [])

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Credenciales incorrectas')
    }

    const newUser = normalizeUser(data.user)

    localStorage.setItem(TOKEN_KEY, data.token)
    setToken(data.token)
    setUser(newUser)

    // Todos van al panel unificado
    navigate('/panel')
  }, [navigate])

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    navigate('/')
  }, [navigate])

  // Helpers de roles
  const hasRole = useCallback((role: UserRole) => {
    return user?.roles?.includes(role) ?? false
  }, [user])

  const isAdminVal      = (user?.roles?.includes('admin') || user?.roles?.includes('super_admin')) ?? false
  const isSuperAdminVal = user?.roles?.includes('super_admin') ?? false
  const isAfiliadoVal   = user?.roles?.includes('afiliado') ?? false

  return (
    <AuthContext.Provider value={{
      user, token, isLoading, login, logout,
      hasRole,
      isAdmin: isAdminVal,
      isSuperAdmin: isSuperAdminVal,
      isAfiliado: isAfiliadoVal,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
