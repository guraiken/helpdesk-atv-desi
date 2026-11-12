import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LifeBuoy, Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

export function Navbar() {
  const { user, isTechnician, logout } = useAuth()
  const { showSuccess } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      showSuccess('Sessão encerrada com sucesso.')
      navigate('/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const navLinks = [
    {
      to: '/dashboard',
      label: 'Início',
      show: true,
    },
    {
      to: '/chamados',
      label: 'Chamados',
      show: true,
    },
    {
      to: '/atendimento',
      label: 'Atendimento',
      show: isTechnician,
    },
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 font-bold text-gray-900"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-gray-900">
                Helpdesk
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks
                .filter((item) => item.show)
                .map((item) => {
                  const isActive = location.pathname === item.to
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="font-semibold text-gray-900">{user.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-medium ${
                    isTechnician
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {user.role}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
              title="Encerrar sessão"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-2">
          {user && (
            <div className="pb-2 border-b border-gray-100 flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-900">{user.name}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                {user.role}
              </span>
            </div>
          )}

          <div className="space-y-1">
            {navLinks
              .filter((item) => item.show)
              .map((item) => {
                const isActive = location.pathname === item.to
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-1.5 rounded text-sm font-medium ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false)
                handleLogout()
              }}
              className="w-full text-left px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded cursor-pointer"
            >
              Sair
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
