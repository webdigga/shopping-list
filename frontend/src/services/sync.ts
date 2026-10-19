// Offline-friendly writes. Every write is idempotent (PUT a value, or DELETE), so a queue keyed
// by path, last write wins, is safe to replay. Reads are cached so the app opens without signal.
import { ApiError, request } from './api'

export interface QueuedWrite {
  method: 'PUT' | 'DELETE'
  path: string
  body?: unknown
}

const QUEUE_KEY = 'mp-write-queue'
const CACHE_PREFIX = 'mp-cache:'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or blocked: the in-memory state still works for this session.
  }
}

export function readCache<T>(path: string, fallback: T): T {
  return readJson(CACHE_PREFIX + path, fallback)
}

export function writeCache(path: string, value: unknown) {
  writeJson(CACHE_PREFIX + path, value)
}

/** Patchy signal (a shop) often fails requests without an offline event, so retry on a timer. */
const RETRY_MS = 15_000

let queue: QueuedWrite[] = readJson(QUEUE_KEY, [])
let running: Promise<void> | null = null
let retryTimer: ReturnType<typeof setTimeout> | null = null
const listeners = new Set<() => void>()

/** Called after the queue drains, so screens can refetch fresh server data. */
export function onSynced(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function hasPendingWrites(): boolean {
  return queue.length > 0
}

export function enqueue(write: QueuedWrite) {
  queue = [...queue.filter(q => q.path !== write.path), write]
  writeJson(QUEUE_KEY, queue)
  void flush()
}

/** Sends queued writes in order. Returns false if one could not be sent yet. */
async function drain(): Promise<boolean> {
  while (queue.length > 0) {
    const write = queue[0]
    try {
      await request(write.path, {
        method: write.method,
        body: write.body === undefined ? undefined : JSON.stringify(write.body),
      })
    } catch (error) {
      // A rejected write (bad request) will never succeed, so drop it. Anything else
      // (offline, server down, signed out) stays queued for the next attempt.
      const rejected = error instanceof ApiError && error.status >= 400 && error.status < 500 && error.status !== 401
      if (!rejected) return false
    }
    // By identity: a newer write to the same path may have replaced this one mid-request.
    queue = queue.filter(q => q !== write)
    writeJson(QUEUE_KEY, queue)
  }
  return true
}

function scheduleRetry() {
  if (retryTimer) return
  retryTimer = setTimeout(() => {
    retryTimer = null
    void flush()
  }, RETRY_MS)
}

export function flush(): Promise<void> {
  // A running flush already picks up writes queued while it works.
  if (running) return running
  running = (async () => {
    try {
      if (!(await drain())) {
        scheduleRetry()
        return
      }
      listeners.forEach(l => l())
    } finally {
      running = null
    }
  })()
  return running
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => void flush())
}
