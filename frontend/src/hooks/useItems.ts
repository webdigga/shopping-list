import { useState, useEffect, useCallback } from 'react'
import type { Item } from '@/types'
import * as sync from '@/services/syncManager'

interface UseItemsReturn {
  items: Item[]
  loading: boolean
  error: string | null
  isOffline: boolean
  addItem: (name: string) => Promise<void>
  toggleItem: (id: string) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useItems(): UseItemsReturn {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  // Initialize sync manager and fetch items
  useEffect(() => {
    sync.initSyncManager()

    const unsubscribe = sync.onStatusChange(() => {
      setIsOffline(!sync.getOnlineStatus())
    })

    fetchItems()

    return () => {
      unsubscribe()
    }
  }, [])

  const fetchItems = async () => {
    setLoading(true)
    setError(null)

    try {
      const { items: fetchedItems } = await sync.fetchItemsWithFallback()
      setItems(fetchedItems)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  const addItem = useCallback(async (name: string) => {
    if (!name.trim()) return

    try {
      const newItem = await sync.createItemOfflineFirst(name.trim())
      setItems(prev => [newItem, ...prev.filter(i => i.id !== newItem.id)])
    } catch (err) {
      setError(String(err))
    }
  }, [])

  const toggleItem = useCallback(async (id: string) => {
    const item = items.find(i => i.id === id)
    if (!item) return

    try {
      const updated = await sync.updateItemOfflineFirst(id, { completed: !item.completed })
      if (updated) {
        setItems(prev =>
          prev.map(i => (i.id === id ? updated : i)).sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1
            return a.position - b.position
          })
        )
      }
    } catch (err) {
      setError(String(err))
    }
  }, [items])

  const deleteItem = useCallback(async (id: string) => {
    try {
      await sync.deleteItemOfflineFirst(id)
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      setError(String(err))
    }
  }, [])

  const refresh = useCallback(async () => {
    await fetchItems()
  }, [])

  return {
    items,
    loading,
    error,
    isOffline,
    addItem,
    toggleItem,
    deleteItem,
    refresh
  }
}
