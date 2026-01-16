export interface Item {
  id: string
  name: string
  completed: boolean
  position: number
  created_at: string
  updated_at: string
}

export interface ApiItem {
  id: string
  name: string
  completed: number
  position: number
  created_at: string
  updated_at: string
}

export function mapApiItem(item: ApiItem): Item {
  return {
    ...item,
    completed: item.completed === 1
  }
}

export interface SyncChange {
  action: 'create' | 'update' | 'delete'
  item?: Partial<Item>
  itemId?: string
  clientTimestamp: string
}

export interface OfflineChange extends SyncChange {
  id: string
}
