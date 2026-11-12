import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

export function ProtectedRoute({ children, technicianOnly = false }) {
  const { isAuthenticated, isTechnician, loading } = useAuth()
  const { showWarning } = useToast()
  const location = useLocation()

  useEffect(() => {
    if (!loading && isAuthenticated && technicianOnly && !isTechnician) {
      showWarning(
        'Acesso permitido somente a usuários com perfil Técnico.',
        'Acesso Restrito'
      )
    }
  }, [loading, isAuthenticated, technicianOnly, isTechnician, showWarning])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-600">Carregando sistema...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (technicianOnly && !isTechnician) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
