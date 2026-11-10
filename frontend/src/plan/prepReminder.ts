import type { Day } from '@shared/planTypes'
import { readJson, writeJson } from '@/services/storage'
import { getWeek } from './data'
import type { PlanView } from './schedule'

/** The London date the prep pop-up was last dismissed on this device. */
const SEEN_KEY = 'mp-prep-seen'

/** Today's plan day when it has prep and the pop-up has not been dismissed today; otherwise null. */
export function prepToShow(view: PlanView, seenOn: string | null): Day | null {
  if (view.mode !== 'active' || seenOn === view.today) return null
  const day = getWeek(view.state.currentWeek).days[view.dayNumber - 1]
  return day.prep.length > 0 ? day : null
}

export function readPrepSeen(): string | null {
  return readJson<string | null>(SEEN_KEY, null)
}

export function markPrepSeen(today: string) {
  writeJson(SEEN_KEY, today)
}
