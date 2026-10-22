// Shopping ticks: persisted in D1, updated optimistically, queued offline.
import { useCallback } from 'react'
import { ticksPath } from '@/services/api'
import { enqueue } from '@/services/sync'
import { useRemote } from './useRemote'

type Flags = Record<string, true>

function setFlag(flags: Flags, key: string, on: boolean): Flags {
  const next = { ...flags }
  if (on) next[key] = true
  else delete next[key]
  return next
}

export function useShoppingTicks(instance: string) {
  const path = ticksPath(instance)
  const [data, update] = useRemote<{ ticks: Flags }>(path, { ticks: {} })

  const setTick = useCallback((ingredient: string, ticked: boolean) => {
    update(d => ({ ticks: setFlag(d.ticks, ingredient, ticked) }))
    enqueue({ method: 'PUT', path: `${path}/${ingredient}`, body: { ticked } })
  }, [path, update])

  const clearTicks = useCallback(() => {
    update(() => ({ ticks: {} }))
    enqueue({ method: 'DELETE', path })
  }, [path, update])

  return { ticks: data.ticks, setTick, clearTicks }
}
