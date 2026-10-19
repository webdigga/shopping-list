import type { DayKey, Ingredient } from '@shared/planTypes'

const FRACTIONS: [number, string][] = [
  [0, ''],
  [1 / 4, '¼'],
  [1 / 3, '⅓'],
  [1 / 2, '½'],
  [2 / 3, '⅔'],
  [3 / 4, '¾'],
  [1, ''],
]

/** Rounds to the nearest of ¼ ⅓ ½ ⅔ ¾ and returns e.g. "½", "1½", "2". A positive amount never shows as 0. */
export function toFraction(qty: number): { text: string; value: number } {
  if (qty <= 0) return { text: '0', value: 0 }
  let whole = Math.floor(qty)
  const rest = qty - whole
  let best = FRACTIONS[0]
  for (const f of FRACTIONS) {
    if (Math.abs(rest - f[0]) < Math.abs(rest - best[0])) best = f
  }
  let [part, glyph] = best
  if (part === 1) {
    whole += 1
    part = 0
  }
  if (whole === 0 && part === 0) {
    part = 1 / 4
    glyph = '¼'
  }
  return { text: `${whole || ''}${glyph}` || '0', value: whole + part }
}

const FRACTION_UNITS = new Set(['each', 'head', 'slice', 'tin', 'pouch', 'clove', 'tsp'])
const UNIT_PLURALS: Record<string, string> = {
  head: 'heads',
  slice: 'slices',
  tin: 'tins',
  pouch: 'pouches',
  clove: 'cloves',
  tsp: 'tsp',
}

/** "Peppers" → pepper / peppers; "Eggs, large" → egg / eggs; "Courgette" → courgette / courgettes. */
export function itemNoun(name: string): { one: string; many: string } {
  const base = name.split(',')[0].trim().toLowerCase()
  if (base.endsWith('oes')) return { one: base.slice(0, -2), many: base }
  if (base.endsWith('s')) return { one: base.slice(0, -1), many: base }
  return { one: base, many: `${base}s` }
}

/**
 * The amount to show in large text, e.g. "150g", "175ml", "½ pepper", "2 eggs", "1 tin".
 * For "each" the item noun is part of the amount, so the label below it can carry the detail.
 */
export function formatAmount(qty: number, unit: string, ingredient?: Ingredient): string {
  if (unit === 'g' || unit === 'ml') return `${Math.round(qty)}${unit}`
  if (!FRACTION_UNITS.has(unit)) return `${Math.round(qty * 100) / 100} ${unit}`

  const { text, value } = toFraction(qty)
  const plural = value > 1
  if (unit === 'each') {
    if (!ingredient) return text
    const noun = itemNoun(ingredient.name)
    return `${text} ${plural ? noun.many : noun.one}`
  }
  return `${text} ${plural ? UNIT_PLURALS[unit] : unit}`
}

const dayNames: Record<DayKey, string> = {
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
}

export function dayName(day: DayKey): string {
  return dayNames[day]
}

const shortDate = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
const longDate = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })

function isoToUtcDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`)
}

/** "Thu 24 Oct" */
export function formatShortDate(iso: string): string {
  return shortDate.format(isoToUtcDate(iso)).replace(',', '')
}

/** "Friday 23 October" */
export function formatLongDate(iso: string): string {
  return longDate.format(isoToUtcDate(iso)).replace(',', '')
}

const slotLabels: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  'pre-run': 'Pre-run',
  batch: 'Batch cook',
}

export function slotLabel(slot: string): string {
  return slotLabels[slot] ?? slot.charAt(0).toUpperCase() + slot.slice(1)
}
