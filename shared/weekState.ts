// Week tracking rules, shared by the worker (which persists them) and the front end (which displays them).
// All dates are plain YYYY-MM-DD strings in Europe/London. Date maths runs in UTC so DST never shifts a day.

import type { WeekNumber } from './planTypes'

export const TIME_ZONE = 'Europe/London'

export interface PlanState {
  currentWeek: WeekNumber
  weekStartDate: string
  paused: boolean
  pausedOn: string | null
}

export interface AwayPrompt {
  finishedWeek: WeekNumber
  suggestedWeek: WeekNumber
  suggestedStart: string
}

export interface ResolvedState {
  state: PlanState
  advanced: boolean
  away: AwayPrompt | null
}

const londonDateFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const londonTimeFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

export function londonDate(now: Date): string {
  return londonDateFormat.format(now)
}

/** Minutes since midnight, London time. */
export function londonMinutes(now: Date): number {
  const [h, m] = londonTimeFormat.format(now).split(':').map(Number)
  return h * 60 + m
}

function toUtc(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

export function addDays(iso: string, days: number): string {
  return new Date(toUtc(iso) + days * 86_400_000).toISOString().slice(0, 10)
}

/** Whole days from a to b (positive when b is later). */
export function daysBetween(a: string, b: string): number {
  return Math.round((toUtc(b) - toUtc(a)) / 86_400_000)
}

/** 0 = Sunday ... 5 = Friday. */
export function weekday(iso: string): number {
  return new Date(toUtc(iso)).getUTCDay()
}

export function isFriday(iso: string): boolean {
  return weekday(iso) === 5
}

/** The Friday on or before the given date. */
export function mostRecentFriday(iso: string): string {
  return addDays(iso, -((weekday(iso) - 5 + 7) % 7))
}

/** The Friday after the most recent one (a week after today, if today is Friday). */
export function nextFriday(iso: string): string {
  return addDays(mostRecentFriday(iso), 7)
}

/** "This Friday": today if it is Friday, otherwise the coming Friday. */
export function thisFriday(iso: string): string {
  return isFriday(iso) ? iso : nextFriday(iso)
}

export function nextWeek(week: WeekNumber): WeekNumber {
  return week === 3 ? 1 : ((week + 1) as WeekNumber)
}

export function isWeekNumber(value: unknown): value is WeekNumber {
  return value === 1 || value === 2 || value === 3
}

/** Day of the plan week: Friday = 1 ... Thursday = 7. Zero or less means the week has not started. */
export function dayNumber(weekStartDate: string, today: string): number {
  return daysBetween(weekStartDate, today) + 1
}

export function weekInstanceKey(week: WeekNumber, weekStartDate: string): string {
  return `W${week}:${weekStartDate}`
}

/**
 * Applies the advance rule. A finished week moves on exactly once; a longer gap returns an
 * away prompt instead of skipping ahead. Paused or not-yet-started weeks never move.
 */
export function resolveState(state: PlanState, today: string): ResolvedState {
  const day = dayNumber(state.weekStartDate, today)

  if (state.paused || day <= 7) {
    return { state, advanced: false, away: null }
  }

  if (day <= 14) {
    return {
      state: {
        ...state,
        currentWeek: nextWeek(state.currentWeek),
        weekStartDate: addDays(state.weekStartDate, 7),
      },
      advanced: true,
      away: null,
    }
  }

  return {
    state,
    advanced: false,
    away: {
      finishedWeek: state.currentWeek,
      suggestedWeek: nextWeek(state.currentWeek),
      suggestedStart: thisFriday(today),
    },
  }
}
