import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  suffix?: string
  label?: string
  className?: string
}

/** Counts up to `value` the first time it scrolls into view. */
export default function StatCounter({ value, suffix = '', label, className = '' }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value)
      return
    }

    let raf = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const dur = 1400
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / dur)
          const eased = 1 - Math.pow(1 - t, 3)
          setDisplay(Math.round(eased * value))
          if (t < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value])

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      <span className="font-display text-4xl font-bold text-white sm:text-5xl">
        {display}
        {suffix}
      </span>
      {label && <p className="mt-2 text-sm text-slate-400">{label}</p>}
    </div>
  )
}
