import { describe, expect, it } from 'vitest'
import type { ShoppingItem } from '@shared/planTypes'
import { getWeek, plan } from './data'
import { lastsUntil, openedOn, shoppingAisles, stapleBuy } from './shopping'

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
  lastNeededOn: 'thu',
  ...over,
})

describe('lastsUntil', () => {
  it('is the real date of the last day the item is needed, from the shop date', () => {
    expect(lastsUntil(item({ lastNeededOn: 'tue' }), '2026-10-30')).toBe('2026-11-03')
    expect(lastsUntil(item({ lastNeededOn: 'wed' }), '2026-10-30')).toBe('2026-11-04')
  })

  it('moves with the shop date, so the next cycle gets new dates', () => {
    expect(lastsUntil(item({ lastNeededOn: 'tue' }), '2026-11-20')).toBe('2026-11-24')
  })

  it('uses the day a batch is cooked, not the day it is eaten', () => {
    const chicken = getWeek(2).shopping.find(s => s.ingredient === 'chicken')!
    expect(chicken.usedOnDays).toEqual(['tue', 'wed'])
    expect(chicken.lastNeededOn).toBe('mon')
  })
})

describe('opened packs', () => {
  it('give a real opened date when one raw pack is cooked across several days', () => {
    const mince = getWeek(1).shopping.find(s => s.ingredient === 'beefmince')!
    expect(openedOn(mince, '2026-10-23')).toBe('2026-10-23')
    expect(openedOn(item({}), '2026-10-23')).toBeNull()
  })

  it('never ask for anything to be frozen on arrival or defrosted', () => {
    for (const w of plan.weeks) {
      for (const s of w.shopping) expect(s).not.toHaveProperty('freezeOnArrival')
      for (const d of w.days) for (const p of d.prep) {
        expect(typeof p === 'string' ? p : p.text).not.toMatch(/freezer to fridge|defrost/i)
      }
    }
  })
})

describe('stapleBuy', () => {
  it('rounds the shortfall up to whole packs', () => {
    expect(stapleBuy(item({}), 6)).toMatchObject({ short: 8, packs: 1, text: '1 × 15 eggs' })
  })

  it('buys nothing when stock covers the week', () => {
    expect(stapleBuy(item({}), 14)).toMatchObject({ packs: 0, text: 'Nothing to buy' })
  })

  it('buys frozen fish in 400g packs', () => {
    const cod = getWeek(1).shopping.find(s => s.ingredient === 'cod')!
    expect(stapleBuy(cod, 0).text).toBe('1 × 400g')
    expect(stapleBuy(cod, 200).packs).toBe(0)
  })

  it('buys one bag, loaf or bulb when sold in a different unit', () => {
    const onions = getWeek(1).shopping.find(s => s.ingredient === 'onion')!
    const bread = getWeek(1).shopping.find(s => s.ingredient === 'sourdough')!
    expect(stapleBuy(onions, 0).text).toBe('1 bag')
    expect(stapleBuy(bread, 2).text).toBe('1 loaf')
    expect(stapleBuy(bread, 4).packs).toBe(0)
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

  it('walks the aisles in the plan order', () => {
    for (const week of plan.weeks) {
      const order = shoppingAisles(week).map(g => g.aisle)
      expect(order).toEqual(plan.aisleOrder.filter(a => order.includes(a)))
    }
    expect(plan.aisleOrder.slice(0, 7)).toEqual(['Fruit & veg', 'Bakery', 'Dairy', 'Meat & fish', 'Frozen', 'Cupboard', 'Eggs & oil'])
  })

  it('keeps eggs, liquid egg and olive oil together, apart from Cupboard', () => {
    const aisle = shoppingAisles(getWeek(3)).find(g => g.aisle === 'Eggs & oil')!
    expect(aisle.items.map(i => i.ingredient)).toEqual(expect.arrayContaining(['eggs', 'eggwhite', 'oil']))
  })

  it('shelves staples with their aisle, not a separate section', () => {
    const groups = shoppingAisles(getWeek(1))
    const aisle = (id: string) => groups.find(g => g.items.some(i => i.ingredient === id))?.aisle
    expect(aisle('banana')).toBe('Fruit & veg')
    expect(aisle('sourdough')).toBe('Bakery')
    expect(aisle('cod')).toBe('Frozen')
    expect(aisle('spinach')).toBe('Fruit & veg')
    expect(aisle('kimchi')).toBe("Sainsbury's")
    expect(aisle('sauerkraut')).toBe("Sainsbury's")
  })
})
