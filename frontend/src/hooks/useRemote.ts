import { useCallback, useEffect, useState } from 'react'
import { request } from '@/services/api'
import { hasPendingWrites, onSynced, readCache, writeCache } from '@/services/sync'

/**
 * Server data with a local cache: renders the cached copy at once, then refreshes from the
 * server on mount, when the app comes back into view, and after queued writes sync.
 * While writes are pending, the local copy wins so an offline tick is never undone.
 */
export function useRemote<T>(path: string, fallback: T) {
  const [data, setData] = useState<T>(() => readCache(path, fallback))
  const [loadedPath, setLoadedPath] = useState(path)

  if (loadedPath !== path) {
    setLoadedPath(path)
    setData(readCache(path, fallback))
  }

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (hasPendingWrites()) return
      try {
        const fresh = await request<T>(path)
        if (!cancelled && !hasPendingWrites()) {
          setData(fresh)
          writeCache(path, fresh)
        }
      } catch {
        // Offline or server down: keep showing the cached copy.
      }
    }

    void load()
    const offSynced = onSynced(() => void load())
    const onVisible = () => {
      if (document.visibilityState === 'visible') void load()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      offSynced()
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [path])

  const update = useCallback((change: (prev: T) => T) => {
    setData(prev => {
      const next = change(prev)
      writeCache(path, next)
      return next
    })
  }, [path])

  return [data, update] as const
}
