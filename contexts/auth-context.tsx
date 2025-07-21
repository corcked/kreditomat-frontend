"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { api } from "@/lib/api"
import { getToken, setToken, removeToken } from "@/lib/auth"

interface User {
  id: string
  phone_number: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  last_login?: string
  referral_code?: string
  referred_by_id?: string
  has_personal_data?: boolean
  has_active_application?: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  
  // Auth methods
  login: (phoneNumber: string) => Promise<void>
  verify: (phoneNumber: string, code: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  
  // User methods
  updateUser: (userData: Partial<User>) => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/verify",
  "/terms",
  "/privacy",
  "/about",
  "/contact",
  "/demo"
]

// Routes that require authentication
const protectedRoutes = [
  "/application",
  "/profile",
  "/referrals"
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const isAuthenticated = !!user && !!getToken()
  
  // Check if current route requires authentication
  const requiresAuth = useCallback((path: string) => {
    return protectedRoutes.some(route => path.startsWith(route))
  }, [])
  
  // Check authentication status
  const checkAuth = useCallback(async () => {
    const token = getToken()
    
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    
    try {
      const userData = await api.auth.getMe()
      setUser(userData)
      setError(null)
    } catch (err: any) {
      console.error("Auth check failed:", err)
      removeToken()
      setUser(null)
      
      // Only set error if we're on a protected route
      if (requiresAuth(pathname)) {
        setError("Сессия истекла. Пожалуйста, войдите снова.")
      }
    } finally {
      setLoading(false)
    }
  }, [pathname, requiresAuth])
  
  // Initial auth check
  useEffect(() => {
    checkAuth()
  }, [checkAuth])
  
  // Route protection
  useEffect(() => {
    if (!loading && requiresAuth(pathname) && !isAuthenticated) {
      // Store intended destination
      sessionStorage.setItem("redirectAfterLogin", pathname)
      router.push("/auth/login")
    }
  }, [loading, pathname, isAuthenticated, requiresAuth, router])
  
  // Login method
  const login = async (phoneNumber: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await api.auth.request({ phone_number: phoneNumber })
      // Success - verification code sent
    } catch (err: any) {
      setError(err.response?.data?.detail || "Ошибка при отправке кода")
      throw err
    } finally {
      setLoading(false)
    }
  }
  
  // Verify method
  const verify = async (phoneNumber: string, code: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.auth.verify({ phone_number: phoneNumber, code })
      
      if (response.access_token) {
        setToken(response.access_token)
        
        // Get user data
        const userData = await api.auth.getMe()
        setUser(userData)
        
        // Check for redirect
        const redirectPath = sessionStorage.getItem("redirectAfterLogin")
        sessionStorage.removeItem("redirectAfterLogin")
        
        // Redirect based on user state
        if (redirectPath) {
          router.push(redirectPath)
        } else if (!userData.has_personal_data) {
          router.push("/application/new")
        } else if (userData.has_active_application) {
          router.push("/application/offers")
        } else {
          router.push("/profile")
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Неверный код")
      throw err
    } finally {
      setLoading(false)
    }
  }
  
  // Logout method
  const logout = async () => {
    setLoading(true)
    
    try {
      await api.auth.logout()
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      removeToken()
      setUser(null)
      setError(null)
      setLoading(false)
      router.push("/")
    }
  }
  
  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }
  
  // Clear error
  const clearError = () => {
    setError(null)
  }
  
  // Auto-refresh token
  useEffect(() => {
    if (!isAuthenticated) return
    
    // Refresh token every 50 minutes (token expires in 60 minutes)
    const interval = setInterval(async () => {
      try {
        await checkAuth()
      } catch (err) {
        console.error("Token refresh failed:", err)
      }
    }, 50 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [isAuthenticated, checkAuth])
  
  // Handle visibility change (refresh on focus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isAuthenticated) {
        checkAuth()
      }
    }
    
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [isAuthenticated, checkAuth])
  
  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    verify,
    logout,
    checkAuth,
    updateUser,
    clearError
  }
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// HOC for protected pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: { redirectTo?: string }
) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, loading } = useAuth()
    const router = useRouter()
    
    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.push(options?.redirectTo || "/auth/login")
      }
    }, [loading, isAuthenticated, router])
    
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }
    
    if (!isAuthenticated) {
      return null
    }
    
    return <Component {...props} />
  }
}

// Hook for checking specific permissions
export function usePermission(permission: string): boolean {
  const { user } = useAuth()
  
  if (!user) return false
  
  // Add permission logic here based on user roles/attributes
  switch (permission) {
    case "create_application":
      return Boolean(user.is_verified)
    case "view_referrals":
      return !!user.referral_code
    case "access_premium":
      return Boolean(user.is_verified && user.has_personal_data)
    default:
      return false
  }
}