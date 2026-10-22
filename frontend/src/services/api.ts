import type { AwayPrompt, PlanState } from '@shared/weekState'
import type { WeekNumber } from '@shared/planTypes'

// Use production API in prod, proxy in dev
const API_BASE = import.meta.env.PROD
  ? 'https://shopping-list-api.webdigga42.workers.dev/api'
  : '/api'

const TOKEN_KEY = 'shopping-list-auth'

// 30-day expiry (matches server session duration)
const TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

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

export async function request<T>(
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
    throw new ApiError(data.error || data.message || 'Request failed', response.status)
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

// Meal plan API
export interface StateResponse {
  initialised: boolean
  state: PlanState | null
  today: string
  away: AwayPrompt | null
}

export async function fetchState(): Promise<StateResponse> {
  return request('/mp/state')
}

export async function setWeek(week: WeekNumber, startDate: string): Promise<StateResponse> {
  return request('/mp/state', {
    method: 'POST',
    body: JSON.stringify({ action: 'set', week, startDate })
  })
}

export async function pausePlan(): Promise<StateResponse> {
  return request('/mp/state', {
    method: 'POST',
    body: JSON.stringify({ action: 'pause' })
  })
}

export function ticksPath(instance: string): string {
  return `/mp/ticks/${encodeURIComponent(instance)}`
}

export function extrasPath(): string {
  return '/mp/extras'
}
