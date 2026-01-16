import * as api from './api'
import * as db from './db'
import type { Item, OfflineChange } from '@/types'
import { mapApiItem } from '@/types'

let isOnline = navigator.onLine
let syncInProgress = false
let listeners: Set<() => void> = new Set()

// Track online status
export function initSyncManager() {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
}

function handleOnline() {
  isOnline = true
  notifyListeners()
  // Attempt sync when coming online
  syncPendingChanges()
}

function handleOffline() {
  isOnline = false
  notifyListeners()
}

export function getOnlineStatus(): boolean {
  return isOnline
}

export function onStatusChange(callback: () => void): () => void {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function notifyListeners() {
  listeners.forEach(cb => cb())
}

// Queue a change for offline sync
export async function queueOfflineChange(change: Omit<OfflineChange, 'id'>): Promise<void> {
  const offlineChange: OfflineChange = {
    ...change,
    id: crypto.randomUUID()
  }
  await db.queueChange(offlineChange)
}

// Sync pending changes with server
export async function syncPendingChanges(): Promise<{ success: boolean; error?: string }> {
  if (!isOnline || syncInProgress) {
    return { success: false, error: 'Offline or sync in progress' }
  }

  syncInProgress = true

  try {
    const changes = await db.getQueuedChanges()

    if (changes.length === 0) {
      return { success: true }
    }

    const result = await api.syncChanges(changes)

    // Update local DB with server state
    await db.clearItems()
    const items = result.items.map(mapApiItem)
    await db.saveItems(items)

    // Clear synced changes
    await db.clearQueuedChanges()
    await db.setLastSyncTime(result.syncTimestamp)

    return { success: true }
  } catch (error) {
    console.error('Sync failed:', error)
    return { success: false, error: String(error) }
  } finally {
    syncInProgress = false
  }
}

// Fetch items - tries online first, falls back to local
export async function fetchItemsWithFallback(): Promise<{ items: Item[]; fromCache: boolean }> {
  if (isOnline) {
    try {
      const result = await api.fetchItems()
      const items = result.items.map(mapApiItem)

      // Update local cache
      await db.clearItems()
      await db.saveItems(items)

      return { items, fromCache: false }
    } catch (error) {
      console.error('Failed to fetch from server, using cache:', error)
    }
  }

  // Fallback to local DB
  const items = await db.getAllItems()
  return { items, fromCache: true }
}

// Create item - saves locally and queues for sync if offline
export async function createItemOfflineFirst(name: string): Promise<Item> {
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  const item: Item = {
    id,
    name,
    completed: false,
    position: Date.now(), // Use timestamp for position
    created_at: now,
    updated_at: now
  }

  // Save locally first
  await db.saveItem(item)

  if (isOnline) {
    try {
      const result = await api.createItem(name, id)
      const serverItem = mapApiItem(result.item)
      await db.saveItem(serverItem)
      return serverItem
    } catch (error) {
      console.error('Failed to create on server, queuing:', error)
      await queueOfflineChange({
        action: 'create',
        item: { id, name, completed: false },
        clientTimestamp: now
      })
    }
  } else {
    await queueOfflineChange({
      action: 'create',
      item: { id, name, completed: false },
      clientTimestamp: now
    })
  }

  return item
}

// Update item - saves locally and queues for sync if offline
export async function updateItemOfflineFirst(
  id: string,
  updates: Partial<Pick<Item, 'name' | 'completed' | 'position'>>
): Promise<Item | null> {
  const existing = await db.getItem(id)
  if (!existing) return null

  const now = new Date().toISOString()
  const updated: Item = {
    ...existing,
    ...updates,
    updated_at: now
  }

  // Save locally first
  await db.saveItem(updated)

  if (isOnline) {
    try {
      const result = await api.updateItem(id, updates)
      const serverItem = mapApiItem(result.item)
      await db.saveItem(serverItem)
      return serverItem
    } catch (error) {
      console.error('Failed to update on server, queuing:', error)
      await queueOfflineChange({
        action: 'update',
        itemId: id,
        item: updates,
        clientTimestamp: now
      })
    }
  } else {
    await queueOfflineChange({
      action: 'update',
      itemId: id,
      item: updates,
      clientTimestamp: now
    })
  }

  return updated
}

// Delete item - removes locally and queues for sync if offline
export async function deleteItemOfflineFirst(id: string): Promise<boolean> {
  const now = new Date().toISOString()

  // Remove locally first
  await db.removeItem(id)

  if (isOnline) {
    try {
      await api.deleteItem(id)
      return true
    } catch (error) {
      console.error('Failed to delete on server, queuing:', error)
      await queueOfflineChange({
        action: 'delete',
        itemId: id,
        clientTimestamp: now
      })
    }
  } else {
    await queueOfflineChange({
      action: 'delete',
      itemId: id,
      clientTimestamp: now
    })
  }

  return true
}
