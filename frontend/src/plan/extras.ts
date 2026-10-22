import { EXTRA_NAME_MAX } from '@shared/extras'

export interface ExtraItem {
  id: string
  name: string
}

/** Tidies a typed name; null when it is empty or too long to save. */
export function cleanExtraName(name: string): string | null {
  const cleaned = name.trim().replace(/\s+/g, ' ')
  return cleaned && cleaned.length <= EXTRA_NAME_MAX ? cleaned : null
}

/** Alphabetical, ignoring case, so an item is always in the same place on the list. */
export function sortExtras(items: ExtraItem[]): ExtraItem[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, 'en-GB', { sensitivity: 'base' }))
}
