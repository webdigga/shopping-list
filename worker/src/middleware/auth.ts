import type { Env } from '../index'
import { json } from '../utils/response'

// 30-day session expiry
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000

export async function createSession(env: Env): Promise<string> {
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString()

  await env.DB.prepare(
    'INSERT INTO sessions (token, expires_at) VALUES (?, ?)'
  ).bind(token, expiresAt).run()

  return token
}

async function validateSession(token: string, env: Env): Promise<boolean> {
  const session = await env.DB.prepare(
    'SELECT expires_at FROM sessions WHERE token = ?'
  ).bind(token).first<{ expires_at: string }>()

  if (!session) return false

  if (new Date(session.expires_at) < new Date()) {
    // Expired - clean it up
    await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run()
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

  if (!(await validateSession(token, env))) {
    return json({ error: 'Unauthorized', message: 'Invalid or expired session' }, 401, env)
  }

  return null // Auth successful, continue to route handler
}
