import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useEffect } from 'react'
import authService from '../../services/auth.service'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, setUser, setIsLoading, setIsAuthenticated } = useAuthStore()

  useEffect(() => {
    async function loadUser() {
      if (authService.isAuthenticated()) {
        try {
          const user = await authService.getCurrentUser()
          setUser(user)
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Failed to load user:', error)
          setIsAuthenticated(false)
        }
      }
      setIsLoading(false)
    }

    loadUser()
  }, [setUser, setIsAuthenticated, setIsLoading])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
