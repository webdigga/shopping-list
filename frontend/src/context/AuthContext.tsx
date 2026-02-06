import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import * as api from '@/services/api'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  needsSetup: boolean
  login: (pin: string) => Promise<{ success: boolean; error?: string }>
  setupPin: (pin: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)

  // Check auth status on mount
  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      // Check if there's an existing token
      const existingToken = api.getAuthToken()

      if (existingToken) {
        // Try to use the existing token by making a test request
        try {
          await api.fetchItems()
          // Token is valid
          setIsAuthenticated(true)
          setIsLoading(false)
          return
        } catch {
          // Token invalid, clear it
          api.setAuthToken(null)
        }
      }

      // No valid token, check if PIN is configured
      const { pinConfigured } = await api.checkAuthStatus()
      setNeedsSetup(!pinConfigured)
    } catch (error) {
      // If we can't reach server, assume setup needed
      console.error('Failed to check auth status:', error)
      setNeedsSetup(true)
    } finally {
      setIsLoading(false)
    }
  }

  const login = useCallback(async (pin: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await api.verifyPin(pin)

      if (result.valid && result.token) {
        api.setAuthToken(result.token)
        setIsAuthenticated(true)
        return { success: true }
      }

      if (result.requireSetup) {
        setNeedsSetup(true)
        return { success: false, error: 'PIN not set up yet' }
      }

      return { success: false, error: 'Invalid PIN' }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }, [])

  const setupPin = useCallback(async (pin: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await api.setupPin(pin)

      if (result.success && result.token) {
        api.setAuthToken(result.token)
        setIsAuthenticated(true)
        setNeedsSetup(false)
        return { success: true }
      }

      return { success: false, error: 'Failed to set up PIN' }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }, [])

  const logout = useCallback(() => {
    api.setAuthToken(null)
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        needsSetup,
        login,
        setupPin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
