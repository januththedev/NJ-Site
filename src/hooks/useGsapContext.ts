import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Scoped GSAP context: animations created in the callback are reverted on unmount.
 * Respects prefers-reduced-motion by skipping the callback entirely.
 */
export function useGsapContext(
  scopeRef: React.RefObject<HTMLElement | null>,
  setup: (ctx: { reduced: boolean }) => void,
  deps: unknown[] = [],
) {
  useLayoutEffect(() => {
    const el = scopeRef.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      if (reduced) {
        // Reveal everything immediately, no motion.
        gsap.set('[data-anim]', { opacity: 1, y: 0, clearProps: 'transform' })
        return
      }
      setup({ reduced })
    }, el)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export { gsap, ScrollTrigger }
