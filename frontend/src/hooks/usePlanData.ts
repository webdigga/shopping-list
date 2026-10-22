// Shopping ticks and everyday extras: persisted in D1, updated optimistically, queued offline.
import { useCallback } from 'react'
import { extrasPath, ticksPath } from '@/services/api'
import { enqueue } from '@/services/sync'
import { useRemote } from './useRemote'
import { sortExtras, type ExtraItem } from '@/plan/extras'

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

export function useExtras() {
  const path = extrasPath()
  const [data, update] = useRemote<{ items: ExtraItem[] }>(path, { items: [] })

  // The app picks the id, so a new item can be queued while offline like any other write.
  const saveExtra = useCallback((item: ExtraItem) => {
    update(d => ({ items: sortExtras([...d.items.filter(i => i.id !== item.id), item]) }))
    enqueue({ method: 'PUT', path: `${path}/${item.id}`, body: { name: item.name } })
  }, [path, update])

  const deleteExtra = useCallback((id: string) => {
    update(d => ({ items: d.items.filter(i => i.id !== id) }))
    enqueue({ method: 'DELETE', path: `${path}/${id}` })
  }, [path, update])

  return { extras: sortExtras(data.items), saveExtra, deleteExtra }
}
