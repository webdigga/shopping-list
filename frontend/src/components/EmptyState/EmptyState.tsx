import { ShoppingBag } from 'lucide-react'
import styles from './EmptyState.module.css'

export function EmptyState() {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <ShoppingBag size={48} strokeWidth={1.5} />
      </div>
      <h2 className={styles.title}>Your list is empty</h2>
      <p className={styles.subtitle}>Add items to get started</p>
    </div>
  )
}
