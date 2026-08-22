import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../hooks/useGsapContext'

interface Props {
  text: string
  className?: string
}

/**
 * Kinetic scrub display text: pinned while scrolling, its words fill with
 * gradient color in sync with scroll progression.
 */
export default function KineticText({ text, className = '' }: Props) {
  const wrap = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.querySelectorAll<HTMLElement>('.kt-word').forEach((w) => (w.style.color = '#fff'))
      return
    }

    const ctx = gsap.context(() => {
      const words = el.querySelectorAll('.kt-word')
      gsap.fromTo(
        words,
        { opacity: 0.16 },
        {
          opacity: 1,
          stagger: 0.35,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top top+=72',
            end: '+=140%',
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
          },
        },
      )
      // subtle gradient hue travel across the filled words
      gsap.to(el.querySelector('.kt-fill') ?? el, {
        backgroundPositionX: '100%',
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top+=72', end: '+=140%', scrub: true },
      })
      ScrollTrigger.refresh()
    }, el)
    return () => ctx.revert()
  }, [text])

  return (
    <div ref={wrap} className={`relative flex min-h-[70vh] items-center justify-center ${className}`}>
      <h2 className="kt-fill max-w-5xl bg-gradient-to-r from-glow-cyan via-white to-glow-violet bg-clip-text text-center font-display text-4xl font-bold leading-tight text-transparent sm:text-5xl lg:text-6xl">
        {text.split(' ').map((w, i) => (
          <span key={`${w}-${i}`} className="kt-word inline-block px-1">
            {w}
          </span>
        ))}
      </h2>
    </div>
  )
}
