import { describe, expect, it } from 'vitest'
import {
  addDays,
  dayNumber,
  londonDate,
  londonMinutes,
  mostRecentFriday,
  nextFriday,
  resolveState,
  thisFriday,
  type PlanState,
} from '@shared/weekState'

const state = (over: Partial<PlanState> = {}): PlanState => ({
  currentWeek: 1,
  weekStartDate: '2026-10-16',
  paused: false,
  pausedOn: null,
  ...over,
})

describe('London dates', () => {
  it('uses the London date, not UTC, late in the evening in summer time', () => {
    expect(londonDate(new Date('2026-07-09T23:30:00Z'))).toBe('2026-07-10')
    expect(londonMinutes(new Date('2026-07-09T23:30:00Z'))).toBe(30)
  })

  it('matches UTC in winter', () => {
    expect(londonDate(new Date('2026-12-03T23:30:00Z'))).toBe('2026-12-03')
  })

  it('adds days across the clocks going back', () => {
    expect(addDays('2026-10-23', 7)).toBe('2026-10-30')
  })
})

describe('Fridays', () => {
  it('finds the most recent and next Friday from a Monday', () => {
    expect(mostRecentFriday('2026-10-19')).toBe('2026-10-16')
    expect(nextFriday('2026-10-19')).toBe('2026-10-23')
    expect(thisFriday('2026-10-19')).toBe('2026-10-23')
  })

  it('treats a Friday as its own most recent Friday', () => {
    expect(mostRecentFriday('2026-10-23')).toBe('2026-10-23')
    expect(nextFriday('2026-10-23')).toBe('2026-10-30')
    expect(thisFriday('2026-10-23')).toBe('2026-10-23')
  })

  it('counts Friday as day 1 and Thursday as day 7', () => {
    expect(dayNumber('2026-10-16', '2026-10-16')).toBe(1)
    expect(dayNumber('2026-10-16', '2026-10-22')).toBe(7)
  })
})

describe('resolveState', () => {
  it('stays put during the week', () => {
    const result = resolveState(state(), '2026-10-22')
    expect(result.advanced).toBe(false)
    expect(result.state.currentWeek).toBe(1)
  })

  it('advances once the Thursday has passed', () => {
    const result = resolveState(state(), '2026-10-23')
    expect(result.advanced).toBe(true)
    expect(result.state).toMatchObject({ currentWeek: 2, weekStartDate: '2026-10-23' })
  })

  it('wraps from Week 3 back to Week 1', () => {
    expect(resolveState(state({ currentWeek: 3 }), '2026-10-24').state.currentWeek).toBe(1)
  })

  it('still advances only one week up to 7 days after the Thursday', () => {
    const result = resolveState(state(), '2026-10-29')
    expect(result.state).toMatchObject({ currentWeek: 2, weekStartDate: '2026-10-23' })
    expect(result.away).toBeNull()
  })

  it('prompts instead of skipping when more than 7 days past the Thursday', () => {
    const result = resolveState(state({ currentWeek: 2 }), '2026-10-30')
    expect(result.advanced).toBe(false)
    expect(result.state.currentWeek).toBe(2)
    expect(result.away).toEqual({ finishedWeek: 2, suggestedWeek: 3, suggestedStart: '2026-10-30' })
  })

  it('never moves while paused', () => {
    const result = resolveState(state({ paused: true, pausedOn: '2026-10-18' }), '2026-12-01')
    expect(result.advanced).toBe(false)
    expect(result.away).toBeNull()
  })

  it('leaves a week that starts next Friday alone', () => {
    const result = resolveState(state({ weekStartDate: '2026-10-23' }), '2026-10-19')
    expect(result.advanced).toBe(false)
  })
})
