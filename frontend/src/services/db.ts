import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Item, OfflineChange } from '@/types'

interface ShoppingListDB extends DBSchema {
  items: {
    key: string
    value: Item
    indexes: { 'by-completed': number; 'by-position': number }
  }
  offlineChanges: {
    key: string
    value: OfflineChange
    indexes: { 'by-timestamp': string }
  }
  meta: {
    key: string
    value: string
  }
}

let dbInstance: IDBPDatabase<ShoppingListDB> | null = null

export async function getDB(): Promise<IDBPDatabase<ShoppingListDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<ShoppingListDB>('shopping-list', 1, {
    upgrade(db) {
      // Items store
      const itemStore = db.createObjectStore('items', { keyPath: 'id' })
      itemStore.createIndex('by-completed', 'completed')
      itemStore.createIndex('by-position', 'position')

      // Offline changes queue
      const changeStore = db.createObjectStore('offlineChanges', { keyPath: 'id' })
      changeStore.createIndex('by-timestamp', 'clientTimestamp')

      // Metadata (e.g., last sync timestamp)
      db.createObjectStore('meta')
    }
  })

  return dbInstance
}

// Items operations
export async function getAllItems(): Promise<Item[]> {
  const db = await getDB()
  const items = await db.getAll('items')
  return items.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    return a.position - b.position
  })
}

export async function getItem(id: string): Promise<Item | undefined> {
  const db = await getDB()
  return db.get('items', id)
}

export async function saveItem(item: Item): Promise<void> {
  const db = await getDB()
  await db.put('items', item)
}

export async function saveItems(items: Item[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('items', 'readwrite')
  await Promise.all([
    ...items.map(item => tx.store.put(item)),
    tx.done
  ])
}

export async function removeItem(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('items', id)
}

export async function clearItems(): Promise<void> {
  const db = await getDB()
  await db.clear('items')
}

// Offline changes operations
export async function queueChange(change: OfflineChange): Promise<void> {
  const db = await getDB()
  await db.put('offlineChanges', change)
}

export async function getQueuedChanges(): Promise<OfflineChange[]> {
  const db = await getDB()
  return db.getAllFromIndex('offlineChanges', 'by-timestamp')
}

export async function clearQueuedChanges(): Promise<void> {
  const db = await getDB()
  await db.clear('offlineChanges')
}

export async function removeQueuedChange(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('offlineChanges', id)
}

// Metadata operations
export async function getLastSyncTime(): Promise<string | undefined> {
  const db = await getDB()
  return db.get('meta', 'lastSync')
}

export async function setLastSyncTime(timestamp: string): Promise<void> {
  const db = await getDB()
  await db.put('meta', timestamp, 'lastSync')
}
