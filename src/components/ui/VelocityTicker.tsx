import { useVelocityTicker } from '../../hooks/useVelocityTicker'

interface Props {
  words: readonly string[]
  className?: string
}

/** Velocity-sensitive marquee: skews and accelerates with scroll speed. */
export default function VelocityTicker({ words, className = '' }: Props) {
  const ref = useVelocityTicker<HTMLDivElement>()
  const track = words.map((w) => (
    <span key={w} className="mx-6 inline-flex items-center gap-6 whitespace-nowrap font-display text-2xl font-semibold uppercase tracking-wide text-slate-500 sm:text-3xl">
      {w} <span className="text-glow-cyan">✦</span>
    </span>
  ))

  return (
    <div className={`mask-fade-x overflow-hidden border-y border-white/5 py-6 ${className}`} aria-hidden>
      <div ref={ref} className="flex w-max will-change-transform">
        <div className="flex">{track}</div>
        <div className="flex">{track}</div>
      </div>
    </div>
  )
}
