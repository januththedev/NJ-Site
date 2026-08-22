import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useLocation } from 'react-router-dom'
import RocketScene from './RocketScene'
import { gsap } from '../../hooks/useGsapContext'
import { getLenis } from '../layout/SmoothScroll'

type FlightWindow = Window & { __startFlight?: () => void; __flightActive?: boolean }

/**
 * Global fixed canvas hosting the scroll-journey rocket (HOME PAGE ONLY).
 * - Sits behind the UI (z-0); raises above content (z-40) while launching so
 *   the rocket stays locked center while the page scrolls past (parallax).
 * - Invisible click zones over the rocket: top-right at page top (desktop),
 *   dead-center above the footer (all viewports) — tap to blast off.
 */
export default function RocketCanvas() {
  const { pathname } = useLocation()
  const [launching, setLaunching] = useState(false)
  const [nearTop, setNearTop] = useState(true)
  const [nearBottom, setNearBottom] = useState(false)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        const max = document.documentElement.scrollHeight - window.innerHeight
        setNearTop(y < window.innerHeight * 0.55)
        setNearBottom(max > 0 && y > max - window.innerHeight * 0.75)
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

  const dimmed = !nearTop && !nearBottom

  // The rocket journey belongs to the landing page only
  if (pathname !== '/') return null

  return (
    <>
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 transition-opacity duration-700 ${
          launching ? 'z-40 opacity-100' : dimmed ? 'z-0 opacity-25' : 'z-0 opacity-100'
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
                ;(window as FlightWindow).__flightActive = false
                setLaunching(false)
              }}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Click zones over the rocket — top-right at page top (desktop), and
          dead-center above the footer on every viewport (tap = blast off) */}
      {!launching && (
        <>
          <button
            onClick={launch}
            aria-label="Launch rocket — scroll back to top"
            className={`group absolute right-[4%] top-[16%] z-20 hidden h-56 w-44 lg:block transition-opacity duration-500 ${
              nearTop && !nearBottom ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <span className="absolute inset-x-6 bottom-2 mx-auto block h-8 rounded-full bg-glow-cyan/0 blur-md transition-all duration-500 group-hover:bg-glow-cyan/25" />
          </button>
          <button
            onClick={launch}
            aria-label="Launch rocket — scroll back to top"
            className={`group absolute bottom-[30vh] left-1/2 z-20 h-64 w-40 -translate-x-1/2 sm:h-72 sm:w-48 transition-opacity duration-500 ${
              nearBottom ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <span className="absolute inset-x-4 bottom-4 mx-auto block h-10 rounded-full bg-glow-amber/0 blur-lg transition-all duration-500 group-hover:bg-glow-amber/30" />
          </button>
        </>
      )}
    </>
  )
}
