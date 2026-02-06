import type { Env } from '../index'
import { json } from '../utils/response'
import { createSession } from '../middleware/auth'

// Hash a PIN using Web Crypto API
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin + '_shopping_list_salt_2025')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// POST /api/auth/setup - Set initial PIN
export async function handleAuthSetup(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as { pin?: string }
    const { pin } = body

    if (!pin || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      return json({ error: 'Invalid PIN', message: 'PIN must be 4-6 digits' }, 400, env)
    }

    // Check if PIN already exists
    const existing = await env.DB.prepare(
      'SELECT value FROM settings WHERE key = ?'
    ).bind('pin_hash').first()

    if (existing) {
      return json({ error: 'PIN already set', message: 'PIN has already been configured' }, 409, env)
    }

    // Hash and store the PIN
    const hashedPin = await hashPin(pin)
    await env.DB.prepare(
      'INSERT INTO settings (key, value) VALUES (?, ?)'
    ).bind('pin_hash', hashedPin).run()

    // Create session and return token
    const token = await createSession(env)
    return json({ success: true, token }, 201, env)
  } catch (error) {
    console.error('Auth setup error:', error)
    return json({ error: 'Internal error' }, 500, env)
  }
}

// POST /api/auth/verify - Verify PIN and get session
export async function handleAuthVerify(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as { pin?: string }
    const { pin } = body

    if (!pin) {
      return json({ error: 'Missing PIN' }, 400, env)
    }

    // Get stored PIN hash
    const stored = await env.DB.prepare(
      'SELECT value FROM settings WHERE key = ?'
    ).bind('pin_hash').first<{ value: string }>()

    if (!stored) {
      return json({ error: 'PIN not set', requireSetup: true }, 404, env)
    }

    // Hash provided PIN and compare
    const hashedPin = await hashPin(pin)

    if (hashedPin === stored.value) {
      const token = await createSession(env)
      return json({ valid: true, token }, 200, env)
    }

    return json({ valid: false, error: 'Invalid PIN' }, 401, env)
  } catch (error) {
    console.error('Auth verify error:', error)
    return json({ error: 'Internal error' }, 500, env)
  }
}

// GET /api/auth/check - Check if PIN is set up
export async function handleAuthCheck(request: Request, env: Env): Promise<Response> {
  try {
    const stored = await env.DB.prepare(
      'SELECT value FROM settings WHERE key = ?'
    ).bind('pin_hash').first()

    return json({
      pinConfigured: !!stored
    }, 200, env)
  } catch (error) {
    console.error('Auth check error:', error)
    return json({ error: 'Internal error' }, 500, env)
  }
}
