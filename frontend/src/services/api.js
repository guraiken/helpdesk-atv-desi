const API_BASE = import.meta.env.VITE_API_URL || '/api'

export class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('helpdesk_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const url = `${API_BASE}${endpoint}`

  let response
  try {
    response = await fetch(url, {
      ...options,
      headers,
    })
  } catch {
    throw new ApiError(
      'Não foi possível conectar ao servidor. Verifique se o backend está em execução.',
      0
    )
  }

  if (response.status === 204) {
    return null
  }

  let data = null
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json()
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    const message = (data && data.message) || response.statusText || 'Erro na requisição'
    const errors = (data && data.errors) || []
    throw new ApiError(message, response.status, errors)
  }

  return data
}

export const authApi = {
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),
  me: () => request('/auth/me'),
}

export const dashboardApi = {
  getSummary: () => request('/dashboard'),
}

export const categoriesApi = {
  list: () => request('/categories'),
}

export const ticketsApi = {
  list: (search) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : ''
    return request(`/tickets${query}`)
  },
  getById: (id) => request(`/tickets/${id}`),
  create: (ticketData) =>
    request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    }),
  update: (id, ticketData) =>
    request(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ticketData),
    }),
  remove: (id) =>
    request(`/tickets/${id}`, {
      method: 'DELETE',
    }),
}

export const supportApi = {
  list: () => request('/support'),
  getById: (id) => request(`/support/${id}`),
  take: (id, payload) =>
    request(`/support/${id}/take`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  addNote: (id, payload) =>
    request(`/support/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  close: (id, payload) =>
    request(`/support/${id}/close`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
}
