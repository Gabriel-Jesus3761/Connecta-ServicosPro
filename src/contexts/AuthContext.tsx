import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export type UserRole = 'owner' | 'client'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('barberpro_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true)

    // Simular chamada de API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Usuários de demonstração
    const demoUsers = {
      owner: {
        id: '1',
        name: 'Administrador',
        email: 'admin@barberpro.com',
        role: 'owner' as UserRole,
        avatar: undefined,
      },
      client: {
        id: '2',
        name: 'João Silva',
        email: 'joao@email.com',
        role: 'client' as UserRole,
        avatar: undefined,
      },
    }

    // Validação simples de demonstração
    if (email === 'admin@barberpro.com' && password === 'admin123' && role === 'owner') {
      setUser(demoUsers.owner)
      localStorage.setItem('barberpro_user', JSON.stringify(demoUsers.owner))
      navigate('/')
    } else if (email === 'cliente@email.com' && password === 'cliente123' && role === 'client') {
      setUser(demoUsers.client)
      localStorage.setItem('barberpro_user', JSON.stringify(demoUsers.client))
      navigate('/cliente')
    } else {
      throw new Error('Credenciais inválidas')
    }

    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('barberpro_user')
    navigate('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
