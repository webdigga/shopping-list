import { useState } from 'react'
import { weekInstanceKey } from '@shared/weekState'
import type { ShoppingItem, WeekNumber } from '@shared/planTypes'
import { usePlan } from '@/context/PlanContext'
import { useShoppingTicks, useStock } from '@/hooks/usePlanData'
import { getIngredient, getWeek } from '@/plan/data'
import { formatAmount, formatLongDate, formatShortDate, itemNoun } from '@/plan/format'
import { cycleInstances, defaultShoppingInstance } from '@/plan/schedule'
import { freezeLines, lastsUntil, shoppingSections, stapleBuy } from '@/plan/shopping'
import ui from '@/styles/ui.module.css'
import styles from './Shopping.module.css'

function amountText(item: ShoppingItem): string {
  return item.buy ?? formatAmount(item.totalQty, item.unit, getIngredient(item.ingredient))
}

function haveUnit(item: ShoppingItem): string {
  if (item.unit === 'each') return itemNoun(item.name).many
  if (item.unit === 'clove') return 'cloves'
  return item.unit
}

export function Shopping() {
  const { view, now } = usePlan()
  const base = defaultShoppingInstance(view, now)
  const instances = cycleInstances(base)
  const [selected, setSelected] = useState<WeekNumber>(base.week)
  const instance = instances.find(i => i.week === selected) ?? base
  const { ticks, setTick, clearTicks } = useShoppingTicks(weekInstanceKey(instance.week, instance.start))
  const { stock, setStock } = useStock()
  const sections = shoppingSections(getWeek(instance.week))

  const tickRow = (item: ShoppingItem, details: string[] = [], strike = true) => {
    const ticked = !!ticks[item.ingredient]
    return (
      <li key={item.ingredient}>
        <label className={`${ui.check} ${ticked && strike ? ui.checkDone : ''}`} data-testid={`shop-${item.ingredient}`}>
          <input type="checkbox" checked={ticked} onChange={e => setTick(item.ingredient, e.target.checked)} />
          <span className={ui.checkBody}>
            <span className={ui.checkMain}>
              <strong className={styles.amount}>{amountText(item)}</strong> {item.name}
            </span>
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

      <section className={ui.section} aria-labelledby="fresh">
        <h2 id="fresh" className={ui.sectionTitle}>Fresh</h2>
        {sections.fresh.map(group => (
          <div key={group.aisle} className={ui.section}>
            <h3 className={ui.subTitle}>{group.aisle}</h3>
            <ul className={ui.list}>
              {group.items.map(item =>
                tickRow(item, [
                  `Needs to last until: ${formatShortDate(lastsUntil(item, instance.start))}`,
                  ...freezeLines(item),
                ])
              )}
            </ul>
          </div>
        ))}
      </section>

      {sections.staples.length > 0 && (
        <section className={ui.section} aria-labelledby="staples">
          <h2 id="staples" className={ui.sectionTitle}>Staples</h2>
          <p className={ui.muted}>Enter what you have and the app works out what to buy.</p>
          <ul className={ui.list}>
            {sections.staples.map(item => {
              const have = stock[item.ingredient] ?? 0
              const buy = stapleBuy(item, have)
              const ticked = !!ticks[item.ingredient]
              return (
                <li key={item.ingredient} className={styles.staple} data-testid={`staple-${item.ingredient}`}>
                  <div className={styles.stapleHead}>
                    <span className={ui.checkMain}>{item.name}</span>
                    <span className={styles.detail}>
                      Need {formatAmount(item.totalQty, item.unit, getIngredient(item.ingredient))} this week
                    </span>
                  </div>
                  <label className={styles.have}>
                    <span>I have</span>
                    <StockInput
                      value={stock[item.ingredient] ?? null}
                      onChange={qty => setStock(item.ingredient, qty)}
                    />
                    <span>{haveUnit(item)}</span>
                  </label>
                  {buy.packs > 0 ? (
                    <label className={`${ui.check} ${styles.stapleBuy} ${ticked ? ui.checkDone : ''}`}>
                      <input type="checkbox" checked={ticked} onChange={e => setTick(item.ingredient, e.target.checked)} />
                      <span className={ui.checkMain}>Buy <strong className={styles.amount}>{buy.text}</strong></span>
                    </label>
                  ) : (
                    <p className={styles.enough}>Nothing to buy</p>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {sections.core.length > 0 && (
        <section className={ui.section} aria-labelledby="core">
          <h2 id="core" className={ui.sectionTitle}>Core</h2>
          <ul className={ui.list}>{sections.core.map(item => tickRow(item))}</ul>
        </section>
      )}

      {sections.pantry.length > 0 && (
        <section className={ui.section} aria-labelledby="pantry">
          <h2 id="pantry" className={ui.sectionTitle}>Pantry and freezer</h2>
          <p className={ui.muted}>Check you have these. Tick anything you need to buy.</p>
          <ul className={ui.list}>
            {sections.pantry.map(item => {
              const ticked = !!ticks[item.ingredient]
              return (
                <li key={item.ingredient}>
                  <label className={ui.check} data-testid={`pantry-${item.ingredient}`}>
                    <input type="checkbox" checked={ticked} onChange={e => setTick(item.ingredient, e.target.checked)} />
                    <span className={ui.checkBody}>
                      <span className={ui.checkMain}>{item.name}</span>
                      <span className={styles.detail}>
                        {formatAmount(item.totalQty, item.unit, getIngredient(item.ingredient))} this week
                        {ticked && <strong className={styles.needToBuy}> · Need to buy</strong>}
                      </span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </section>
      )}

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

/** Keeps the typed text locally so partial input like "1." isn't overwritten mid-typing. */
function StockInput({ value, onChange }: { value: number | null; onChange: (qty: number | null) => void }) {
  const [draft, setDraft] = useState(value === null ? '' : String(value))
  const [focused, setFocused] = useState(false)
  const shown = focused ? draft : value === null ? '' : String(value)

  return (
    <input
      className={`${ui.input} ${styles.haveInput}`}
      type="text"
      inputMode="decimal"
      value={shown}
      placeholder="0"
      onFocus={() => {
        setDraft(value === null ? '' : String(value))
        setFocused(true)
      }}
      onBlur={() => setFocused(false)}
      onChange={e => {
        const text = e.target.value.replace(',', '.')
        if (!/^\d*\.?\d*$/.test(text)) return
        setDraft(text)
        if (text === '') onChange(null)
        else if (text !== '.') onChange(Number(text))
      }}
    />
  )
}
