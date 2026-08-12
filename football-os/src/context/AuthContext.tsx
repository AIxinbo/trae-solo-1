import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { authApi, type LoginVO } from '../api'
import { getToken, removeToken } from '../api/client'

interface AuthUser {
  userId: string
  username: string
  realName: string
  role: string
  avatar: string
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  setUser: (user: AuthUser | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  setUser: () => {},
  logout: () => {},
})

const USER_KEY = 'football_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    const cached = localStorage.getItem(USER_KEY)
    if (cached) {
      try {
        setUser(JSON.parse(cached))
      } catch {
        localStorage.removeItem(USER_KEY)
      }
    }
    if (token) {
      authApi
        .me()
        .then((u) => {
          const authUser: AuthUser = {
            userId: u.id,
            username: u.username,
            realName: u.realName,
            role: u.role,
            avatar: u.avatar,
          }
          setUser(authUser)
          localStorage.setItem(USER_KEY, JSON.stringify(authUser))
        })
        .catch(() => {
          removeToken()
          localStorage.removeItem(USER_KEY)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    authApi.logout().catch(() => {})
    removeToken()
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function cacheUserAfterLogin(vo: LoginVO) {
  const authUser: AuthUser = {
    userId: vo.userId,
    username: vo.username,
    realName: vo.realName,
    role: vo.role,
    avatar: vo.avatar,
  }
  localStorage.setItem(USER_KEY, JSON.stringify(authUser))
}
