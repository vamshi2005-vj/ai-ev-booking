import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('eventsphere_user')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('eventsphere_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('eventsphere_user')
    }
  }, [user])

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user && localStorage.getItem('eventsphere_token')),
    async login(payload) {
      const { data } = await api.post('/auth/login', payload)
      localStorage.setItem('eventsphere_token', data.data.token)
      setUser(data.data)
      return data.data
    },
    async register(payload) {
      const { data } = await api.post('/auth/register', payload)
      return data.data
    },
    logout() {
      localStorage.removeItem('eventsphere_token')
      localStorage.removeItem('eventsphere_user')
      setUser(null)
    },
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
