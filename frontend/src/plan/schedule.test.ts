import { describe, expect, it } from 'vitest'
import type { PlanState } from '@shared/weekState'
import { cycleInstances, defaultShoppingInstance, planView, showShoppingPrompt } from './schedule'

const running: PlanState = { currentWeek: 2, weekStartDate: '2026-10-16', paused: false, pausedOn: null }

// October 2026 is British Summer Time until the 25th, so London = UTC + 1.
const at = (iso: string) => new Date(iso)

describe('planView', () => {
  it('asks to set a week when there is no state', () => {
    expect(planView(null, at('2026-10-19T08:00:00Z')).mode).toBe('setup')
  })

  it('knows the day of the week', () => {
    const view = planView(running, at('2026-10-19T08:00:00Z'))
    expect(view).toMatchObject({ mode: 'active', dayNumber: 4, day: 'mon' })
  })

  it('moves to the next week on the Friday', () => {
    const view = planView(running, at('2026-10-23T07:00:00Z'))
    expect(view).toMatchObject({ mode: 'active', dayNumber: 1, day: 'fri' })
    expect(view.mode === 'active' && view.state.currentWeek).toBe(3)
  })

  it('shows a week starting next Friday as upcoming', () => {
    expect(planView({ ...running, weekStartDate: '2026-10-23' }, at('2026-10-19T08:00:00Z')).mode).toBe('upcoming')
  })

  it('shows the paused banner state', () => {
    expect(planView({ ...running, paused: true }, at('2026-11-19T08:00:00Z')).mode).toBe('paused')
  })
})

describe('defaultShoppingInstance', () => {
  it('is the current week before Thursday evening', () => {
    const now = at('2026-10-22T15:00:00Z') // Thu 16:00 London
    expect(defaultShoppingInstance(planView(running, now), now)).toEqual({ week: 2, start: '2026-10-16' })
  })

  it('switches to next week from Thursday evening', () => {
    const now = at('2026-10-22T16:00:00Z') // Thu 17:00 London
    expect(defaultShoppingInstance(planView(running, now), now)).toEqual({ week: 3, start: '2026-10-23' })
  })

  it('is the new week on Friday morning', () => {
    const now = at('2026-10-23T07:00:00Z')
    expect(defaultShoppingInstance(planView(running, now), now)).toEqual({ week: 3, start: '2026-10-23' })
  })
})

describe('showShoppingPrompt', () => {
  it('shows on Thursday evening and Friday morning only', () => {
    const check = (iso: string) => showShoppingPrompt(planView(running, at(iso)), at(iso))
    expect(check('2026-10-22T15:00:00Z')).toBe(false) // Thu 16:00
    expect(check('2026-10-22T18:00:00Z')).toBe(true) // Thu 19:00
    expect(check('2026-10-23T08:00:00Z')).toBe(true) // Fri 09:00
    expect(check('2026-10-23T12:00:00Z')).toBe(false) // Fri 13:00
    expect(check('2026-10-19T18:00:00Z')).toBe(false) // Mon evening
  })
})

describe('cycleInstances', () => {
  it('dates each week by its next turn in the cycle', () => {
    expect(cycleInstances({ week: 3, start: '2026-10-23' })).toEqual([
      { week: 1, start: '2026-10-30' },
      { week: 2, start: '2026-11-06' },
      { week: 3, start: '2026-10-23' },
    ])
  })
})
