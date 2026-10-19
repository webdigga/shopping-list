import { useState } from 'react'
import { ShoppingBasket } from 'lucide-react'
import { addDays, weekday } from '@shared/weekState'
import { usePlan } from '@/context/PlanContext'
import { useTaskTicks } from '@/hooks/usePlanData'
import { getWeek } from '@/plan/data'
import { formatLongDate, formatShortDate } from '@/plan/format'
import { currentWeekStart, defaultShoppingInstance, showShoppingPrompt } from '@/plan/schedule'
import { DayPlan } from '@/components/DayPlan/DayPlan'
import { WeekForm } from '@/components/WeekForm/WeekForm'
import ui from '@/styles/ui.module.css'

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function Today() {
  const { view, now, initialised, error, setWeek } = usePlan()
  const [picking, setPicking] = useState(false)
  const running = currentWeekStart(view)
  const from = running?.start ?? view.today
  const { tasks, setTask } = useTaskTicks(from, addDays(from, 6))

  const shopping = defaultShoppingInstance(view, now)
  const shoppingButton = showShoppingPrompt(view, now) && (
    <a href="#/shopping" className={`${ui.button} ${ui.buttonBlock}`} data-testid="shopping-prompt">
      <ShoppingBasket size={20} aria-hidden />
      Shopping: Week {shopping.week} list
    </a>
  )

  const greeting =
    view.mode === 'active'
      ? `Welcome, David. It's ${WEEKDAYS[weekday(view.today)]}, Week ${view.state.currentWeek}, day ${view.dayNumber}.`
      : `Welcome, David. It's ${WEEKDAYS[weekday(view.today)]}.`

  return (
    <main className={ui.page}>
      <h1 className={ui.pageTitle} data-testid="greeting">{greeting}</h1>

      {error && <p className={ui.error} role="alert">{error}</p>}

      {view.mode === 'setup' && initialised === null && <p className={ui.lede}>Loading your week…</p>}

      {view.mode === 'setup' && initialised === false && (
        <section className={`${ui.card} ${ui.section}`}>
          <h2 className={ui.bannerTitle}>Which week are you on?</h2>
          <p className={ui.muted}>Pick the week and the Friday it starts. The app moves on by itself after each Thursday.</p>
          <WeekForm today={view.today} defaultWeek={1} submitLabel="Start plan" onSubmit={setWeek} />
        </section>
      )}

      {view.mode === 'away' && (
        <section className={ui.banner} data-testid="away-prompt">
          <p className={ui.bannerTitle}>
            Looks like you've been away. Carry on with Week {view.away.suggestedWeek} from this Friday, or pick a week?
          </p>
          {picking ? (
            <WeekForm
              today={view.today}
              defaultWeek={view.away.suggestedWeek}
              defaultStart={view.away.suggestedStart}
              submitLabel="Start"
              onSubmit={setWeek}
              onCancel={() => setPicking(false)}
            />
          ) : (
            <div className={ui.buttonRow}>
              <button className={ui.button} onClick={() => setWeek(view.away.suggestedWeek, view.away.suggestedStart)}>
                Week {view.away.suggestedWeek} from {formatShortDate(view.away.suggestedStart)}
              </button>
              <button className={ui.buttonSecondary} onClick={() => setPicking(true)}>Pick a week</button>
            </div>
          )}
        </section>
      )}

      {view.mode === 'paused' && (
        <section className={ui.banner} data-testid="paused-banner">
          <p className={ui.bannerTitle}>Plan paused</p>
          <p>
            Paused on Week {view.state.currentWeek}
            {view.state.pausedOn ? `, ${formatLongDate(view.state.pausedOn)}` : ''}.
          </p>
          {picking ? (
            <WeekForm
              today={view.today}
              defaultWeek={view.state.currentWeek}
              submitLabel="Resume"
              onSubmit={setWeek}
              onCancel={() => setPicking(false)}
            />
          ) : (
            <div className={ui.buttonRow}>
              <button className={ui.button} onClick={() => setPicking(true)}>Resume</button>
            </div>
          )}
        </section>
      )}

      {view.mode === 'upcoming' && (
        <>
          <p className={ui.lede}>
            Week {view.state.currentWeek} starts on {formatLongDate(view.state.weekStartDate)}.
          </p>
          {shoppingButton}
        </>
      )}

      {view.mode === 'active' && (
        <>
          {shoppingButton}
          <DayPlan
            day={getWeek(view.state.currentWeek).days[view.dayNumber - 1]}
            prepTitle="Prep today and tonight"
            prepTicks={{
              done: tasks[view.today] ?? {},
              onToggle: (key, done) => setTask(view.today, key, done),
            }}
          />
        </>
      )}
    </main>
  )
}
