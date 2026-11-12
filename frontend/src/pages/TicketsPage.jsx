import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search,
  Plus,
  ArrowLeft,
  Eye,
  Edit2,
  Trash2,
  X,
  RotateCcw,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { ticketsApi, categoriesApi } from '../services/api'
import { StatusBadge, PriorityBadge } from '../components/StatusBadge'
import { formatDateTime } from '../utils/dateUtils'

export default function TicketsPage() {
  const { user, isRequester, isTechnician } = useAuth()
  const { showSuccess, showError, showWarning } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const [tickets, setTickets] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearch, setActiveSearch] = useState('')

  const [formModalOpen, setFormModalOpen] = useState(() => searchParams.get('novo') === '1')
  const [editingTicket, setEditingTicket] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailTicket, setDetailTicket] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [deleteConfirmTicket, setDeleteConfirmTicket] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    categoryId: '',
    priority: 'Média',
  })
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    let isMounted = true
    async function loadCategories() {
      try {
        const cats = await categoriesApi.list()
        if (isMounted) {
          setCategories(cats || [])
          setFormData((prev) => ({
            ...prev,
            categoryId: prev.categoryId || (cats && cats[0]?.id ? String(cats[0].id) : ''),
          }))
        }
      } catch {
        if (isMounted) showError('Erro ao carregar categorias.')
      }
    }
    loadCategories()
    return () => {
      isMounted = false
    }
  }, [showError])

  useEffect(() => {
    let isMounted = true

    async function loadTickets() {
      try {
        const data = await ticketsApi.list(activeSearch)
        if (isMounted) setTickets(data || [])
      } catch (err) {
        if (isMounted) showError(err.message || 'Erro ao carregar a lista de chamados.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadTickets()

    return () => {
      isMounted = false
    }
  }, [activeSearch, showError])

  useEffect(() => {
    const verId = searchParams.get('ver')
    const novoParam = searchParams.get('novo')

    if (!verId && !novoParam) return

    let isMounted = true

    if (verId) {
      async function loadVerTicket() {
        try {
          const details = await ticketsApi.getById(Number(verId))
          if (isMounted) {
            setDetailTicket(details)
            setDetailModalOpen(true)
          }
        } catch (err) {
          if (isMounted) showError(err.message || 'Erro ao carregar detalhes do chamado.')
        } finally {
          if (isMounted) {
            searchParams.delete('ver')
            setSearchParams(searchParams, { replace: true })
          }
        }
      }
      loadVerTicket()
    } else if (novoParam) {
      searchParams.delete('novo')
      setSearchParams(searchParams, { replace: true })
    }

    return () => {
      isMounted = false
    }
  }, [searchParams, setSearchParams, showError])

  const handleOpenDetail = async (id) => {
    setDetailModalOpen(true)
    setLoadingDetail(true)
    try {
      const details = await ticketsApi.getById(id)
      setDetailTicket(details)
    } catch (err) {
      showError(err.message || 'Erro ao carregar detalhes do chamado.')
      setDetailModalOpen(false)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingTicket(null)
    setFormData({
      subject: '',
      description: '',
      categoryId: categories[0]?.id ? String(categories[0].id) : '',
      priority: 'Média',
    })
    setFormErrors({})
    setFormModalOpen(true)
  }

  const refreshList = async () => {
    setLoading(true)
    try {
      const data = await ticketsApi.list(activeSearch)
      setTickets(data || [])
    } catch (err) {
      showError(err.message || 'Erro ao carregar a lista de chamados.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setActiveSearch(searchQuery.trim())
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setLoading(true)
    setActiveSearch('')
  }

  const handleOpenEdit = (ticket) => {
    if (ticket.status !== 'Aberto') {
      showWarning('Somente chamados com status "Aberto" podem ser editados.')
      return
    }

    setEditingTicket(ticket)
    setFormData({
      subject: ticket.subject,
      description: ticket.description,
      categoryId: String(ticket.category.id),
      priority: ticket.priority,
    })
    setFormErrors({})
    setFormModalOpen(true)
  }

  const validateTicketForm = () => {
    const errors = {}

    if (!formData.subject.trim()) {
      errors.subject = 'O assunto é obrigatório'
    } else if (formData.subject.trim().length > 150) {
      errors.subject = 'O assunto deve ter no máximo 150 caracteres'
    }

    if (!formData.description.trim()) {
      errors.description = 'A descrição do problema é obrigatória'
    } else if (formData.description.trim().length > 5000) {
      errors.description = 'A descrição deve ter no máximo 5000 caracteres'
    }

    if (!formData.categoryId) {
      errors.categoryId = 'Selecione uma categoria'
    }

    if (!['Baixa', 'Média', 'Alta'].includes(formData.priority)) {
      errors.priority = 'Selecione uma prioridade válida (Baixa, Média ou Alta)'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveTicket = async (e) => {
    e.preventDefault()

    if (!validateTicketForm()) {
      showError('Preencha os campos obrigatórios corretamente.')
      return
    }

    setSubmitting(true)

    const payload = {
      subject: formData.subject.trim(),
      description: formData.description.trim(),
      categoryId: Number(formData.categoryId),
      priority: formData.priority,
    }

    try {
      if (editingTicket) {
        await ticketsApi.update(editingTicket.id, payload)
        showSuccess(`Chamado #${editingTicket.id} atualizado.`)
      } else {
        const created = await ticketsApi.create(payload)
        showSuccess(`Chamado #${created.id} aberto.`)
      }
      setFormModalOpen(false)
      refreshList()
    } catch (err) {
      showError(err.message || 'Erro ao salvar o chamado.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirmTicket) return

    setSubmitting(true)
    try {
      await ticketsApi.remove(deleteConfirmTicket.id)
      showSuccess(`Chamado #${deleteConfirmTicket.id} excluído.`)
      setDeleteConfirmTicket(null)
      refreshList()
    } catch (err) {
      showError(err.message || 'Erro ao excluir o chamado.')
    } finally {
      setSubmitting(false)
    }
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
            Abertura e Consulta de Chamados
          </h1>
        </div>

        {isRequester && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Chamado</span>
          </button>
        )}
      </div>

      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por número ou assunto..."
              className="w-full px-3 py-1.5 bg-white text-gray-900 text-xs rounded border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium rounded flex items-center gap-1 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Buscar</span>
          </button>

          {activeSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded flex items-center gap-1 cursor-pointer"
              title="Limpar filtro"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpar</span>
            </button>
          )}
        </form>

        {activeSearch && (
          <p className="text-[11px] text-gray-500 mt-1.5">
            Filtrando por: <strong className="text-gray-800">{activeSearch}</strong>
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Carregando chamados...</div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            Nenhum chamado encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 uppercase text-[11px] font-semibold text-gray-500 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-4 py-2.5">Nº</th>
                  <th scope="col" className="px-4 py-2.5">Assunto</th>
                  <th scope="col" className="px-4 py-2.5">Categoria</th>
                  <th scope="col" className="px-4 py-2.5">Prioridade</th>
                  <th scope="col" className="px-4 py-2.5">Data de Abertura</th>
                  <th scope="col" className="px-4 py-2.5">Status</th>
                  {isTechnician && <th scope="col" className="px-4 py-2.5">Solicitante</th>}
                  <th scope="col" className="px-4 py-2.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((ticket) => {
                  const isOwner = user && ticket.requester?.id === user.id
                  const isOpen = ticket.status === 'Aberto'
                  const canEdit = isOwner && isOpen
                  const canDelete = isOwner && isOpen

                  return (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-semibold text-gray-900">
                        #{ticket.id}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(ticket.id)}
                          className="text-left hover:text-blue-600 cursor-pointer"
                        >
                          <div className="truncate font-semibold">{ticket.subject}</div>
                          <div className="text-[11px] text-gray-400 font-normal truncate mt-0.5">
                            {ticket.description}
                          </div>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{ticket.category?.name || '-'}</td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatDateTime(ticket.openedAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={ticket.status} />
                      </td>
                      {isTechnician && (
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {ticket.requester?.name || '-'}
                        </td>
                      )}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(ticket.id)}
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded cursor-pointer"
                            title="Ver detalhes"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(ticket)}
                              className="p-1 text-gray-500 hover:text-amber-600 hover:bg-gray-100 rounded cursor-pointer"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmTicket(ticket)}
                              className="p-1 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-lg w-full p-5 relative my-6 text-gray-900">
            <button
              type="button"
              onClick={() => setFormModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-base font-bold text-gray-900 mb-4">
              {editingTicket ? `Editar Chamado #${editingTicket.id}` : 'Abrir Novo Chamado'}
            </h2>

            <form onSubmit={handleSaveTicket} className="space-y-3" noValidate>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Assunto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => {
                    setFormData({ ...formData, subject: e.target.value })
                    setFormErrors({ ...formErrors, subject: undefined })
                  }}
                  placeholder="Ex: Problema no monitor"
                  maxLength={150}
                  className={`w-full px-3 py-1.5 bg-white text-gray-900 rounded border text-xs placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    formErrors.subject ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
                  }`}
                />
                {formErrors.subject && (
                  <p className="mt-1 text-[11px] text-red-600 font-medium">{formErrors.subject}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Categoria <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => {
                      setFormData({ ...formData, categoryId: e.target.value })
                      setFormErrors({ ...formErrors, categoryId: undefined })
                    }}
                    className={`w-full px-2.5 py-1.5 bg-white text-gray-900 rounded border text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      formErrors.categoryId ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.categoryId && (
                    <p className="mt-1 text-[11px] text-red-600 font-medium">{formErrors.categoryId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Prioridade <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => {
                      setFormData({ ...formData, priority: e.target.value })
                      setFormErrors({ ...formErrors, priority: undefined })
                    }}
                    className={`w-full px-2.5 py-1.5 bg-white text-gray-900 rounded border text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      formErrors.priority ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
                    }`}
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </select>
                  {formErrors.priority && (
                    <p className="mt-1 text-[11px] text-red-600 font-medium">{formErrors.priority}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Descrição detalhada <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value })
                    setFormErrors({ ...formErrors, description: undefined })
                  }}
                  placeholder="Descreva detalhadamente o problema..."
                  className={`w-full px-3 py-1.5 bg-white text-gray-900 rounded border text-xs placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    formErrors.description ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
                  }`}
                />
                {formErrors.description && (
                  <p className="mt-1 text-[11px] text-red-600 font-medium">{formErrors.description}</p>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-medium rounded transition-colors cursor-pointer"
                >
                  {submitting ? 'Salvando...' : editingTicket ? 'Salvar Alterações' : 'Abrir Chamado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmTicket && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-sm w-full p-5 text-center text-gray-900">
            <h2 className="text-sm font-bold text-gray-900">Excluir chamado?</h2>
            <p className="text-xs text-gray-600 mt-2">
              Deseja excluir o chamado #{deleteConfirmTicket.id}? Esta ação não pode ser desfeita.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTicket(null)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={submitting}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs font-medium rounded cursor-pointer"
              >
                {submitting ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}

      {detailModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-xl w-full p-5 relative my-6 text-gray-900 max-h-[85vh] flex flex-col">
            <button
              type="button"
              onClick={() => {
                setDetailModalOpen(false)
                setDetailTicket(null)
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            {loadingDetail || !detailTicket ? (
              <div className="py-12 text-center text-xs text-gray-500">Carregando detalhes...</div>
            ) : (
              <div className="space-y-4 overflow-y-auto pr-1">
                <div className="border-b border-gray-200 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-gray-900">
                      Chamado #{detailTicket.id}
                    </span>
                    <StatusBadge status={detailTicket.status} />
                    <PriorityBadge priority={detailTicket.priority} />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mt-1">
                    {detailTicket.subject}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-1.5">
                    <span>Categoria: <strong>{detailTicket.category?.name || '-'}</strong></span>
                    <span>Abertura: {formatDateTime(detailTicket.openedAt)}</span>
                    <span>Solicitante: {detailTicket.requester?.name || '-'}</span>
                    <span>
                      Técnico: {detailTicket.technician?.name || 'Não atribuído'}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase text-gray-500 mb-1">
                    Descrição do Problema
                  </h4>
                  <div className="p-2.5 rounded bg-gray-50 border border-gray-200 text-xs text-gray-800 whitespace-pre-line">
                    {detailTicket.description}
                  </div>
                </div>

                {detailTicket.solution && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-green-700 mb-1">
                      Solução Registrada
                    </h4>
                    <div className="p-2.5 rounded bg-green-50 border border-green-200 text-xs text-green-900 whitespace-pre-line font-medium">
                      {detailTicket.solution}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">
                    Histórico de Atendimentos ({detailTicket.history?.length || 0})
                  </h4>

                  {!detailTicket.history || detailTicket.history.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Nenhum atendimento registrado.</p>
                  ) : (
                    <div className="space-y-2">
                      {detailTicket.history.map((item, idx) => (
                        <div key={item.id || idx} className="p-2.5 bg-gray-50 rounded border border-gray-200 text-xs space-y-1">
                          <div className="flex justify-between text-[11px] text-gray-500">
                            <span className="font-semibold text-gray-700">{item.technician?.name || 'Técnico'}</span>
                            <span>{formatDateTime(item.attendedAt)}</span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-line">{item.note}</p>
                          <div className="text-[10px] text-gray-400">
                            Status: <span className="text-gray-600 font-medium">{item.resultingStatus}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setDetailModalOpen(false)
                      setDetailTicket(null)
                    }}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
