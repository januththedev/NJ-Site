import { useEffect, useRef, useState } from 'react'

/**
 * Auto-hide dock: returns [hidden, ref]. Hides after scrolling down past a
 * threshold, reveals on any upward scroll. Pairs with a CSS translate-y.
 */
export function useAutoHideDock(threshold = 90) {
  const ref = useRef<HTMLElement | null>(null)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    let ticking = false

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        if (y > threshold && y > lastY + 2) setHidden(true)
        else if (y < lastY - 2 || y <= threshold) setHidden(false)
        lastY = y
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return { hidden, ref }
}
