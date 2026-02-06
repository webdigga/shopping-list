import type { Env } from '../index'
import { json } from '../utils/response'

interface Item {
  id: string
  name: string
  completed: number
  position: number
  created_at: string
  updated_at: string
}

interface CreateItemBody {
  id?: string
  name: string
  completed?: boolean
}

interface UpdateItemBody {
  name?: string
  completed?: boolean
  position?: number
}

interface SyncChange {
  action: 'create' | 'update' | 'delete'
  item?: CreateItemBody | UpdateItemBody
  itemId?: string
  clientTimestamp: string
}

// GET /api/items - List all items
// POST /api/items - Create new item
export async function handleItems(request: Request, env: Env, method: string): Promise<Response> {
  try {
    if (method === 'GET') {
      const items = await env.DB.prepare(
        'SELECT * FROM items ORDER BY completed ASC, position ASC, created_at DESC'
      ).all<Item>()

      return json({ items: items.results || [] }, 200, env)
    }

    if (method === 'POST') {
      const body = await request.json() as CreateItemBody
      const { id, name, completed } = body

      if (!name || name.trim().length === 0) {
        return json({ error: 'Name is required' }, 400, env)
      }

      const itemId = id || crypto.randomUUID()
      const now = new Date().toISOString()

      // Get next position
      const maxPos = await env.DB.prepare(
        'SELECT MAX(position) as maxPos FROM items WHERE completed = 0'
      ).first<{ maxPos: number | null }>()
      const position = (maxPos?.maxPos ?? -1) + 1

      await env.DB.prepare(
        `INSERT INTO items (id, name, completed, position, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(itemId, name.trim(), completed ? 1 : 0, position, now, now).run()

      const item = await env.DB.prepare('SELECT * FROM items WHERE id = ?').bind(itemId).first<Item>()
      return json({ item }, 201, env)
    }

    return json({ error: 'Method not allowed' }, 405, env)
  } catch (error) {
    console.error('Items error:', error)
    return json({ error: 'Internal error' }, 500, env)
  }
}

// PATCH /api/items/:id - Update item
// DELETE /api/items/:id - Delete item
export async function handleItemById(request: Request, env: Env, itemId: string, method: string): Promise<Response> {
  try {
    // Check item exists
    const existing = await env.DB.prepare('SELECT * FROM items WHERE id = ?').bind(itemId).first<Item>()
    if (!existing) {
      return json({ error: 'Item not found' }, 404, env)
    }

    if (method === 'DELETE') {
      await env.DB.prepare('DELETE FROM items WHERE id = ?').bind(itemId).run()
      return json({ success: true }, 200, env)
    }

    if (method === 'PATCH') {
      const body = await request.json() as UpdateItemBody
      const updates: string[] = []
      const values: (string | number)[] = []

      if (body.name !== undefined) {
        updates.push('name = ?')
        values.push(body.name.trim())
      }
      if (body.completed !== undefined) {
        updates.push('completed = ?')
        values.push(body.completed ? 1 : 0)
      }
      if (body.position !== undefined) {
        updates.push('position = ?')
        values.push(body.position)
      }

      if (updates.length === 0) {
        return json({ error: 'No updates provided' }, 400, env)
      }

      updates.push('updated_at = ?')
      values.push(new Date().toISOString())
      values.push(itemId)

      await env.DB.prepare(
        `UPDATE items SET ${updates.join(', ')} WHERE id = ?`
      ).bind(...values).run()

      const item = await env.DB.prepare('SELECT * FROM items WHERE id = ?').bind(itemId).first<Item>()
      return json({ item }, 200, env)
    }

    return json({ error: 'Method not allowed' }, 405, env)
  } catch (error) {
    console.error('Item by ID error:', error)
    return json({ error: 'Internal error' }, 500, env)
  }
}

// POST /api/items/sync - Bulk sync offline changes
export async function handleSync(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as { changes: SyncChange[] }
    const { changes } = body

    if (!changes || !Array.isArray(changes)) {
      return json({ error: 'Invalid sync data' }, 400, env)
    }

    const applied: string[] = []
    const errors: { itemId: string; error: string }[] = []

    for (const change of changes) {
      try {
        if (change.action === 'create' && change.item && 'name' in change.item) {
          const item = change.item as CreateItemBody
          const itemId = item.id || crypto.randomUUID()
          const now = new Date().toISOString()

          const maxPos = await env.DB.prepare(
            'SELECT MAX(position) as maxPos FROM items WHERE completed = 0'
          ).first<{ maxPos: number | null }>()
          const position = (maxPos?.maxPos ?? -1) + 1

          await env.DB.prepare(
            `INSERT OR REPLACE INTO items (id, name, completed, position, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?)`
          ).bind(itemId, item.name.trim(), item.completed ? 1 : 0, position, now, now).run()

          applied.push(itemId)
        } else if (change.action === 'update' && change.itemId && change.item) {
          const item = change.item as UpdateItemBody
          const updates: string[] = []
          const values: (string | number)[] = []

          if (item.name !== undefined) {
            updates.push('name = ?')
            values.push(item.name.trim())
          }
          if (item.completed !== undefined) {
            updates.push('completed = ?')
            values.push(item.completed ? 1 : 0)
          }
          if (item.position !== undefined) {
            updates.push('position = ?')
            values.push(item.position)
          }

          if (updates.length > 0) {
            updates.push('updated_at = ?')
            values.push(new Date().toISOString())
            values.push(change.itemId)

            await env.DB.prepare(
              `UPDATE items SET ${updates.join(', ')} WHERE id = ?`
            ).bind(...values).run()
          }

          applied.push(change.itemId)
        } else if (change.action === 'delete' && change.itemId) {
          await env.DB.prepare('DELETE FROM items WHERE id = ?').bind(change.itemId).run()
          applied.push(change.itemId)
        }
      } catch (e) {
        errors.push({ itemId: change.itemId || 'unknown', error: String(e) })
      }
    }

    // Return current state after sync
    const items = await env.DB.prepare(
      'SELECT * FROM items ORDER BY completed ASC, position ASC, created_at DESC'
    ).all<Item>()

    return json({
      applied,
      errors,
      items: items.results || [],
      syncTimestamp: new Date().toISOString()
    }, 200, env)
  } catch (error) {
    console.error('Sync error:', error)
    return json({ error: 'Internal error' }, 500, env)
  }
}
