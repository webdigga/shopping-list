import type { Env } from '../index'
import { json } from '../utils/response'
import {
  londonDate,
  resolveState,
  isFriday,
  isWeekNumber,
  daysBetween,
  type PlanState,
} from '../../../shared/weekState'
import { EXTRA_NAME_MAX, extraTickKey } from '../../../shared/extras'

// Earliest and latest start Friday that Set week / Resume accept, relative to today:
// the most recent Friday (up to 6 days ago) or the next one (up to 7 days ahead).
const START_MIN_OFFSET = -6
const START_MAX_OFFSET = 7

const INSTANCE_RE = /^W[123]:\d{4}-\d{2}-\d{2}$/
const ID_RE = /^[a-z0-9-]{1,64}$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

async function readState(env: Env): Promise<PlanState | null> {
  const rows = await env.DB.prepare('SELECT key, value FROM mp_state').all<{ key: string; value: string }>()
  const map = new Map((rows.results ?? []).map(r => [r.key, r.value]))
  const week = Number(map.get('current_week'))
  const start = map.get('week_start_date')
  if (!isWeekNumber(week) || !start) return null
  return {
    currentWeek: week,
    weekStartDate: start,
    paused: map.get('paused') === '1',
    pausedOn: map.get('paused_on') || null,
  }
}

function upsert(env: Env, key: string, value: string): D1PreparedStatement {
  return env.DB.prepare(
    `INSERT INTO mp_state (key, value, updated_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  ).bind(key, value)
}

async function stateResponse(env: Env): Promise<Response> {
  const today = londonDate(new Date())
  const stored = await readState(env)
  if (!stored) {
    return json({ initialised: false, state: null, today, away: null }, 200, env)
  }

  const resolved = resolveState(stored, today)

  if (resolved.advanced) {
    // Guarded on the old start date so two devices opening at once advance only once.
    await env.DB.batch([
      env.DB.prepare(
        `UPDATE mp_state SET value = ?, updated_at = datetime('now')
         WHERE key = 'current_week'
           AND EXISTS (SELECT 1 FROM mp_state WHERE key = 'week_start_date' AND value = ?)`
      ).bind(String(resolved.state.currentWeek), stored.weekStartDate),
      env.DB.prepare(
        `UPDATE mp_state SET value = ?, updated_at = datetime('now')
         WHERE key = 'week_start_date' AND value = ?`
      ).bind(resolved.state.weekStartDate, stored.weekStartDate),
    ])
    const fresh = await readState(env)
    return json({ initialised: true, state: fresh, today, away: null }, 200, env)
  }

  return json({ initialised: true, state: resolved.state, today, away: resolved.away }, 200, env)
}

// GET /api/mp/state
// POST /api/mp/state  { action: 'set', week, startDate } | { action: 'pause' }
export async function handleState(request: Request, env: Env): Promise<Response> {
  try {
    if (request.method === 'GET') return stateResponse(env)

    if (request.method === 'POST') {
      const body = await request.json() as { action?: string; week?: unknown; startDate?: unknown }
      const today = londonDate(new Date())

      if (body.action === 'set') {
        const { week, startDate } = body
        if (!isWeekNumber(week)) {
          return json({ error: 'Week must be 1, 2 or 3' }, 400, env)
        }
        if (typeof startDate !== 'string' || !DATE_RE.test(startDate) || !isFriday(startDate)) {
          return json({ error: 'Start date must be a Friday' }, 400, env)
        }
        const offset = daysBetween(today, startDate)
        if (offset < START_MIN_OFFSET || offset > START_MAX_OFFSET) {
          return json({ error: 'Start date must be the most recent or the next Friday' }, 400, env)
        }
        await env.DB.batch([
          upsert(env, 'current_week', String(week)),
          upsert(env, 'week_start_date', startDate),
          upsert(env, 'paused', '0'),
          upsert(env, 'paused_on', ''),
        ])
        return stateResponse(env)
      }

      if (body.action === 'pause') {
        const stored = await readState(env)
        if (!stored) return json({ error: 'Set a week before pausing' }, 409, env)
        if (!stored.paused) {
          await env.DB.batch([upsert(env, 'paused', '1'), upsert(env, 'paused_on', today)])
        }
        return stateResponse(env)
      }

      return json({ error: 'Unknown action' }, 400, env)
    }

    return json({ error: 'Method not allowed' }, 405, env)
  } catch (error) {
    console.error('State error:', error)
    return json({ error: 'Internal error' }, 500, env)
  }
}

// GET    /api/mp/ticks/:instance
// DELETE /api/mp/ticks/:instance              (clear ticks)
// PUT    /api/mp/ticks/:instance/:ingredient  { ticked }
export async function handleTicks(
  request: Request,
  env: Env,
  instance: string,
  ingredient: string | null
): Promise<Response> {
  try {
    if (!INSTANCE_RE.test(instance)) return json({ error: 'Invalid week instance' }, 400, env)

    if (!ingredient && request.method === 'GET') {
      const rows = await env.DB.prepare(
        'SELECT ingredient_id FROM mp_shopping_ticks WHERE week_instance = ? AND ticked = 1'
      ).bind(instance).all<{ ingredient_id: string }>()
      const ticks: Record<string, true> = {}
      for (const r of rows.results ?? []) ticks[r.ingredient_id] = true
      return json({ ticks }, 200, env)
    }

    if (!ingredient && request.method === 'DELETE') {
      await env.DB.prepare('DELETE FROM mp_shopping_ticks WHERE week_instance = ?').bind(instance).run()
      return json({ success: true }, 200, env)
    }

    if (ingredient && request.method === 'PUT') {
      if (!ID_RE.test(ingredient)) return json({ error: 'Invalid ingredient' }, 400, env)
      const { ticked } = await request.json() as { ticked?: unknown }
      if (typeof ticked !== 'boolean') return json({ error: 'ticked must be true or false' }, 400, env)
      await env.DB.prepare(
        `INSERT INTO mp_shopping_ticks (week_instance, ingredient_id, ticked, updated_at)
         VALUES (?, ?, ?, datetime('now'))
         ON CONFLICT(week_instance, ingredient_id)
         DO UPDATE SET ticked = excluded.ticked, updated_at = excluded.updated_at`
      ).bind(instance, ingredient, ticked ? 1 : 0).run()
      return json({ success: true }, 200, env)
    }

    return json({ error: 'Method not allowed' }, 405, env)
  } catch (error) {
    console.error('Ticks error:', error)
    return json({ error: 'Internal error' }, 500, env)
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

// GET    /api/mp/extras
// PUT    /api/mp/extras/:id  { name }  (creates or renames; ids come from the app so offline adds can queue)
// DELETE /api/mp/extras/:id
export async function handleExtras(request: Request, env: Env, id: string | null): Promise<Response> {
  try {
    if (!id && request.method === 'GET') {
      const rows = await env.DB.prepare(
        'SELECT id, name FROM mp_extra_items ORDER BY name COLLATE NOCASE'
      ).all<{ id: string; name: string }>()
      return json({ items: rows.results ?? [] }, 200, env)
    }

    if (id && !UUID_RE.test(id)) return json({ error: 'Invalid item' }, 400, env)

    if (id && request.method === 'PUT') {
      const { name } = await request.json() as { name?: unknown }
      const trimmed = typeof name === 'string' ? name.trim() : ''
      if (!trimmed || trimmed.length > EXTRA_NAME_MAX) {
        return json({ error: `Name must be 1 to ${EXTRA_NAME_MAX} characters` }, 400, env)
      }
      await env.DB.prepare(
        `INSERT INTO mp_extra_items (id, name, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT(id) DO UPDATE SET name = excluded.name, updated_at = excluded.updated_at`
      ).bind(id, trimmed).run()
      return json({ success: true }, 200, env)
    }

    if (id && request.method === 'DELETE') {
      await env.DB.batch([
        env.DB.prepare('DELETE FROM mp_extra_items WHERE id = ?').bind(id),
        env.DB.prepare('DELETE FROM mp_shopping_ticks WHERE ingredient_id = ?').bind(extraTickKey(id)),
      ])
      return json({ success: true }, 200, env)
    }

    return json({ error: 'Method not allowed' }, 405, env)
  } catch (error) {
    console.error('Extras error:', error)
    return json({ error: 'Internal error' }, 500, env)
  }
}
