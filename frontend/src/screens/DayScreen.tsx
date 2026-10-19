import { ChevronLeft } from 'lucide-react'
import { addDays, isWeekNumber } from '@shared/weekState'
import { usePlan } from '@/context/PlanContext'
import { dayIndex, getWeek, plan } from '@/plan/data'
import { formatShortDate } from '@/plan/format'
import { currentWeekStart } from '@/plan/schedule'
import { DayPlan } from '@/components/DayPlan/DayPlan'
import ui from '@/styles/ui.module.css'
import type { DayKey } from '@shared/planTypes'

export function DayScreen({ week, day }: { week: number; day: string }) {
  const { view } = usePlan()
  const running = currentWeekStart(view)

  if (!isWeekNumber(week) || !plan.dayOrder.includes(day as DayKey)) {
    return (
      <main className={ui.page}>
        <a href="#/week" className={ui.backLink}><ChevronLeft size={20} aria-hidden />Week</a>
        <p>That day isn't in the plan.</p>
      </main>
    )
  }

  const index = dayIndex(day as DayKey)
  const entry = getWeek(week).days[index]
  const date = running?.week === week ? addDays(running.start, index) : null

  return (
    <main className={ui.page}>
      <a href={`#/week/${week}`} className={ui.backLink}><ChevronLeft size={20} aria-hidden />Week {week}</a>
      <h1 className={ui.pageTitle}>
        {entry.dayName}, Week {week}
        {date && <span className={ui.lede}> · {formatShortDate(date)}</span>}
      </h1>
      <DayPlan day={entry} />
    </main>
  )
}
