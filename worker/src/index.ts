import { handleItems, handleItemById, handleSync } from './routes/items'
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

    // Items routes
    if (path === '/api/items') {
      if (request.method === 'GET') {
        return handleItems(request, env, 'GET')
      }
      if (request.method === 'POST') {
        return handleItems(request, env, 'POST')
      }
    }

    // Single item routes
    const itemMatch = path.match(/^\/api\/items\/([a-zA-Z0-9-]+)$/)
    if (itemMatch) {
      const itemId = itemMatch[1]
      if (request.method === 'PATCH') {
        return handleItemById(request, env, itemId, 'PATCH')
      }
      if (request.method === 'DELETE') {
        return handleItemById(request, env, itemId, 'DELETE')
      }
    }

    // Sync route
    if (path === '/api/items/sync' && request.method === 'POST') {
      return handleSync(request, env)
    }

    // 404 for unknown routes
    return json({ error: 'Not found' }, 404, env)
  }
}
