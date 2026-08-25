import { useSyncExternalStore } from 'react'
import base from './site-content.json'

export type Content = typeof base

/**
 * Runtime content store. Pages read CMS data through here instead of static
 * imports, so edits saved from the hosted /admin (Vercel KV) appear instantly
 * without a rebuild. The bundled JSON is the initial value and the fallback
 * whenever the API is unreachable (local preview, first boot of an empty DB).
 */
let current: Content = structuredClone(base)
const listeners = new Set<() => void>()

export const contentStore = {
  get: () => current,
  set(next: Content) {
    current = next
    listeners.forEach((fn) => fn())
  },
  subscribe(fn: () => void) {
    listeners.add(fn)
    return () => {
      listeners.delete(fn)
    }
  },
}

/** React hook — re-renders the caller whenever content changes. */
export function useContent(): Content {
  return useSyncExternalStore(contentStore.subscribe, contentStore.get)
}

let hydrating = false
/**
 * Fetch the latest saved content from the API once per page load.
 * Content from the database is shape-checked before it replaces the store —
 * malformed/partial saves fall back to the bundled content so no page,
 * model or section can ever go missing because of bad data.
 */
function looksValid(c: unknown): c is Content {
  if (!c || typeof c !== 'object') return false
  const v = c as Record<string, unknown>
  return (
    Array.isArray(v.centres) &&
    v.centres.length > 0 &&
    Array.isArray(v.heroStats) &&
    Array.isArray(v.timetables) &&
    Array.isArray(v.topReviews) &&
    Array.isArray(v.studentReviews) &&
    Array.isArray(v.contactCards) &&
    Array.isArray(v.telegramGroups) &&
    typeof v.site === 'object' &&
    v.site !== null &&
    typeof v.coverageTitle === 'string'
  )
}

export function hydrateContent() {
  if (hydrating) return
  hydrating = true
  fetch('/api/content')
    .then((r) => (r.ok ? r.json() : null))
    .then((b) => {
      if (b?.ok && looksValid(b.content)) {
        contentStore.set(b.content as Content)
      }
    })
    .catch(() => {
      /* no API (static preview) — keep bundled content */
    })
}
