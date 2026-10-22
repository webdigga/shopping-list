// Everyday extras (household items, coffee) share the shopping tick table with plan ingredients.
// Their tick key is prefixed so it can never clash with an ingredient id.

export const EXTRA_NAME_MAX = 80

export function extraTickKey(id: string): string {
  return `extra-${id}`
}
