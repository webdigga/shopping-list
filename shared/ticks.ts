// Every shopping tick is stored under one key per item: the ingredient id, or extra-<id> for
// household extras. The worker and the tests both check keys against this pattern.

/** Ingredient ids are mixed case (riceW, riceB), so the pattern must not lowercase or reject them. */
export const TICK_KEY_RE = /^[A-Za-z0-9-]{1,64}$/

export function extraTickKey(id: string): string {
  return `extra-${id}`
}
