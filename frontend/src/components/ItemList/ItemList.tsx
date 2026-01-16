import { SwipeableItem } from '@/components/SwipeableItem/SwipeableItem'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import type { Item } from '@/types'
import styles from './ItemList.module.css'

interface ItemListProps {
  items: Item[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function ItemList({ items, onToggle, onDelete }: ItemListProps) {
  const incompleteItems = items.filter(item => !item.completed)
  const completedItems = items.filter(item => item.completed)

  if (items.length === 0) {
    return <EmptyState />
  }

  return (
    <div className={styles.container}>
      {incompleteItems.length > 0 && (
        <section className={styles.section}>
          <ul className={styles.list}>
            {incompleteItems.map(item => (
              <li key={item.id} className={styles.listItem}>
                <SwipeableItem
                  item={item}
                  onToggle={onToggle}
                  onDelete={onDelete}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {completedItems.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Completed ({completedItems.length})
          </h2>
          <ul className={styles.list}>
            {completedItems.map(item => (
              <li key={item.id} className={styles.listItem}>
                <SwipeableItem
                  item={item}
                  onToggle={onToggle}
                  onDelete={onDelete}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
