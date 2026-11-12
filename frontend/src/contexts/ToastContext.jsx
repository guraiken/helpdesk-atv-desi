import { useState, useCallback } from 'react'
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { ToastContext } from './toastContextDef'

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    ({ type = 'info', title, message, duration = 4500 }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9)
      const newToast = { id, type, title, message }

      setToasts((prev) => [...prev, newToast])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  const showSuccess = useCallback(
    (message, title = 'Sucesso') => addToast({ type: 'success', title, message }),
    [addToast]
  )

  const showError = useCallback(
    (message, title = 'Erro') => addToast({ type: 'error', title, message }),
    [addToast]
  )

  const showWarning = useCallback(
    (message, title = 'Atenção') => addToast({ type: 'warning', title, message }),
    [addToast]
  )

  const showInfo = useCallback(
    (message, title = 'Informação') => addToast({ type: 'info', title, message }),
    [addToast]
  )

  return (
    <ToastContext.Provider
      value={{ addToast, removeToast, showSuccess, showError, showWarning, showInfo }}
    >
      {children}
      <div
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          let bg = 'bg-slate-900 text-white'
          let border = 'border-slate-800'
          let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />

          if (toast.type === 'success') {
            bg = 'bg-emerald-50 text-emerald-950 border-emerald-200'
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          } else if (toast.type === 'error') {
            bg = 'bg-rose-50 text-rose-950 border-rose-200'
            icon = <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          } else if (toast.type === 'warning') {
            bg = 'bg-amber-50 text-amber-950 border-amber-200'
            icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${bg} ${border}`}
              role="alert"
            >
              {icon}
              <div className="flex-1 text-sm">
                {toast.title && <div className="font-semibold">{toast.title}</div>}
                <div className="text-xs leading-relaxed mt-0.5 opacity-90">{toast.message}</div>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 transition-opacity p-0.5 rounded cursor-pointer"
                aria-label="Fechar alerta"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
