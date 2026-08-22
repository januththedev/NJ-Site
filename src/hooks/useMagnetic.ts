import { useCallback } from 'react'
import { gsap } from './useGsapContext'

/**
 * Magnetic physics: the element is gently attracted toward the cursor while
 * hovered and springs back on leave.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.35) {
  const onMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      const el = e.currentTarget
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const rect = el.getBoundingClientRect()
      const dx = e.clientX - (rect.left + rect.width / 2)
      const dy = e.clientY - (rect.top + rect.height / 2)
      gsap.to(el, { x: dx * strength, y: dy * strength, duration: 0.4, ease: 'power3.out' })
    },
    [strength],
  )

  const onMouseLeave = useCallback((e: React.MouseEvent<T>) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' })
  }, [])

  return { onMouseMove, onMouseLeave }
}
