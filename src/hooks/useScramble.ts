import { useEffect, useRef } from 'react'

const GLYPHS = '0123456789ABCDEF#@$%&<>/\\|{}[]+=*'

/**
 * Kinetic text scramble: element text scrambles through hex/ASCII glyphs
 * and decodes left-to-right when it enters the viewport.
 * Set `data-scramble` elements' final text as their textContent.
 */
export function useScramble<T extends HTMLElement>(options?: { duration?: number; once?: boolean }) {
  const ref = useRef<T | null>(null)
  const { duration = 1100, once = true } = options ?? {}

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const finalText = el.textContent ?? ''
    let raf = 0
    let started = false

    const run = () => {
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        const reveal = Math.floor(t * finalText.length)
        let out = finalText.slice(0, reveal)
        for (let i = reveal; i < finalText.length; i++) {
          const ch = finalText[i]
          out += ch === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        }
        el.textContent = out
        if (t < 1) raf = requestAnimationFrame(tick)
        else el.textContent = finalText
      }
      raf = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!started || !once)) {
          started = true
          cancelAnimationFrame(raf)
          run()
          if (once) io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      el.textContent = finalText
    }
  }, [duration, once])

  return ref
}
