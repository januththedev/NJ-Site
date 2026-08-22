import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../../hooks/useGsapContext'

let lenisInstance: Lenis | null = null
export const getLenis = () => lenisInstance

/** Lenis inertia scrolling driven by the GSAP ticker; ScrollTrigger stays in sync. */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 })
    lenisInstance = lenis
    ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis

    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      lenisInstance = null
    }
  }, [])

  useEffect(() => {
    lenisInstance?.scrollTo(0, { immediate: true })
    window.scrollTo(0, 0)
    ScrollTrigger.refresh()
  }, [pathname])

  return <>{children}</>
}
