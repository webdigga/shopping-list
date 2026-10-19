import { handleState, handleTicks, handleStock, handleTasks } from './routes/mealPlan'
import { handleAuthSetup, handleAuthVerify, handleAuthCheck } from './routes/auth'
import { authMiddleware } from './middleware/auth'
import { json, cors, corsHeaders } from './utils/response'

export interface Env {
  DB: D1Database
  ENVIRONMENT: string
  ALLOWED_ORIGIN: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return cors(env)
    }

    // Health check
    if (path === '/api/health') {
      return json({ status: 'ok', timestamp: new Date().toISOString() }, 200, env)
    }

    // Auth routes (no auth required)
    if (path === '/api/auth/setup' && request.method === 'POST') {
      return handleAuthSetup(request, env)
    }
    if (path === '/api/auth/verify' && request.method === 'POST') {
      return handleAuthVerify(request, env)
    }
    if (path === '/api/auth/check' && request.method === 'GET') {
      return handleAuthCheck(request, env)
    }

    // All other routes require authentication
    const authResult = await authMiddleware(request, env)
    if (authResult instanceof Response) {
      return authResult
    }

    if (path === '/api/mp/state') {
      return handleState(request, env)
    }

    const ticksMatch = path.match(/^\/api\/mp\/ticks\/([^/]+)(?:\/([^/]+))?$/)
    if (ticksMatch) {
      return handleTicks(request, env, decodeURIComponent(ticksMatch[1]), ticksMatch[2] ?? null)
    }

    const stockMatch = path.match(/^\/api\/mp\/stock(?:\/([^/]+))?$/)
    if (stockMatch) {
      return handleStock(request, env, stockMatch[1] ?? null)
    }

    const tasksMatch = path.match(/^\/api\/mp\/tasks(?:\/([^/]+)\/([^/]+))?$/)
    if (tasksMatch) {
      return handleTasks(request, env, tasksMatch[1] ?? null, tasksMatch[2] ?? null)
    }

    // 404 for unknown routes
    return json({ error: 'Not found' }, 404, env)
  }
}
