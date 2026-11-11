import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FormLogin from '../components/FormLogin'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [loading, isAuthenticated, navigate])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Helpdesk</h1>
          <p className="text-sm text-gray-600 mt-1">Sistema de Chamados</p>
        </div>
        <FormLogin />
      </div>
    </div>
  )
}
