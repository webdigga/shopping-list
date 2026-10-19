import {
  addDays,
  dayNumber,
  londonDate,
  londonMinutes,
  nextWeek,
  resolveState,
  thisFriday,
  type AwayPrompt,
  type PlanState,
} from '@shared/weekState'
import type { DayKey, WeekNumber } from '@shared/planTypes'
import { plan } from './data'

/** Thursday from 17:00 counts as evening: the app switches to next week's shopping list. */
export const THURSDAY_EVENING_FROM = 17 * 60
/** Friday before 12:00 counts as shopping morning. */
export const FRIDAY_MORNING_UNTIL = 12 * 60

export type PlanView =
  | { mode: 'setup'; today: string }
  | { mode: 'away'; today: string; state: PlanState; away: AwayPrompt }
  | { mode: 'paused'; today: string; state: PlanState }
  | { mode: 'upcoming'; today: string; state: PlanState }
  | { mode: 'active'; today: string; state: PlanState; dayNumber: number; day: DayKey }

/**
 * Where David is in the plan right now. Runs the same advance rule as the worker, so a state
 * cached from yesterday still renders the right day before the server replies.
 */
export function planView(state: PlanState | null, now: Date): PlanView {
  const today = londonDate(now)
  if (!state) return { mode: 'setup', today }

  const resolved = resolveState(state, today)
  if (resolved.away) return { mode: 'away', today, state: resolved.state, away: resolved.away }
  if (resolved.state.paused) return { mode: 'paused', today, state: resolved.state }

  const n = dayNumber(resolved.state.weekStartDate, today)
  if (n < 1) return { mode: 'upcoming', today, state: resolved.state }
  return { mode: 'active', today, state: resolved.state, dayNumber: n, day: plan.dayOrder[n - 1] }
}

export interface WeekInstance {
  week: WeekNumber
  /** The Friday this instance starts (the shop date). */
  start: string
}

/**
 * Which week's shopping list to show by default: next week from Thursday evening until the
 * Friday shop, otherwise the current one.
 */
export function defaultShoppingInstance(view: PlanView, now: Date): WeekInstance {
  switch (view.mode) {
    case 'setup':
      return { week: 1, start: thisFriday(view.today) }
    case 'away':
      return { week: view.away.suggestedWeek, start: view.away.suggestedStart }
    case 'paused':
      return { week: view.state.currentWeek, start: thisFriday(view.today) }
    case 'upcoming':
      return { week: view.state.currentWeek, start: view.state.weekStartDate }
    case 'active':
      if (view.dayNumber === 7 && londonMinutes(now) >= THURSDAY_EVENING_FROM) {
        return { week: nextWeek(view.state.currentWeek), start: addDays(view.state.weekStartDate, 7) }
      }
      return { week: view.state.currentWeek, start: view.state.weekStartDate }
  }
}

/** Whether Today should show the prominent shopping button. */
export function showShoppingPrompt(view: PlanView, now: Date): boolean {
  if (view.mode === 'upcoming') return true
  if (view.mode !== 'active') return false
  const minutes = londonMinutes(now)
  return (
    (view.dayNumber === 7 && minutes >= THURSDAY_EVENING_FROM) ||
    (view.dayNumber === 1 && minutes < FRIDAY_MORNING_UNTIL)
  )
}

/** The next instance of each week in the cycle, counting forward from a base instance. */
export function cycleInstances(base: WeekInstance): WeekInstance[] {
  return ([1, 2, 3] as WeekNumber[]).map(week => ({
    week,
    start: addDays(base.start, ((week - base.week + 3) % 3) * 7),
  }))
}

/** Dated days for the current plan week, or null when no week is running. */
export function currentWeekStart(view: PlanView): { week: WeekNumber; start: string } | null {
  if (view.mode === 'active' || view.mode === 'upcoming') {
    return { week: view.state.currentWeek, start: view.state.weekStartDate }
  }
  return null
}
