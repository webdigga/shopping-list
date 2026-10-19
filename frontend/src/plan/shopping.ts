import { addDays } from '@shared/weekState'
import type { ShoppingItem, Week } from '@shared/planTypes'
import { dayIndex, getIngredient } from './data'
import { dayName, formatAmount } from './format'

/** In walking order for a typical Lidl (produce at the door, frozen by the tills), then the Sainsbury's shop. */
export const AISLES = ['Fruit & veg', 'Bakery', 'Meat & fish', 'Dairy & eggs', 'Cupboard', 'Frozen', "Sainsbury's", 'Other'] as const
export type Aisle = (typeof AISLES)[number]

const AISLE_BY_INGREDIENT: Record<string, Aisle> = {}
const assign = (aisle: Aisle, ids: string[]) => ids.forEach(id => (AISLE_BY_INGREDIENT[id] = aisle))
assign('Fruit & veg', [
  'broccoli', 'courgette', 'greenbeans', 'lemon', 'lime', 'littlegem', 'orange', 'pepper',
  'sweetpotato', 'apple', 'cucumber', 'coriander', 'mushrooms', 'tomatoes', 'parsley', 'mint',
  'greens', 'springonion',
  'potatoes', 'banana', 'carrots', 'ginger', 'garlic', 'onion', 'redonion',
])
// Sourdough is bought fresh and frozen at home, so it is found in the bakery.
assign('Bakery', ['rye', 'sourdough'])
assign('Meat & fish', [
  'beefmince', 'chicken', 'cod', 'salmon', 'smokedsalmon', 'turkeymince', 'thigh',
  'porkloin', 'sirloin', 'trout', 'rump', 'seabass', 'turkeysteak',
])
assign('Dairy & eggs', ['kefir', 'milk', 'skyr', 'cottage', 'feta', 'eggwhite', 'quark', 'eggs'])

export function aisleOf(item: ShoppingItem): Aisle {
  if (getIngredient(item.ingredient)?.store === "Sainsbury's") return "Sainsbury's"
  const mapped = AISLE_BY_INGREDIENT[item.ingredient]
  if (mapped) return mapped
  if (item.category === 'pantry') return 'Cupboard'
  if (item.category === 'frozen') return 'Frozen'
  return 'Other'
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

/** The week's list grouped by aisle, in walking order. Empty aisles are left out. */
export function shoppingAisles(week: Week): { aisle: Aisle; items: ShoppingItem[] }[] {
  return AISLES.map(aisle => ({ aisle, items: week.shopping.filter(i => aisleOf(i) === aisle) }))
    .filter(group => group.items.length > 0)
}
