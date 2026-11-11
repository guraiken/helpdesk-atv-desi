import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

export default function FormLogin() {
  const { login, register } = useAuth()
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const clearErrors = () => {
    setErrorMessage('')
    setFieldErrors({})
  }

  const validateForm = () => {
    const errors = {}

    if (mode === 'register') {
      if (!name.trim()) {
        errors.name = 'O nome é obrigatório'
      } else if (name.trim().length > 100) {
        errors.name = 'O nome deve ter no máximo 100 caracteres'
      }
    }

    if (!email.trim()) {
      errors.email = 'O e-mail é obrigatório'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Informe um e-mail válido'
      }
    }

    if (!password) {
      errors.password = 'A senha é obrigatória'
    } else if (mode === 'register' && password.length < 6) {
      errors.password = 'A senha deve ter no mínimo 6 caracteres'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearErrors()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      if (mode === 'login') {
        const result = await login(email.trim(), password)
        showSuccess(`Bem-vindo, ${result.user.name}!`)
        navigate('/dashboard')
      } else {
        await register(name.trim(), email.trim(), password)
        showSuccess('Cadastro realizado! Faça login para continuar.')
        setMode('login')
        setPassword('')
      }
    } catch (err) {
      if (mode === 'login') {
        const msg = err.status === 401 ? 'E-mail ou senha inválidos' : (err.message || 'E-mail ou senha inválidos')
        setErrorMessage(msg)
        showError(msg)
      } else {
        const msg = err.message || 'Erro ao realizar cadastro'
        setErrorMessage(msg)
        showError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const fillCredentials = (type) => {
    clearErrors()
    if (type === 'requester') {
      setEmail('ana.souza@helpdesk.com')
      setPassword('123456')
    } else if (type === 'technician') {
      setEmail('diego.ramos@helpdesk.com')
      setPassword('123456')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 text-gray-900">
      <div className="flex border-b border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => {
            setMode('login')
            clearErrors()
          }}
          className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-colors cursor-pointer ${
            mode === 'login'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register')
            clearErrors()
          }}
          className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-colors cursor-pointer ${
            mode === 'register'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Cadastrar Solicitante
        </button>
      </div>

      {errorMessage && (
        <div
          className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {mode === 'register' && (
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                clearErrors()
              }}
              placeholder="Digite seu nome"
              className={`w-full px-3 py-2 bg-white text-gray-900 rounded-lg border text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.name ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
              }`}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.name}</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
            E-mail <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              clearErrors()
            }}
            placeholder="seu.email@helpdesk.com"
            className={`w-full px-3 py-2 bg-white text-gray-900 rounded-lg border text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              fieldErrors.email ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
            }`}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
            Senha <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              clearErrors()
            }}
            placeholder="Digite sua senha"
            className={`w-full px-3 py-2 bg-white text-gray-900 rounded-lg border text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              fieldErrors.password ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
            }`}
          />
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer"
        >
          {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Cadastrar'}
        </button>
      </form>

      {mode === 'login' && (
        <div className="mt-6 pt-5 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-2.5">
            Preenchimento rápido de teste:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('requester')}
              className="py-1.5 px-2 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-left transition-colors cursor-pointer text-gray-700"
            >
              <div className="font-semibold text-blue-700">Solicitante</div>
              <div className="text-[11px] text-gray-500 truncate">ana.souza</div>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('technician')}
              className="py-1.5 px-2 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-left transition-colors cursor-pointer text-gray-700"
            >
              <div className="font-semibold text-emerald-700">Técnico</div>
              <div className="text-[11px] text-gray-500 truncate">diego.ramos</div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
