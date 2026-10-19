import { ChevronRight } from 'lucide-react'
import { addDays, isWeekNumber } from '@shared/weekState'
import type { WeekNumber } from '@shared/planTypes'
import { usePlan } from '@/context/PlanContext'
import { getWeek } from '@/plan/data'
import { formatShortDate } from '@/plan/format'
import { currentWeekStart } from '@/plan/schedule'
import ui from '@/styles/ui.module.css'
import styles from './WeekScreen.module.css'

export function WeekScreen({ week: requested }: { week: number | null }) {
  const { view } = usePlan()
  const running = currentWeekStart(view)
  const week: WeekNumber = isWeekNumber(requested) ? requested : running?.week ?? 1
  const dated = running?.week === week ? running.start : null
  const plan = getWeek(week)

  return (
    <main className={ui.page}>
      <h1 className={ui.pageTitle}>Week {week}</h1>

      <div className={styles.picker} role="tablist" aria-label="Choose a week to view">
        {([1, 2, 3] as WeekNumber[]).map(w => (
          <a
            key={w}
            href={`#/week/${w}`}
            role="tab"
            aria-selected={w === week}
            className={`${styles.pick} ${w === week ? styles.picked : ''}`}
          >
            Week {w}
          </a>
        ))}
      </div>

      {!dated && <p className={ui.muted}>Browsing only. This doesn't change which week you're on.</p>}

      <ol className={ui.list}>
        {plan.days.map((day, i) => {
          const date = dated ? addDays(dated, i) : null
          const isToday = date === view.today
          return (
            <li key={day.day}>
              <a href={`#/week/${week}/${day.day}`} className={`${styles.day} ${isToday ? styles.today : ''}`}>
                <span className={styles.dayHead}>
                  <span className={styles.dayName}>
                    {day.dayName}
                    {isToday && <span className={styles.badge}>today</span>}
                  </span>
                  {date && <span className={ui.muted}>{formatShortDate(date)}</span>}
                </span>
                <span className={styles.dayInfo}>{day.training.label}</span>
                <span className={ui.muted}>
                  {day.totals.protein}g protein · {day.totals.kcal} kcal
                </span>
                <ChevronRight size={20} className={styles.chevron} aria-hidden />
              </a>
            </li>
          )
        })}
      </ol>
    </main>
  )
}
