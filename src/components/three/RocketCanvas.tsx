import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useLocation } from 'react-router-dom'
import RocketScene from './RocketScene'
import { gsap } from '../../hooks/useGsapContext'
import { getLenis } from '../layout/SmoothScroll'

type FlightWindow = Window & { __startFlight?: () => void; __flightActive?: boolean }

/**
 * Fixed canvas hosting the scroll-journey rocket (HOME PAGE ONLY).
 * - Behind the UI (z-0) while browsing; dimmed mid-page; above everything
 *   (z-40) during the launch so the rocket stays in front while the page
 *   scrolls past underneath.
 * - The canvas paints NO backdrop of its own during the flight — the page
 *   scrolling underneath is the background.
 * - The launch button tracks the rocket's projected screen position every
 *   frame, so "click the rocket" works at any size, any scroll position.
 */
export default function RocketCanvas() {
  const { pathname } = useLocation()
  const [launching, setLaunching] = useState(false)
  const [fading, setFading] = useState(false)
  const [nearBottom, setNearBottom] = useState(false)
  const [nearTop, setNearTop] = useState(true)
  // day lighting (light OS scheme) renders the terrain much brighter than the
  // night rig — the mid-page dim has to be stronger there or sections sit
  // behind a green haze
  const [isDay, setIsDay] = useState(
    () => typeof window !== 'undefined' && !window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  const screenRef = useRef({ x: -999, y: -999, visible: false })
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const fn = () => setIsDay(!mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        const max = document.documentElement.scrollHeight - window.innerHeight
        setNearBottom(max > 0 && y > max - window.innerHeight * 0.75)
        setNearTop(y < window.innerHeight * 0.9)
        ticking = false
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // move the click target with the rocket's projected position
  useEffect(() => {
    let raf = 0
    const loop = () => {
      const b = btnRef.current
      const s = screenRef.current
      if (b) {
        const show = !launching && !fading && s.visible
        b.style.opacity = show ? '1' : '0'
        b.style.pointerEvents = show ? 'auto' : 'none'
        if (show || s.visible) b.style.transform = `translate(${s.x}px, ${s.y}px) translate(-50%, -86%)`
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [launching, fading])

  const launch = () => {
    const w = window as FlightWindow
    if (w.__flightActive || !w.__startFlight) return
    w.__flightActive = true
    setLaunching(true)
    w.__startFlight()

    // Exactly 5 seconds, footer → top. GSAP owns the clock; Lenis receives
    // immediate position writes so there is only ever one scroll driver.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo(0, 0)
      return
    }
    const lenis = getLenis()
    const power2InOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
    const proxy = { y: window.scrollY }
    gsap.to(proxy, {
      y: 0,
      duration: 5,
      ease: power2InOut,
      onUpdate: () => {
        if (lenis) lenis.scrollTo(proxy.y, { immediate: true, force: true })
        else window.scrollTo(0, proxy.y)
      },
    })
  }


  // The rocket journey belongs to the landing page only
  if (pathname !== '/') return null

  return (
    <>
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 transition-opacity duration-700 ${
          launching
            ? fading
              ? 'z-40 opacity-0'
              : 'z-40 opacity-100'
            : nearBottom
              ? 'z-0 opacity-100'
              : nearTop || !isDay
                ? 'z-0 opacity-25'
                : 'z-0 opacity-[0.08]' // mid-page in day mode: bright terrain would haze the sections
        }`}
      >
        <Canvas
          dpr={[1, 1.6]}
          camera={{ position: [-13, 3.4, 30], fov: 42, near: 0.1, far: 400 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: true }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <RocketScene
              onFlightEnd={() => {
                setLaunching(false)
                setFading(false)
              }}
              onFinaleFade={() => setFading(true)}
              screenRef={screenRef}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Launch target glued to the rocket's projected position */}
      {!launching && !fading && (
        <button
          ref={btnRef}
          onClick={launch}
          aria-label="Launch rocket — scroll back to top"
          className="group fixed left-0 top-0 z-[35] h-64 w-44 cursor-pointer opacity-0 transition-opacity duration-300"
        >
          {/* subtle pulsing ring so users can tell it's interactive */}
          <span className="absolute bottom-2 left-1/2 h-14 w-28 -translate-x-1/2 rounded-[50%] border border-glow-amber/40 shadow-glow-cyan/20 transition-all duration-500 group-hover:border-glow-amber group-hover:shadow-[0_0_30px_rgba(255,180,84,0.35)]" />
        </button>
      )}
    </>
  )
}
