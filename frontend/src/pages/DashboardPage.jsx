import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, RefreshCw } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { dashboardApi, ticketsApi } from '../services/api'
import { StatusBadge, PriorityBadge } from '../components/StatusBadge'
import { formatDateTime } from '../utils/dateUtils'

export default function DashboardPage() {
  const { user, isTechnician } = useAuth()
  const { showError } = useToast()

  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({ open: 0, inProgress: 0, closed: 0 })
  const [recentTickets, setRecentTickets] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  const loadDashboardData = useCallback(async () => {
    try {
      const [summaryRes, ticketsRes] = await Promise.all([
        dashboardApi.getSummary(),
        ticketsApi.list(),
      ])

      if (summaryRes && summaryRes.tickets) {
        setMetrics(summaryRes.tickets)
      }

      if (Array.isArray(ticketsRes)) {
        setRecentTickets(ticketsRes.slice(0, 5))
      }
    } catch (err) {
      showError(err.message || 'Erro ao carregar dados do painel.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [showError])

  useEffect(() => {
    let isMounted = true

    async function initialLoad() {
      try {
        const [summaryRes, ticketsRes] = await Promise.all([
          dashboardApi.getSummary(),
          ticketsApi.list(),
        ])

        if (isMounted) {
          if (summaryRes && summaryRes.tickets) {
            setMetrics(summaryRes.tickets)
          }
          if (Array.isArray(ticketsRes)) {
            setRecentTickets(ticketsRes.slice(0, 5))
          }
        }
      } catch (err) {
        if (isMounted) {
          showError(err.message || 'Erro ao carregar dados do painel.')
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

  const handleRefresh = () => {
    setRefreshing(true)
    loadDashboardData()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Painel Principal
          </h1>
          <p className="text-sm text-gray-600">
            Logado como <strong className="text-gray-900">{user?.name}</strong> ({user?.role})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded transition-colors cursor-pointer"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>

          <Link
            to="/chamados"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Abrir Chamado</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase">Abertos</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {loading ? '-' : metrics.open}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Aguardando atendimento</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase">Em Atendimento</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {loading ? '-' : metrics.inProgress}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Em andamento</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase">Finalizados</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {loading ? '-' : metrics.closed}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Chamados concluídos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Abertura e Consulta</h2>
            <p className="text-xs text-gray-600 mt-1">
              Consulte a lista de chamados, pesquise por termo ou número e abra novas solicitações.
            </p>
          </div>
          <Link
            to="/chamados"
            className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            Ir para chamados &rarr;
          </Link>
        </div>

        {isTechnician && (
          <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Atendimento e Gestão</h2>
              <p className="text-xs text-gray-600 mt-1">
                Fila de atendimento para técnicos, ordenada por data de abertura do mais antigo ao mais recente.
              </p>
            </div>
            <Link
              to="/atendimento"
              className="mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-800"
            >
              Ir para fila de atendimento &rarr;
            </Link>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-3.5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Chamados Recentes</h2>
          <Link
            to="/chamados"
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Ver todos
          </Link>
        </div>

        {loading ? (
          <div className="p-6 text-center text-xs text-gray-500">Carregando...</div>
        ) : recentTickets.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500">Nenhum chamado encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 uppercase text-[11px] font-semibold text-gray-500 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-4 py-2.5">Nº</th>
                  <th scope="col" className="px-4 py-2.5">Assunto</th>
                  <th scope="col" className="px-4 py-2.5">Categoria</th>
                  <th scope="col" className="px-4 py-2.5">Prioridade</th>
                  <th scope="col" className="px-4 py-2.5">Abertura</th>
                  <th scope="col" className="px-4 py-2.5">Status</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-mono font-semibold text-gray-900">
                      #{ticket.id}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-gray-900 max-w-xs truncate">
                      {ticket.subject}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{ticket.category?.name || '-'}</td>
                    <td className="px-4 py-2.5">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{formatDateTime(ticket.openedAt)}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        to={`/chamados?ver=${ticket.id}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
