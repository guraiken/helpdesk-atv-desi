import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  RotateCcw,
  X,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { supportApi } from '../services/api'
import { StatusBadge, PriorityBadge } from '../components/StatusBadge'
import {
  formatDateTime,
  toInputDateTimeLocal,
  validateAttendedAt,
} from '../utils/dateUtils'
import { sortTicketsOldestFirst } from '../utils/sorting'

export default function SupportPage() {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedTicket, setSelectedTicket] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const [actionType, setActionType] = useState(null)
  const [attendedAtInput, setAttendedAtInput] = useState('')
  const [actionText, setActionText] = useState('')
  const [actionErrors, setActionErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const loadTickets = useCallback(async () => {
    try {
      const data = await supportApi.list()
      const sorted = sortTicketsOldestFirst(data || [])
      setTickets(sorted)
    } catch (err) {
      showError(err.message || 'Erro ao carregar fila de atendimento.')
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    let isMounted = true

    async function initialLoad() {
      try {
        const data = await supportApi.list()
        if (isMounted) {
          const sorted = sortTicketsOldestFirst(data || [])
          setTickets(sorted)
        }
      } catch (err) {
        if (isMounted) {
          showError(err.message || 'Erro ao carregar fila de atendimento.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initialLoad()

    return () => {
      isMounted = false
    }
  }, [showError])

  const handleSelectTicket = async (id) => {
    setLoadingDetail(true)
    try {
      const detail = await supportApi.getById(id)
      setSelectedTicket(detail)
    } catch (err) {
      showError(err.message || 'Erro ao carregar detalhes do chamado.')
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleOpenAction = (type) => {
    if (!selectedTicket) return

    if (selectedTicket.status === 'Finalizado') {
      showError('Este chamado já foi finalizado e não pode ser alterado.')
      return
    }

    if (type === 'take') {
      if (selectedTicket.technician || selectedTicket.status !== 'Aberto') {
        showError('Este chamado já possui um técnico responsável.')
        return
      }
    } else if (type === 'note' || type === 'close') {
      if (!selectedTicket.technician || selectedTicket.technician.id !== user?.id) {
        showError('Somente o técnico responsável pode registrar atendimentos neste chamado.')
        return
      }
    }

    setActionType(type)
    setAttendedAtInput(toInputDateTimeLocal(new Date()))
    setActionText('')
    setActionErrors({})
  }

  const validateAction = () => {
    const errors = {}

    if (!selectedTicket) return false

    if (selectedTicket.status === 'Finalizado') {
      showError('Este chamado já foi finalizado e não pode ser alterado.')
      return false
    }

    const dateValidation = validateAttendedAt(attendedAtInput, selectedTicket.openedAt)
    if (!dateValidation.valid) {
      errors.attendedAt = dateValidation.message
      showError(dateValidation.message)
    }

    if (actionType === 'note') {
      if (!actionText.trim()) {
        errors.text = 'A observação do atendimento é obrigatória'
      } else if (actionText.trim().length > 5000) {
        errors.text = 'A observação deve ter no máximo 5000 caracteres'
      }
    } else if (actionType === 'close') {
      if (!actionText.trim()) {
        errors.text = 'Informe a descrição da solução para finalizar o chamado'
        showError('Informe a descrição da solução para finalizar o chamado')
      } else if (actionText.trim().length > 5000) {
        errors.text = 'A descrição da solução deve ter no máximo 5000 caracteres'
      }
    }

    if (actionType === 'take') {
      if (selectedTicket.technician) {
        showError('Este chamado já possui um técnico responsável.')
        return false
      }
    } else {
      if (selectedTicket.technician?.id !== user?.id) {
        showError('Somente o técnico responsável pode atualizar este atendimento.')
        return false
      }
    }

    setActionErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleExecuteAction = async (e) => {
    e.preventDefault()

    if (!validateAction()) {
      return
    }

    setSubmitting(true)
    const attendedAtIso = new Date(attendedAtInput).toISOString()

    try {
      let updated
      if (actionType === 'take') {
        updated = await supportApi.take(selectedTicket.id, {
          attendedAt: attendedAtIso,
          note: actionText.trim() || undefined,
        })
        showSuccess(`Chamado #${selectedTicket.id} assumido com sucesso.`)
      } else if (actionType === 'note') {
        updated = await supportApi.addNote(selectedTicket.id, {
          attendedAt: attendedAtIso,
          note: actionText.trim(),
        })
        showSuccess('Observação registrada.')
      } else if (actionType === 'close') {
        updated = await supportApi.close(selectedTicket.id, {
          attendedAt: attendedAtIso,
          solution: actionText.trim(),
        })
        showSuccess(`Chamado #${selectedTicket.id} finalizado com sucesso.`)
      }

      setSelectedTicket(updated)
      setActionType(null)
      loadTickets()
    } catch (err) {
      showError(err.message || 'Erro ao registrar atendimento.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRefreshQueue = () => {
    setLoading(true)
    loadTickets()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao início</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">
            Atendimento e Gestão de Chamados
          </h1>
          <p className="text-xs text-gray-500">
            Fila ordenada por data de abertura (do mais antigo ao mais recente via Merge Sort).
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefreshQueue}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar Fila</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-800 uppercase">
              Fila de Chamados ({tickets.length})
            </h2>
            <span className="text-[11px] font-medium text-gray-500">
              Mais antigos primeiro
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-gray-500">Carregando fila...</div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              Nenhum chamado pendente na fila.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {tickets.map((ticket) => {
                const isSelected = selectedTicket?.id === ticket.id
                const isMyAssigned = ticket.technician?.id === user?.id

                return (
                  <div
                    key={ticket.id}
                    onClick={() => handleSelectTicket(ticket.id)}
                    className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                      isSelected ? 'bg-blue-50/60 border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-gray-900">
                          #{ticket.id}
                        </span>
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {formatDateTime(ticket.openedAt)}
                      </span>
                    </div>

                    <h3 className="text-xs font-semibold text-gray-900 truncate">
                      {ticket.subject}
                    </h3>
                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">
                      {ticket.description}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500 pt-1.5 border-t border-gray-100">
                      <span>Solicitante: <strong className="text-gray-700">{ticket.requester?.name}</strong></span>
                      <span>
                        Técnico:{' '}
                        {ticket.technician ? (
                          <strong className={isMyAssigned ? 'text-blue-700' : 'text-gray-700'}>
                            {ticket.technician.name} {isMyAssigned && '(Você)'}
                          </strong>
                        ) : (
                          <span className="text-amber-600 font-medium">Disponível</span>
                        )}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white rounded-lg border border-gray-200 p-4 sticky top-20 text-gray-900">
          {loadingDetail ? (
            <div className="py-12 text-center text-xs text-gray-500">Carregando detalhes...</div>
          ) : !selectedTicket ? (
            <div className="py-12 text-center text-xs text-gray-500">
              Selecione um chamado na fila ao lado para ver os detalhes e opções de atendimento.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-gray-900">
                    Chamado #{selectedTicket.id}
                  </span>
                  <StatusBadge status={selectedTicket.status} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mt-1">
                  {selectedTicket.subject}
                </h3>
                <div className="grid grid-cols-2 gap-1.5 mt-2 text-[11px] text-gray-600">
                  <div>Categoria: <strong>{selectedTicket.category?.name || '-'}</strong></div>
                  <div>Prioridade: <PriorityBadge priority={selectedTicket.priority} /></div>
                  <div>Abertura: {formatDateTime(selectedTicket.openedAt)}</div>
                  <div>Solicitante: <strong>{selectedTicket.requester?.name || '-'}</strong></div>
                  <div className="col-span-2">
                    Técnico:{' '}
                    {selectedTicket.technician ? (
                      <strong>
                        {selectedTicket.technician.name}
                        {selectedTicket.technician.id === user?.id && ' (Você)'}
                      </strong>
                    ) : (
                      <span className="text-amber-600">Sem responsável</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase text-gray-500 mb-1">
                  Descrição
                </h4>
                <div className="p-2.5 bg-gray-50 rounded border border-gray-200 text-xs text-gray-800 whitespace-pre-line">
                  {selectedTicket.description}
                </div>
              </div>

              {selectedTicket.solution && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-green-700 mb-1">
                    Solução Aplicada
                  </h4>
                  <div className="p-2.5 bg-green-50 rounded border border-green-200 text-xs text-green-900 whitespace-pre-line font-medium">
                    {selectedTicket.solution}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-gray-100">
                <h4 className="text-xs font-semibold uppercase text-gray-700 mb-2">
                  Ações de Atendimento
                </h4>

                {selectedTicket.status === 'Finalizado' ? (
                  <div className="p-2 bg-gray-100 rounded text-xs text-gray-600 text-center">
                    Chamado finalizado.
                  </div>
                ) : selectedTicket.status === 'Aberto' && !selectedTicket.technician ? (
                  <button
                    type="button"
                    onClick={() => handleOpenAction('take')}
                    className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors cursor-pointer"
                  >
                    Assumir Chamado
                  </button>
                ) : selectedTicket.technician?.id === user?.id ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenAction('note')}
                      className="py-1.5 px-2 bg-white hover:bg-gray-50 border border-gray-300 text-xs font-medium rounded text-gray-700 transition-colors cursor-pointer"
                    >
                      Observação
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenAction('close')}
                      className="py-1.5 px-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors cursor-pointer"
                    >
                      Finalizar Chamado
                    </button>
                  </div>
                ) : (
                  <div className="p-2 bg-amber-50 rounded border border-amber-200 text-xs text-amber-800">
                    Em atendimento por {selectedTicket.technician?.name}.
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100">
                <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">
                  Histórico ({selectedTicket.history?.length || 0})
                </h4>

                {!selectedTicket.history || selectedTicket.history.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Nenhum atendimento registrado.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {selectedTicket.history.map((h, i) => (
                      <div key={h.id || i} className="p-2 bg-gray-50 rounded border border-gray-200 text-xs space-y-0.5">
                        <div className="flex justify-between text-[11px] text-gray-500">
                          <span className="font-semibold text-gray-700">{h.technician?.name || 'Técnico'}</span>
                          <span>{formatDateTime(h.attendedAt)}</span>
                        </div>
                        <p className="text-gray-800 whitespace-pre-line">{h.note}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {actionType && selectedTicket && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-md w-full p-5 relative text-gray-900">
            <button
              type="button"
              onClick={() => setActionType(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-gray-900 mb-3">
              {actionType === 'take' && `Assumir Chamado #${selectedTicket.id}`}
              {actionType === 'note' && `Registrar Observação #${selectedTicket.id}`}
              {actionType === 'close' && `Finalizar Chamado #${selectedTicket.id}`}
            </h3>

            <form onSubmit={handleExecuteAction} className="space-y-3" noValidate>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Data e Hora do Atendimento <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={attendedAtInput}
                  onChange={(e) => {
                    setAttendedAtInput(e.target.value)
                    setActionErrors({ ...actionErrors, attendedAt: undefined })
                  }}
                  className={`w-full px-2.5 py-1.5 bg-white text-gray-900 rounded border text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    actionErrors.attendedAt ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
                  }`}
                />
                {actionErrors.attendedAt && (
                  <p className="mt-1 text-[11px] text-red-600 font-medium">
                    {actionErrors.attendedAt}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {actionType === 'close' ? 'Solução Aplicada' : 'Observação'}{' '}
                  {actionType === 'close' || actionType === 'note' ? (
                    <span className="text-red-500">*</span>
                  ) : (
                    <span className="text-gray-400 text-xs font-normal">(opcional)</span>
                  )}
                </label>
                <textarea
                  rows={4}
                  value={actionText}
                  onChange={(e) => {
                    setActionText(e.target.value)
                    setActionErrors({ ...actionErrors, text: undefined })
                  }}
                  placeholder={
                    actionType === 'close'
                      ? 'Descreva a solução do problema...'
                      : actionType === 'take'
                      ? 'Observação inicial (opcional)...'
                      : 'Descreva a observação do atendimento...'
                  }
                  className={`w-full px-2.5 py-1.5 bg-white text-gray-900 rounded border text-xs placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    actionErrors.text ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
                  }`}
                />
                {actionErrors.text && (
                  <p className="mt-1 text-[11px] text-red-600 font-medium">{actionErrors.text}</p>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-3.5 py-1.5 text-white text-xs font-medium rounded transition-colors cursor-pointer ${
                    actionType === 'close'
                      ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                      : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
                  }`}
                >
                  {submitting ? 'Salvando...' : actionType === 'close' ? 'Finalizar' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
