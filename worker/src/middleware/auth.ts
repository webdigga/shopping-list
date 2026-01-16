import type { Env } from '../index'
import { json } from '../utils/response'

// Simple session store (in production, use KV or D1)
const sessions = new Map<string, { expires: number }>()

export function createSession(): string {
  const token = crypto.randomUUID()
  // Session expires in 24 hours
  sessions.set(token, { expires: Date.now() + 24 * 60 * 60 * 1000 })
  return token
}

export function validateSession(token: string): boolean {
  const session = sessions.get(token)
  if (!session) return false
  if (Date.now() > session.expires) {
    sessions.delete(token)
    return false
  }
  return true
}

export async function authMiddleware(request: Request, env: Env): Promise<Response | null> {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return json({ error: 'Unauthorized', message: 'Missing or invalid authorization header' }, 401, env)
  }

  const token = authHeader.replace('Bearer ', '')

  if (!validateSession(token)) {
    return json({ error: 'Unauthorized', message: 'Invalid or expired session' }, 401, env)
  }

  return null // Auth successful, continue to route handler
}
