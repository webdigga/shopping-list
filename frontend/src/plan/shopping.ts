import { addDays } from '@shared/weekState'
import type { ShoppingItem, Week } from '@shared/planTypes'
import { dayIndex, getIngredient } from './data'
import { dayName, formatAmount } from './format'

export const AISLES = ['Meat & fish', 'Dairy & eggs', 'Fruit & veg', 'Bread', 'Other'] as const
export type Aisle = (typeof AISLES)[number]

const AISLE_BY_INGREDIENT: Record<string, Aisle> = {}
const assign = (aisle: Aisle, ids: string[]) => ids.forEach(id => (AISLE_BY_INGREDIENT[id] = aisle))
assign('Meat & fish', [
  'beefmince', 'chicken', 'cod', 'salmon', 'smokedsalmon', 'turkeymince', 'thigh',
  'porkloin', 'sirloin', 'trout', 'rump', 'seabass', 'turkeysteak',
])
assign('Dairy & eggs', ['kefir', 'milk', 'skyr', 'cottage', 'feta', 'eggwhite', 'quark'])
assign('Fruit & veg', [
  'broccoli', 'courgette', 'greenbeans', 'lemon', 'lime', 'littlegem', 'orange', 'pepper',
  'sweetpotato', 'apple', 'cucumber', 'coriander', 'mushrooms', 'tomatoes', 'parsley', 'mint',
  'greens', 'springonion',
])
assign('Bread', ['rye'])

export function aisleOf(ingredientId: string): Aisle {
  return AISLE_BY_INGREDIENT[ingredientId] ?? 'Other'
}

/** The date of the last day this item is used, counted from the Friday shop. */
export function lastsUntil(item: ShoppingItem, shopDate: string): string {
  const last = Math.max(...item.usedOnDays.map(dayIndex))
  return addDays(shopDate, last)
}

/** "Freeze on arrival: 250g for Wednesday (defrost Tuesday evening)", one per entry. */
export function freezeLines(item: ShoppingItem): string[] {
  const ingredient = getIngredient(item.ingredient)
  return (item.freezeOnArrival ?? []).map(
    f =>
      `Freeze on arrival: ${formatAmount(f.qty, item.unit, ingredient)} for ${dayName(f.cookDay)} ` +
      `(defrost ${dayName(f.defrostEvening)} evening)`
  )
}

export interface StapleBuy {
  short: number
  packs: number
  text: string
}

/**
 * Staples: buy = need minus have, rounded up to whole packs. When the pack is a different unit
 * from the recipe amount (garlic in cloves, sold by the bulb), one pack covers any shortfall.
 */
export function stapleBuy(item: ShoppingItem, have: number): StapleBuy {
  const short = Math.max(0, item.totalQty - have)
  if (short <= 0) return { short: 0, packs: 0, text: 'Nothing to buy' }

  const ingredient = getIngredient(item.ingredient)

  if (item.unit !== item.packUnit) {
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

export interface ShoppingSections {
  fresh: { aisle: Aisle; items: ShoppingItem[] }[]
  staples: ShoppingItem[]
  core: ShoppingItem[]
  pantry: ShoppingItem[]
}

export function shoppingSections(week: Week): ShoppingSections {
  const fresh = week.shopping.filter(i => i.category === 'fresh' && !i.stockTracked)
  return {
    fresh: AISLES.map(aisle => ({ aisle, items: fresh.filter(i => aisleOf(i.ingredient) === aisle) }))
      .filter(group => group.items.length > 0),
    staples: week.shopping.filter(i => i.stockTracked),
    core: week.shopping.filter(i => i.category === 'core' && !i.stockTracked),
    pantry: week.shopping.filter(i => i.category === 'pantry' || i.category === 'frozen'),
  }
}
