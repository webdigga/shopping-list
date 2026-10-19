import { describe, expect, it } from 'vitest'
import { getIngredient } from './data'
import { formatAmount, formatShortDate, itemNoun, toFraction } from './format'

describe('toFraction', () => {
  it.each([
    [0.5, '½'],
    [0.33, '⅓'],
    [0.25, '¼'],
    [0.67, '⅔'],
    [0.7, '⅔'],
    [0.75, '¾'],
    [0.4, '⅓'],
    [1, '1'],
    [1.5, '1½'],
    [2, '2'],
    [0.95, '1'],
  ])('%s → %s', (qty, text) => {
    expect(toFraction(qty).text).toBe(text)
  })

  it('never shows a positive amount as zero', () => {
    expect(toFraction(0.1).text).toBe('¼')
  })
})

describe('formatAmount', () => {
  it('shows grams and millilitres plainly', () => {
    expect(formatAmount(150, 'g')).toBe('150g')
    expect(formatAmount(175, 'ml')).toBe('175ml')
  })

  it('names and pluralises counted items', () => {
    expect(formatAmount(0.5, 'each', getIngredient('pepper'))).toBe('½ pepper')
    expect(formatAmount(2, 'each', getIngredient('eggs'))).toBe('2 eggs')
    expect(formatAmount(1, 'each', getIngredient('eggs'))).toBe('1 egg')
    expect(formatAmount(1, 'each', getIngredient('tomatoes'))).toBe('1 tomato')
    expect(formatAmount(0.5, 'each', getIngredient('courgette'))).toBe('½ courgette')
  })

  it('uses unit words for tins, pouches, cloves and spoons', () => {
    expect(formatAmount(1, 'tin')).toBe('1 tin')
    expect(formatAmount(0.5, 'pouch')).toBe('½ pouch')
    expect(formatAmount(2, 'clove')).toBe('2 cloves')
    expect(formatAmount(0.5, 'tsp')).toBe('½ tsp')
    expect(formatAmount(2, 'slice')).toBe('2 slices')
  })
})

describe('itemNoun', () => {
  it('drops the detail after the comma', () => {
    expect(itemNoun('Eggs, large boiled')).toEqual({ one: 'egg', many: 'eggs' })
  })
})

describe('formatShortDate', () => {
  it('reads like "Thu 29 Oct"', () => {
    expect(formatShortDate('2026-10-29')).toBe('Thu 29 Oct')
  })
})
