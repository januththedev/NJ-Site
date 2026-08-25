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
/** Fetch the latest saved content from the API once per page load. */
export function hydrateContent() {
  if (hydrating) return
  hydrating = true
  fetch('/api/content')
    .then((r) => (r.ok ? r.json() : null))
    .then((b) => {
      if (b?.ok && b.content && typeof b.content === 'object' && Array.isArray(b.content.centres)) {
        contentStore.set(b.content as Content)
      }
    })
    .catch(() => {
      /* no API (static preview) — keep bundled content */
    })
}
