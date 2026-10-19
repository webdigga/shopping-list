import { useState } from 'react'
import { weekInstanceKey } from '@shared/weekState'
import type { ShoppingItem, WeekNumber } from '@shared/planTypes'
import { usePlan } from '@/context/PlanContext'
import { useShoppingTicks } from '@/hooks/usePlanData'
import { getIngredient, getWeek } from '@/plan/data'
import { formatAmount, formatLongDate, formatShortDate } from '@/plan/format'
import { cycleInstances, defaultShoppingInstance } from '@/plan/schedule'
import { freezeLines, lastsUntil, shoppingAisles } from '@/plan/shopping'
import ui from '@/styles/ui.module.css'
import styles from './Shopping.module.css'

function weekAmount(item: ShoppingItem): string {
  return `${formatAmount(item.totalQty, item.unit, getIngredient(item.ingredient))} this week`
}

export function Shopping() {
  const { view, now } = usePlan()
  const base = defaultShoppingInstance(view, now)
  const instances = cycleInstances(base)
  const [selected, setSelected] = useState<WeekNumber>(base.week)
  const instance = instances.find(i => i.week === selected) ?? base
  const { ticks, setTick, clearTicks } = useShoppingTicks(weekInstanceKey(instance.week, instance.start))
  const aisles = shoppingAisles(getWeek(instance.week))

  // Every tick means the same thing: bought.
  const tickRow = (item: ShoppingItem, amount: string, details: string[] = []) => {
    const ticked = !!ticks[item.ingredient]
    return (
      <li key={item.ingredient}>
        <label className={`${ui.check} ${ticked ? ui.checkDone : ''}`} data-testid={`shop-${item.ingredient}`}>
          <input type="checkbox" checked={ticked} onChange={e => setTick(item.ingredient, e.target.checked)} />
          <span className={ui.checkBody}>
            <span className={ui.checkMain}>{item.name}</span>
            <strong className={styles.amount}>{amount}</strong>
            {details.map(line => (
              <span key={line} className={styles.detail}>{line}</span>
            ))}
          </span>
        </label>
      </li>
    )
  }

  return (
    <main className={ui.page}>
      <header>
        <h1 className={ui.pageTitle}>Shopping, Week {instance.week}</h1>
        <p className={ui.lede}>Shop on {formatLongDate(instance.start)}</p>
      </header>

      <div className={styles.picker} role="tablist" aria-label="Choose a week's list">
        {instances.map(i => (
          <button
            key={i.week}
            role="tab"
            aria-selected={i.week === instance.week}
            className={`${styles.pick} ${i.week === instance.week ? styles.picked : ''}`}
            onClick={() => setSelected(i.week)}
          >
            <span>Week {i.week}</span>
            <span className={styles.pickDate}>{formatShortDate(i.start)}</span>
          </button>
        ))}
      </div>

      {aisles.map(({ aisle, items }) => (
        <section key={aisle} className={ui.section} aria-label={aisle}>
          <h2 className={ui.sectionTitle}>{aisle}</h2>
          {(aisle === 'Cupboard' || aisle === 'Frozen') && (
            <p className={ui.muted}>You may already have some of these at home.</p>
          )}
          <ul className={ui.list}>
            {items.map(item =>
              tickRow(
                item,
                item.buy ?? weekAmount(item),
                item.category === 'fresh'
                  ? [`Needs to last until: ${formatShortDate(lastsUntil(item, instance.start))}`, ...freezeLines(item)]
                  : []
              )
            )}
          </ul>
        </section>
      ))}

      <button
        className={`${ui.buttonSecondary} ${ui.buttonBlock}`}
        onClick={() => {
          if (window.confirm(`Clear all ticks for the Week ${instance.week} list?`)) clearTicks()
        }}
      >
        Clear ticks
      </button>
    </main>
  )
}
