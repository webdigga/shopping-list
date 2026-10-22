import { describe, expect, it } from 'vitest'
import { cleanExtraName, sortExtras } from './extras'

describe('cleanExtraName', () => {
  it('trims and collapses spaces', () => {
    expect(cleanExtraName('  Tin   foil ')).toBe('Tin foil')
  })

  it('rejects empty and over-long names', () => {
    expect(cleanExtraName('   ')).toBeNull()
    expect(cleanExtraName('x'.repeat(81))).toBeNull()
  })
})

describe('sortExtras', () => {
  it('sorts alphabetically, ignoring case', () => {
    const sorted = sortExtras([
      { id: '1', name: 'toilet roll' },
      { id: '2', name: 'Bin bags' },
      { id: '3', name: 'coffee' },
    ])
    expect(sorted.map(i => i.name)).toEqual(['Bin bags', 'coffee', 'toilet roll'])
  })
})
