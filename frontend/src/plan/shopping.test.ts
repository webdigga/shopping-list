import { describe, expect, it } from 'vitest'
import type { ShoppingItem } from '@shared/planTypes'
import { getWeek, plan } from './data'
import { freezeLines, lastsUntil, shoppingSections, stapleBuy } from './shopping'

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

describe('stapleBuy', () => {
  it('rounds the shortfall up to whole packs', () => {
    expect(stapleBuy(item({}), 6)).toMatchObject({ short: 8, packs: 1, text: '1 × 15 eggs' })
    expect(stapleBuy(item({ totalQty: 20 }), 0)).toMatchObject({ packs: 2, text: '2 × 15 eggs' })
  })

  it('buys nothing when stock covers the week', () => {
    expect(stapleBuy(item({}), 14)).toMatchObject({ packs: 0, text: 'Nothing to buy' })
  })

  it('rounds loose items up to whole ones', () => {
    const onions = item({ ingredient: 'onion', name: 'Onions', totalQty: 1.32, packSize: 1 })
    expect(stapleBuy(onions, 0).text).toBe('2 onions')
    expect(stapleBuy(onions, 1).text).toBe('1 onion')
  })

  it('shows packs by weight', () => {
    const potatoes = item({ ingredient: 'potatoes', name: 'Baby / new potatoes', totalQty: 700, unit: 'g', packSize: 1000, packUnit: 'g' })
    expect(stapleBuy(potatoes, 300).text).toBe('1 × 1000g')
    expect(stapleBuy(potatoes, 700).packs).toBe(0)
  })

  it('buys one pack when sold in a different unit', () => {
    const garlic = item({ ingredient: 'garlic', name: 'Garlic', totalQty: 6, unit: 'clove', packSize: 1, packUnit: 'bulb' })
    expect(stapleBuy(garlic, 2).text).toBe('1 bulb')
    expect(stapleBuy(garlic, 6).packs).toBe(0)
  })
})

describe('shoppingSections', () => {
  it('puts every shopping item in exactly one section, every week', () => {
    for (const week of plan.weeks) {
      const s = shoppingSections(week)
      const ids = [
        ...s.fresh.flatMap(g => g.items),
        ...s.staples,
        ...s.core,
        ...s.pantry,
      ].map(i => i.ingredient)
      expect(ids.sort()).toEqual(week.shopping.map(i => i.ingredient).sort())
    }
  })

  it('groups every fresh item into a named aisle', () => {
    for (const week of plan.weeks) {
      expect(shoppingSections(week).fresh.map(g => g.aisle)).not.toContain('Other')
    }
  })
})
