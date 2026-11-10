import { describe, expect, it } from 'vitest'
import type { PlanState } from '@shared/weekState'
import { prepToShow } from './prepReminder'
import { planView } from './schedule'

// Week 3 from Friday 6 November 2026 (London is on GMT, so London = UTC).
const week3: PlanState = { currentWeek: 3, weekStartDate: '2026-11-06', paused: false, pausedOn: null }
const view = (iso: string, state: PlanState = week3) => planView(state, new Date(iso))

describe('prepToShow', () => {
  it("shows today's prep the first time the app opens that day", () => {
    const day = prepToShow(view('2026-11-10T07:00:00Z'), null)
    expect(day?.day).toBe('tue')
    expect(day?.prep.length).toBeGreaterThan(0)
  })

  it('stays hidden for the rest of the day once dismissed', () => {
    expect(prepToShow(view('2026-11-10T19:00:00Z'), '2026-11-10')).toBeNull()
  })

  it('shows again the next day', () => {
    expect(prepToShow(view('2026-11-11T07:00:00Z'), '2026-11-10')?.day).toBe('wed')
  })

  it('stays hidden on a day with no prep', () => {
    expect(prepToShow(view('2026-11-07T07:00:00Z'), null)).toBeNull()
  })

  it('stays hidden when the plan is paused or not started', () => {
    expect(prepToShow(view('2026-11-10T07:00:00Z', { ...week3, paused: true }), null)).toBeNull()
    expect(prepToShow(view('2026-11-10T07:00:00Z', { ...week3, weekStartDate: '2026-11-13' }), null)).toBeNull()
  })
})
