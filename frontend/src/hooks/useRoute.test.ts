import { describe, expect, it } from 'vitest'
import { parseRoute } from './useRoute'

describe('parseRoute', () => {
  it.each([
    ['', { name: 'today' }],
    ['#/today', { name: 'today' }],
    ['#/week', { name: 'week', week: null }],
    ['#/week/2', { name: 'week', week: 2 }],
    ['#/week/2/mon', { name: 'day', week: 2, day: 'mon' }],
    ['#/shopping', { name: 'shopping' }],
    ['#/recipe/skyr-bowl', { name: 'recipe', id: 'skyr-bowl' }],
    ['#/settings', { name: 'settings' }],
    ['#/nonsense', { name: 'today' }],
  ])('%s', (hash, route) => {
    expect(parseRoute(hash)).toEqual(route)
  })
})
