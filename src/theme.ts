import { useSyncExternalStore } from 'react'

/**
 * Site theme store. The DOM theme is a class on <html> ("light" — absence
 * means dark, the site's native look). The 3D scenes subscribe here too so
 * the rocket canvas day/night rig follows the toggle, not the OS.
 */
export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'nj-theme'
const listeners = new Set<(t: Theme) => void>()

export function getTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.classList.contains('light') ? 'light' : 'dark'
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle('light', theme === 'light')
  document.documentElement.style.colorScheme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#eef2f8' : '#05060a')
}

/** Initialise from localStorage, falling back to the OS preference. */
export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
  const osLight = window.matchMedia('(prefers-color-scheme: light)').matches
  apply(saved ?? (osLight ? 'light' : 'dark'))
}

export function setTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme)
  apply(theme)
  listeners.forEach((fn) => fn(theme))
}

export function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark')
}

export function onThemeChange(fn: (t: Theme) => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

/** React hook for the current theme (re-renders the caller on toggle). */
export function useTheme(): Theme {
  return useSyncExternalStore(
    (fn) => onThemeChange(() => fn()),
    () => getTheme(),
  )
}
