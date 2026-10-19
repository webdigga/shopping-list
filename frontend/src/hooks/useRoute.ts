import { useEffect, useState } from 'react'

// Hash routes, so the phone's back button works without a router library:
// #/today  #/week  #/week/2  #/week/2/mon  #/shopping  #/recipe/:id  #/settings
export type Route =
  | { name: 'today' }
  | { name: 'week'; week: number | null }
  | { name: 'day'; week: number; day: string }
  | { name: 'shopping' }
  | { name: 'recipe'; id: string }
  | { name: 'settings' }

export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent)
  switch (parts[0]) {
    case 'week':
      if (parts[1] && parts[2]) return { name: 'day', week: Number(parts[1]), day: parts[2] }
      return { name: 'week', week: parts[1] ? Number(parts[1]) : null }
    case 'shopping':
      return { name: 'shopping' }
    case 'recipe':
      return parts[1] ? { name: 'recipe', id: parts[1] } : { name: 'today' }
    case 'settings':
      return { name: 'settings' }
    default:
      return { name: 'today' }
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))
  useEffect(() => {
    const onChange = () => {
      setRoute(parseRoute(window.location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
