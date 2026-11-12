export function StatusBadge({ status }) {
  let color = 'bg-slate-100 text-slate-700 border-slate-200'

  if (status === 'Aberto') {
    color = 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-600/10'
  } else if (status === 'Em atendimento') {
    color = 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-600/10'
  } else if (status === 'Finalizado') {
    color = 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-600/10'
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {status || '-'}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  let color = 'bg-slate-100 text-slate-700 border-slate-200'

  if (priority === 'Baixa') {
    color = 'bg-emerald-50 text-emerald-700 border-emerald-200'
  } else if (priority === 'Média') {
    color = 'bg-amber-50 text-amber-700 border-amber-200'
  } else if (priority === 'Alta') {
    color = 'bg-rose-50 text-rose-700 border-rose-200'
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${color}`}
    >
      {priority || '-'}
    </span>
  )
}
