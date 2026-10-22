// Extras share the shopping tick table with plan ingredients; the prefix keeps their keys apart.
export function extraTickKey(id: string): string {
  return `extra-${id}`
}
