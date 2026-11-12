import { useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'
import { AuthContext } from './authContextDef'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('helpdesk_token') || null)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('helpdesk_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function verifySession() {
      if (!token) {
        if (isMounted) setLoading(false)
        return
      }

      try {
        const currentUser = await authApi.me()
        if (isMounted) {
          setUser(currentUser)
          localStorage.setItem('helpdesk_user', JSON.stringify(currentUser))
        }
      } catch (err) {
        if (err.status === 401) {
          localStorage.removeItem('helpdesk_token')
          localStorage.removeItem('helpdesk_user')
          if (isMounted) {
            setToken(null)
            setUser(null)
          }
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    verifySession()

    return () => {
      isMounted = false
    }
  }, [token])

  const login = useCallback(async (email, password) => {
    const result = await authApi.login({ email, password })
    localStorage.setItem('helpdesk_token', result.token)
    localStorage.setItem('helpdesk_user', JSON.stringify(result.user))
    setToken(result.token)
    setUser(result.user)
    return result
  }, [])

  const register = useCallback(async (name, email, password) => {
    return await authApi.register({ name, email, password })
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => null)
    localStorage.removeItem('helpdesk_token')
    localStorage.removeItem('helpdesk_user')
    setToken(null)
    setUser(null)
  }, [])

  const isTechnician = user?.role === 'Técnico'
  const isRequester = user?.role === 'Solicitante'
  const isAuthenticated = Boolean(token && user)

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated,
        isTechnician,
        isRequester,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
