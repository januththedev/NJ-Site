import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from './useGsapContext'

/**
 * Velocity-sensitive ticker: an infinite marquee whose speed and skew
 * react to scroll velocity. The element should contain two copies of the
 * track content; this hook animates xPercent -50 on repeat.
 */
export function useVelocityTicker<T extends HTMLElement>(baseSpeed = 40) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const tween = gsap.to(el, {
      xPercent: -50,
      repeat: -1,
      ease: 'none',
      duration: el.scrollWidth / 2 / (baseSpeed * 16), // base px/sec → duration
    })

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const v = self.getVelocity()
        const boost = Math.min(4, Math.abs(v) / 900)
        tween.timeScale(1 + boost)
        gsap.to(el, {
          skewX: gsap.utils.clamp(-14, 14, v / -120),
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      },
      onLeave: () => tween.timeScale(1),
      onLeaveBack: () => tween.timeScale(1),
    })

    return () => {
      st.kill()
      tween.kill()
    }
  }, [baseSpeed])

  return ref
}
