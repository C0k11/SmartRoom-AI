'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  loginWithOAuth: (provider: 'google' | 'github') => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = () => {
      const savedUser = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      if (savedUser && token) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (e) {
          localStorage.removeItem('user')
          localStorage.removeItem('token')
        }
      }
      setIsLoading(false)
    }
    
    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // In production, call real API
      // const response = await userApi.login(email, password)
      
      // For demo, simulate successful login
      const mockUser: User = {
        id: 'user-' + Date.now(),
        email,
        name: email.split('@')[0],
      }
      
      setUser(mockUser)
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('token', 'demo-token-' + Date.now())
      
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // In production, call real API
      // const response = await userApi.register(email, password, name)
      
      // For demo, simulate successful registration
      const mockUser: User = {
        id: 'user-' + Date.now(),
        email,
        name,
      }
      
      setUser(mockUser)
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('token', 'demo-token-' + Date.now())
      
      return true
    } catch (error) {
      console.error('Registration failed:', error)
      return false
    }
  }

  const loginWithOAuth = async (provider: 'google' | 'github'): Promise<boolean> => {
    try {
      // In production, redirect to OAuth provider
      // For demo, simulate successful OAuth login
      const mockUser: User = {
        id: 'oauth-user-' + Date.now(),
        email: `user@${provider}.com`,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      }
      
      setUser(mockUser)
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('token', 'oauth-token-' + Date.now())
      
      return true
    } catch (error) {
      console.error('OAuth login failed:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      loginWithOAuth,
    }}>
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

// HOC for protected routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth()
    
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      )
    }
    
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
      }
      return null
    }
    
    return <WrappedComponent {...props} />
  }
}

