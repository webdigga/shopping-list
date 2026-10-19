/** Stable key for a prep task, from its text (djb2), so reordering tasks keeps their ticks. */
export function taskKey(text: string): string {
  let hash = 5381
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash + text.charCodeAt(i)) >>> 0
  }
  return hash.toString(36)
}
