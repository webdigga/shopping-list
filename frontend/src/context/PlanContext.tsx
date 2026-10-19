import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { PlanState } from '@shared/weekState'
import type { WeekNumber } from '@shared/planTypes'
import * as api from '@/services/api'
import { readCache, writeCache } from '@/services/sync'
import { planView, type PlanView } from '@/plan/schedule'

const STATE_CACHE = '/mp/state'

interface CachedState {
  initialised: boolean | null
  state: PlanState | null
}

interface PlanContextValue {
  /** null until the server has answered once on this device. */
  initialised: boolean | null
  view: PlanView
  now: Date
  error: string | null
  setWeek: (week: WeekNumber, startDate: string) => Promise<boolean>
  pause: () => Promise<boolean>
}

const PlanContext = createContext<PlanContextValue | null>(null)

export function PlanProvider({ children }: { children: ReactNode }) {
  const [cached, setCached] = useState<CachedState>(() => readCache(STATE_CACHE, { initialised: null, state: null }))
  const [now, setNow] = useState(() => new Date())
  const [error, setError] = useState<string | null>(null)

  const apply = useCallback((res: api.StateResponse) => {
    const next = { initialised: res.initialised, state: res.state }
    setCached(next)
    writeCache(STATE_CACHE, next)
    setError(null)
  }, [])

  const refresh = useCallback(async () => {
    try {
      apply(await api.fetchState())
    } catch {
      // Offline: keep the cached state, which still resolves the right day locally.
    }
  }, [apply])

  useEffect(() => {
    void refresh()
    const tick = setInterval(() => setNow(new Date()), 60_000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        setNow(new Date())
        void refresh()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(tick)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refresh])

  const run = useCallback(async (action: () => Promise<api.StateResponse>) => {
    try {
      apply(await action())
      return true
    } catch (e) {
      setError(e instanceof api.ApiError ? e.message : 'Could not reach the server. Try again when you have signal.')
      return false
    }
  }, [apply])

  const value = useMemo<PlanContextValue>(() => ({
    initialised: cached.initialised,
    view: planView(cached.state, now),
    now,
    error,
    setWeek: (week, startDate) => run(() => api.setWeek(week, startDate)),
    pause: () => run(() => api.pausePlan()),
  }), [cached, now, error, run])

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
}

export function usePlan(): PlanContextValue {
  const context = useContext(PlanContext)
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider')
  }
  return context
}
