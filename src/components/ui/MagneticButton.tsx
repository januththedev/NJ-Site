import { Link } from 'react-router-dom'
import { useMagnetic } from '../../hooks/useMagnetic'

interface Props {
  to?: string
  href?: string
  external?: boolean
  children: React.ReactNode
  variant?: 'primary' | 'ghost'
  className?: string
}

/** Magnetic button — pulls toward the cursor, springs back on leave. */
export default function MagneticButton({ to, href, external, children, variant = 'primary', className = '' }: Props) {
  const { onMouseMove, onMouseLeave } = useMagnetic<HTMLDivElement>(0.3)
  const cls = `${variant === 'primary' ? 'btn-primary' : 'btn-ghost'} ${className}`
  const inner =
    variant === 'primary' ? (
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    ) : (
      <>{children}</>
    )

  return (
    <div className="inline-block" onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      {to ? (
        <Link to={to} className={cls}>
          {inner}
        </Link>
      ) : (
        <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className={cls}>
          {inner}
        </a>
      )}
    </div>
  )
}
