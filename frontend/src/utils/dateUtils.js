export function truncateToMinute(date) {
  const d = new Date(date)
  d.setSeconds(0, 0)
  return d
}

export function formatDateTime(dateInput) {
  if (!dateInput) return '-'
  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function toInputDateTimeLocal(date = new Date()) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''

  const pad = (n) => String(n).padStart(2, '0')
  const year = d.getFullYear()
  const month = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const hours = pad(d.getHours())
  const minutes = pad(d.getMinutes())

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function validateAttendedAt(attendedAtInput, openedAtInput) {
  if (!attendedAtInput) {
    return { valid: false, message: 'Informe a data e hora do atendimento' }
  }

  const attended = truncateToMinute(attendedAtInput)
  const opened = truncateToMinute(openedAtInput)
  const now = truncateToMinute(new Date())

  if (attended < opened) {
    return {
      valid: false,
      message: 'A data e hora do atendimento não pode ser anterior à abertura do chamado',
    }
  }

  if (attended > now) {
    return {
      valid: false,
      message: 'A data e hora do atendimento não pode ser posterior ao momento atual',
    }
  }

  return { valid: true }
}
