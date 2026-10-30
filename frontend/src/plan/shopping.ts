import { addDays } from '@shared/weekState'
import type { ShoppingItem, Week } from '@shared/planTypes'
import { dayIndex, getIngredient, plan } from './data'
import { formatAmount } from './format'

/** Aisles in walking order, from the plan data. */
export const AISLES = plan.aisleOrder

export function aisleOf(item: ShoppingItem): string {
  return getIngredient(item.ingredient)?.aisle ?? 'Other'
}

function aisleRank(item: ShoppingItem): number {
  return getIngredient(item.ingredient)?.aisleRank ?? 50
}

/** The date this item must last until, counted from the Friday shop. */
export function lastsUntil(item: ShoppingItem, shopDate: string): string {
  return addDays(shopDate, dayIndex(item.lastNeededOn))
}

/** For a raw pack cooked on several days: when it gets opened, as a real date. */
export function openedOn(item: ShoppingItem, shopDate: string): string | null {
  return item.openedPack ? addDays(shopDate, dayIndex(item.openedPack.openedOn)) : null
}

export interface StapleBuy {
  short: number
  packs: number
  text: string
}

/**
 * Stock-tracked staples: buy = need minus have, rounded up to whole packs. When the pack is a
 * different unit from the recipe amount (garlic in cloves, sold by the bulb), one pack covers it.
 */
export function stapleBuy(item: ShoppingItem, have: number): StapleBuy {
  const short = Math.max(0, item.totalQty - have)
  if (short <= 0) return { short: 0, packs: 0, text: 'Nothing to buy' }

  const ingredient = getIngredient(item.ingredient)
  if (item.unit !== item.packUnit || !item.packSize) {
    return { short, packs: 1, text: `1 ${item.packUnit}` }
  }

  const packs = Math.ceil(short / item.packSize - 1e-9)
  if (item.packSize === 1) {
    return { short, packs, text: formatAmount(packs, item.packUnit, ingredient) }
  }
  const pack = item.packUnit === 'g' || item.packUnit === 'ml'
    ? `${item.packSize}${item.packUnit}`
    : formatAmount(item.packSize, item.packUnit, ingredient)
  return { short, packs, text: `${packs} × ${pack}` }
}

/** The week's list grouped by aisle in walking order, sorted by aisle rank then name. Empty aisles are left out. */
export function shoppingAisles(week: Week): { aisle: string; items: ShoppingItem[] }[] {
  const byRank = (a: ShoppingItem, b: ShoppingItem) =>
    aisleRank(a) - aisleRank(b) || a.name.localeCompare(b.name, 'en-GB', { sensitivity: 'base' })
  return [...AISLES, 'Other']
    .map(aisle => ({ aisle, items: week.shopping.filter(i => aisleOf(i) === aisle).sort(byRank) }))
    .filter(group => group.items.length > 0)
}
