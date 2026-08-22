import { useTilt } from '../../hooks/useTilt'

interface Props {
  children: React.ReactNode
  className?: string
  maxDeg?: number
}

/** Glass card with cursor-following radial light and 3D tilt (perspective: 1000px). */
export default function SpotlightCard({ children, className = '', maxDeg }: Props) {
  const { onMouseMove, onMouseLeave } = useTilt<HTMLDivElement>(maxDeg)
  return (
    <div onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} className={`spotlight-card ${className}`}>
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
}
