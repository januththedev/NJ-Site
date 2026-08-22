import { useCallback } from 'react'

/**
 * Interactive spotlight card: 3D mouse-tracking tilt (perspective: 1000px)
 * plus radial cursor lighting via --mx/--my custom properties consumed by
 * the .spotlight-card::before gradient.
 */
export function useTilt<T extends HTMLElement>(maxDeg = 8) {
  const onMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      const el = e.currentTarget
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width
      const py = (e.clientY - rect.top) / rect.height
      el.style.setProperty('--mx', `${px * 100}%`)
      el.style.setProperty('--my', `${py * 100}%`)

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const rx = (0.5 - py) * maxDeg
      const ry = (px - 0.5) * maxDeg
      el.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`
    },
    [maxDeg],
  )

  const onMouseLeave = useCallback((e: React.MouseEvent<T>) => {
    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)'
  }, [])

  return { onMouseMove, onMouseLeave }
}
