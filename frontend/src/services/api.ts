import type { ApiItem, SyncChange } from '@/types'

// Use production API in prod, proxy in dev
const API_BASE = import.meta.env.PROD
  ? 'https://shopping-list-api.webdigga42.workers.dev/api'
  : '/api'

const TOKEN_KEY = 'shopping-list-auth'

// 30-day expiry (matches server session duration)
const TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000

function loadToken(): string | null {
  try {
    const stored = localStorage.getItem(TOKEN_KEY)
    if (!stored) return null
    const { token, expires } = JSON.parse(stored)
    if (Date.now() > expires) {
      localStorage.removeItem(TOKEN_KEY)
      return null
    }
    return token
  } catch {
    localStorage.removeItem(TOKEN_KEY)
    return null
  }
}

let authToken: string | null = loadToken()

export function setAuthToken(token: string | null) {
  authToken = token
  if (token) {
    localStorage.setItem(TOKEN_KEY, JSON.stringify({
      token,
      expires: Date.now() + TOKEN_EXPIRY_MS
    }))
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function getAuthToken(): string | null {
  return authToken
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  // Merge any existing headers from options
  if (options.headers) {
    const optHeaders = options.headers as Record<string, string>
    Object.assign(headers, optHeaders)
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed')
  }

  return data
}

// Auth API
export async function checkAuthStatus(): Promise<{ pinConfigured: boolean }> {
  return request('/auth/check')
}

export async function setupPin(pin: string): Promise<{ success: boolean; token: string }> {
  return request('/auth/setup', {
    method: 'POST',
    body: JSON.stringify({ pin })
  })
}

export async function verifyPin(pin: string): Promise<{ valid: boolean; token?: string; requireSetup?: boolean }> {
  return request('/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ pin })
  })
}

// Items API
export async function fetchItems(): Promise<{ items: ApiItem[] }> {
  return request('/items')
}

export async function createItem(name: string, id?: string): Promise<{ item: ApiItem }> {
  return request('/items', {
    method: 'POST',
    body: JSON.stringify({ id, name })
  })
}

export async function updateItem(
  id: string,
  updates: { name?: string; completed?: boolean; position?: number }
): Promise<{ item: ApiItem }> {
  return request(`/items/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  })
}

export async function deleteItem(id: string): Promise<{ success: boolean }> {
  return request(`/items/${id}`, {
    method: 'DELETE'
  })
}

export async function syncChanges(changes: SyncChange[]): Promise<{
  applied: string[]
  errors: { itemId: string; error: string }[]
  items: ApiItem[]
  syncTimestamp: string
}> {
  return request('/items/sync', {
    method: 'POST',
    body: JSON.stringify({ changes })
  })
}
