import { WifiOff } from 'lucide-react'
import styles from './OfflineIndicator.module.css'

interface OfflineIndicatorProps {
  isOffline: boolean
}

export function OfflineIndicator({ isOffline }: OfflineIndicatorProps) {
  if (!isOffline) return null

  return (
    <div className={styles.indicator}>
      <WifiOff size={14} />
      <span>Offline: ticks will sync when you're back online</span>
    </div>
  )
}
