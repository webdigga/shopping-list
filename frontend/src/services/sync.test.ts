import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type Call = { url: string; method: string; body: unknown }

function mockFetch(behaviour: (call: Call) => Response | Promise<Response>) {
  const calls: Call[] = []
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
    const call = { url, method: init.method ?? 'GET', body: init.body ? JSON.parse(init.body as string) : undefined }
    calls.push(call)
    return behaviour(call)
  }))
  return calls
}

const ok = () => new Response(JSON.stringify({ success: true }), { status: 200 })

describe('write queue', () => {
  beforeEach(() => {
    vi.resetModules()
    const store = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps writes while offline and replays only the latest per path', async () => {
    let online = false
    const calls = mockFetch(() => {
      if (!online) throw new TypeError('Failed to fetch')
      return ok()
    })
    const sync = await import('./sync')

    sync.enqueue({ method: 'PUT', path: '/mp/ticks/W1%3A2026-10-23/milk', body: { ticked: true } })
    sync.enqueue({ method: 'PUT', path: '/mp/ticks/W1%3A2026-10-23/milk', body: { ticked: false } })
    await sync.flush()
    expect(sync.hasPendingWrites()).toBe(true)

    online = true
    calls.length = 0
    await sync.flush()
    expect(sync.hasPendingWrites()).toBe(false)
    expect(calls).toHaveLength(1)
    expect(calls[0].body).toEqual({ ticked: false })
  })

  it('keeps clear-then-tick in order', async () => {
    const calls = mockFetch(() => ok())
    const sync = await import('./sync')

    sync.enqueue({ method: 'DELETE', path: '/mp/ticks/W1%3A2026-10-23' })
    sync.enqueue({ method: 'PUT', path: '/mp/ticks/W1%3A2026-10-23/milk', body: { ticked: true } })
    await vi.waitFor(() => expect(sync.hasPendingWrites()).toBe(false))
    expect(calls.map(c => c.method)).toEqual(['DELETE', 'PUT'])
  })

  it('drops a write the server rejects as invalid', async () => {
    mockFetch(() => new Response(JSON.stringify({ error: 'Invalid' }), { status: 400 }))
    const sync = await import('./sync')

    sync.enqueue({ method: 'PUT', path: '/mp/ticks/bad/eggs', body: { ticked: 'yes' } })
    await vi.waitFor(() => expect(sync.hasPendingWrites()).toBe(false))
  })

  it('keeps writes when signed out, to send after the PIN is entered', async () => {
    mockFetch(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }))
    const sync = await import('./sync')

    sync.enqueue({ method: 'PUT', path: '/mp/ticks/W1%3A2026-10-23/eggs', body: { ticked: true } })
    await sync.flush()
    expect(sync.hasPendingWrites()).toBe(true)
  })
})
