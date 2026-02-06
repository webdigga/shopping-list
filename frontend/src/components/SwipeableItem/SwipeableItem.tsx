import { Check, Trash2, RotateCcw } from 'lucide-react'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import type { Item } from '@/types'
import styles from './SwipeableItem.module.css'

interface SwipeableItemProps {
  item: Item
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function SwipeableItem({ item, onToggle, onDelete }: SwipeableItemProps) {
  const { ref, handlers } = useSwipeGesture({
    threshold: 0.3,
    onSwipeRight: () => onToggle(item.id),
    onSwipeLeft: () => onToggle(item.id)
  })

  const handleDelete = () => {
    if (window.confirm(`Delete "${item.name}"?`)) {
      onDelete(item.id)
    }
  }

  return (
    <div className={styles.wrapper}>
      {/* Background actions revealed on swipe */}
      <div className={styles.actionsLeft}>
        {item.completed ? (
          <RotateCcw size={20} />
        ) : (
          <Check size={20} />
        )}
        <span>{item.completed ? 'Undo' : 'Done'}</span>
      </div>
      <div className={`${styles.actionsRight} ${styles.actionsToggle}`}>
        {item.completed ? (
          <RotateCcw size={20} />
        ) : (
          <Check size={20} />
        )}
        <span>{item.completed ? 'Undo' : 'Done'}</span>
      </div>

      {/* Main item content */}
      <div
        ref={ref}
        className={`${styles.item} ${item.completed ? styles.completed : ''}`}
        {...handlers}
      >
        <button
          className={styles.checkbox}
          onClick={() => onToggle(item.id)}
          aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {item.completed && <Check size={16} strokeWidth={3} />}
        </button>

        <span className={styles.name}>{item.name}</span>

        <button
          className={styles.deleteButton}
          onClick={handleDelete}
          aria-label="Delete item"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )
}
