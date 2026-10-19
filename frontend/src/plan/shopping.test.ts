import { describe, expect, it } from 'vitest'
import type { ShoppingItem } from '@shared/planTypes'
import { getWeek, plan } from './data'
import { freezeLines, lastsUntil, shoppingAisles } from './shopping'

const item = (over: Partial<ShoppingItem>): ShoppingItem => ({
  ingredient: 'eggs',
  name: 'Eggs, large',
  category: 'core',
  totalQty: 14,
  unit: 'each',
  packSize: 15,
  packUnit: 'each',
  stockTracked: true,
  usedOnDays: ['sat', 'thu'],
  ...over,
})

describe('lastsUntil', () => {
  it('is the date of the last day the item is used, from the Friday shop', () => {
    expect(lastsUntil(item({ usedOnDays: ['fri', 'tue'] }), '2026-10-23')).toBe('2026-10-27')
    expect(lastsUntil(item({ usedOnDays: ['thu', 'sat'] }), '2026-10-23')).toBe('2026-10-29')
  })
})

describe('freezeLines', () => {
  it('describes each portion to freeze', () => {
    const mince = getWeek(1).shopping.find(s => s.ingredient === 'beefmince')!
    expect(freezeLines(mince)).toEqual(['Freeze on arrival: 250g for Tuesday (defrost Monday evening)'])
  })
})

describe('shoppingAisles', () => {
  it('puts every shopping item in exactly one named aisle, every week', () => {
    for (const week of plan.weeks) {
      const groups = shoppingAisles(week)
      expect(groups.map(g => g.aisle)).not.toContain('Other')
      const ids = groups.flatMap(g => g.items).map(i => i.ingredient)
      expect(ids.sort()).toEqual(week.shopping.map(i => i.ingredient).sort())
    }
  })

  it('walks Lidl in order, frozen last, then the Sainsbury\'s shop', () => {
    const order = shoppingAisles(getWeek(1)).map(g => g.aisle)
    expect(order[0]).toBe('Fruit & veg')
    expect(order.slice(-2)).toEqual(['Frozen', "Sainsbury's"])
  })

  it('shelves staples with their aisle, not a separate section', () => {
    const groups = shoppingAisles(getWeek(1))
    const aisle = (id: string) => groups.find(g => g.items.some(i => i.ingredient === id))?.aisle
    expect(aisle('banana')).toBe('Fruit & veg')
    expect(aisle('eggs')).toBe('Dairy & eggs')
    expect(aisle('sourdough')).toBe('Bakery')
    expect(aisle('kimchi')).toBe("Sainsbury's")
    expect(aisle('sauerkraut')).toBe("Sainsbury's")
  })
})
