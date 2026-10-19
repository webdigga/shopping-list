import { CalendarDays, Home, Settings, ShoppingBasket } from 'lucide-react'
import type { Route } from '@/hooks/useRoute'
import styles from './TabBar.module.css'

const tabs = [
  { href: '#/today', label: 'Today', icon: Home, match: ['today', 'recipe'] },
  { href: '#/week', label: 'Week', icon: CalendarDays, match: ['week', 'day'] },
  { href: '#/shopping', label: 'Shopping', icon: ShoppingBasket, match: ['shopping'] },
  { href: '#/settings', label: 'Settings', icon: Settings, match: ['settings'] },
]

export function TabBar({ route }: { route: Route }) {
  return (
    <nav className={styles.bar} aria-label="Main">
      {tabs.map(({ href, label, icon: Icon, match }) => {
        const active = match.includes(route.name)
        return (
          <a key={href} href={href} className={`${styles.tab} ${active ? styles.active : ''}`} aria-current={active ? 'page' : undefined}>
            <Icon size={24} aria-hidden />
            <span>{label}</span>
          </a>
        )
      })}
    </nav>
  )
}
