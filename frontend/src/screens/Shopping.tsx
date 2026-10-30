import { Fragment, useState } from 'react'
import { weekInstanceKey } from '@shared/weekState'
import type { ShoppingItem, WeekNumber } from '@shared/planTypes'
import { usePlan } from '@/context/PlanContext'
import { useShoppingTicks, useStock } from '@/hooks/usePlanData'
import { getIngredient, getWeek } from '@/plan/data'
import { formatAmount, formatLongDate, formatShortDate, itemNoun } from '@/plan/format'
import { cycleInstances, defaultShoppingInstance } from '@/plan/schedule'
import { lastsUntil, shoppingAisles, stapleBuy } from '@/plan/shopping'
import { Extras } from '@/components/Extras/Extras'
import ui from '@/styles/ui.module.css'
import styles from './Shopping.module.css'

function weekNeed(item: ShoppingItem): string {
  return formatAmount(item.totalQty, item.unit, getIngredient(item.ingredient))
}

function haveUnit(item: ShoppingItem): string {
  if (item.unit === 'each') return itemNoun(item.name).many
  if (item.unit === 'clove') return 'cloves'
  if (item.unit === 'slice') return 'slices'
  return item.unit
}

/** Small lines under an item: how long fresh food must last, or how long an opened pack is in use. */
function detailLines(item: ShoppingItem, shopDate: string): string[] {
  if (item.openedPack) return [item.openedPack.note]
  if (item.category === 'fresh') return [`Needs to last until: ${formatShortDate(lastsUntil(item, shopDate))}`]
  return []
}

export function Shopping() {
  const { view, now } = usePlan()
  const base = defaultShoppingInstance(view, now)
  const instances = cycleInstances(base)
  const [selected, setSelected] = useState<WeekNumber>(base.week)
  const instance = instances.find(i => i.week === selected) ?? base
  const { ticks, setTick, clearTicks } = useShoppingTicks(weekInstanceKey(instance.week, instance.start))
  const { stock, setStock } = useStock()
  const aisles = shoppingAisles(getWeek(instance.week))
  // Household and extras close the Lidl shop, before the separate Sainsbury's section.
  const extrasAfter = aisles.findIndex(g => g.aisle === "Sainsbury's") - 1
  const extras = <Extras ticks={ticks} onTick={setTick} />

  // Every tick means the same thing: bought. The buy text is shown exactly as the plan gives it.
  const row = (item: ShoppingItem) => {
    const ticked = !!ticks[item.ingredient]
    const amount = item.buy ?? `${weekNeed(item)} this week`
    const buy = item.stockTracked ? stapleBuy(item, stock[item.ingredient] ?? 0) : null
    return (
      <li key={item.ingredient} className={item.stockTracked ? styles.staple : undefined}>
        <label className={`${ui.check} ${ticked ? ui.checkDone : ''}`} data-testid={`shop-${item.ingredient}`}>
          <input type="checkbox" checked={ticked} onChange={e => setTick(item.ingredient, e.target.checked)} />
          <span className={ui.checkBody}>
            <span className={ui.checkMain}>{item.name}</span>
            <strong className={styles.amount}>{amount}</strong>
            {detailLines(item, instance.start).map(line => (
              <span key={line} className={styles.detail}>{line}</span>
            ))}
          </span>
        </label>
        {buy && (
          <div className={styles.stock} data-testid={`stock-${item.ingredient}`}>
            <span className={styles.detail}>Need {weekNeed(item)} this week</span>
            <label className={styles.have}>
              <span>I have</span>
              <StockInput value={stock[item.ingredient] ?? null} onChange={qty => setStock(item.ingredient, qty)} />
              <span>{haveUnit(item)}</span>
            </label>
            <span className={buy.packs > 0 ? styles.buyLine : styles.enough}>
              {buy.packs > 0 ? <>Buy <strong>{buy.text}</strong></> : buy.text}
            </span>
          </div>
        )}
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

      {aisles.map(({ aisle, items }, index) => (
        <Fragment key={aisle}>
          <section className={ui.section} aria-label={aisle}>
            <h2 className={ui.sectionTitle}>{aisle}</h2>
            {aisle === 'Cupboard' && <p className={ui.muted}>You may already have some of these at home.</p>}
            <ul className={ui.list}>{items.map(row)}</ul>
          </section>
          {index === extrasAfter && extras}
        </Fragment>
      ))}
      {extrasAfter < 0 && extras}

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
      aria-label="How many you have"
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
