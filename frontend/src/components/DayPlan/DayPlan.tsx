import { ChevronRight, Dumbbell } from 'lucide-react'
import type { Day } from '@shared/planTypes'
import { getRecipe, plan } from '@/plan/data'
import { slotLabel } from '@/plan/format'
import { taskKey } from '@/plan/taskKey'
import ui from '@/styles/ui.module.css'
import styles from './DayPlan.module.css'

interface PrepTicks {
  done: Record<string, true>
  onToggle: (key: string, done: boolean) => void
}

interface DayPlanProps {
  day: Day
  /** Pass ticks for a dated day; leave out when browsing another week read-only. */
  prepTicks?: PrepTicks
  prepTitle?: string
}

export function DayPlan({ day, prepTicks, prepTitle = 'Prep' }: DayPlanProps) {
  return (
    <>
      <section className={`${ui.card} ${styles.training}`} data-testid="training">
        <Dumbbell size={22} aria-hidden />
        <div>
          <p className={ui.sectionTitle}>Training</p>
          <p className={styles.trainingLabel}>{day.training.label}</p>
        </div>
      </section>

      {day.note && <p className={styles.note}>{day.note}</p>}

      <section className={ui.section} aria-labelledby={`meals-${day.day}`}>
        <h2 id={`meals-${day.day}`} className={ui.sectionTitle}>Meals</h2>
        <ol className={styles.timeline}>
          {day.meals.map((meal, i) => {
            const recipe = meal.recipe ? getRecipe(meal.recipe) : undefined
            const body = (
              <>
                <span className={styles.time}>{meal.time}</span>
                <span className={styles.mealBody}>
                  <span className={styles.slot}>{slotLabel(meal.slot)}</span>
                  {recipe ? (
                    <>
                      <span className={styles.mealName}>{recipe.name}</span>
                      <span className={styles.macros}>
                        {recipe.macros.protein}g protein · {recipe.macros.carbs}g carbs · {recipe.macros.kcal} kcal
                      </span>
                    </>
                  ) : (
                    <span className={styles.mealName}>Free: try to include some protein</span>
                  )}
                </span>
              </>
            )
            return (
              <li key={i}>
                {recipe ? (
                  <a className={styles.meal} href={`#/recipe/${recipe.id}`}>
                    {body}
                    <ChevronRight size={20} className={styles.chevron} aria-hidden />
                  </a>
                ) : (
                  <div className={`${styles.meal} ${styles.free}`}>{body}</div>
                )}
              </li>
            )
          })}
        </ol>
      </section>

      {day.prep.length > 0 && (
        <section className={ui.section} aria-labelledby={`prep-${day.day}`}>
          <h2 id={`prep-${day.day}`} className={ui.sectionTitle}>{prepTitle}</h2>
          <ul className={ui.list}>
            {day.prep.map(task => {
              const key = taskKey(task)
              if (!prepTicks) {
                return <li key={key} className={`${ui.check} ${styles.prepStatic}`}>{task}</li>
              }
              const done = !!prepTicks.done[key]
              return (
                <li key={key}>
                  <label className={`${ui.check} ${done ? ui.checkDone : ''}`}>
                    <input type="checkbox" checked={done} onChange={e => prepTicks.onToggle(key, e.target.checked)} />
                    <span className={ui.checkBody}><span className={ui.checkMain}>{task}</span></span>
                  </label>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <DayTotals day={day} />
    </>
  )
}

function DayTotals({ day }: { day: Day }) {
  const { targets } = plan.meta
  const carbTarget = targets.carbs[day.training.carbTarget]
  const rows = [
    { label: 'Protein', value: day.totals.protein, target: targets.protein, unit: 'g' },
    { label: `Carbs (${day.training.carbTarget} day)`, value: day.totals.carbs, target: carbTarget, unit: 'g' },
    { label: 'Fat', value: day.totals.fat, target: targets.fat, unit: 'g' },
    { label: 'Calories', value: day.totals.kcal, target: targets.kcal, unit: ' kcal' },
  ]
  return (
    <section className={ui.section} aria-labelledby={`totals-${day.day}`}>
      <h2 id={`totals-${day.day}`} className={ui.sectionTitle}>Day totals</h2>
      <div className={`${ui.card} ${styles.totals}`}>
        {rows.map(row => (
          <div key={row.label} className={styles.total}>
            <div className={styles.totalHead}>
              <span>{row.label}</span>
              <span className={styles.totalValue}>
                {row.value}{row.unit} <span className={ui.muted}>/ {row.target}{row.unit}</span>
              </span>
            </div>
            <div className={styles.bar} role="presentation">
              <div className={styles.barFill} style={{ width: `${Math.min(100, (row.value / row.target) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
