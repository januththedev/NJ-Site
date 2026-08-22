interface Props {
  eyebrow?: string
  title: string
  align?: 'center' | 'left'
  className?: string
}

/** Section header with staggered fade-up reveal (scroll-triggered). */
export default function SectionHeading({ eyebrow, title, align = 'center', className = '' }: Props) {
  return (
    <div className={`mb-12 ${align === 'center' ? 'text-center' : 'text-left'} ${className}`}>
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-glow-cyan" data-anim>
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-balance text-3xl font-bold text-white sm:text-4xl lg:text-[2.75rem]" data-anim>
        {title}
      </h2>
      <div className={`hairline mt-6 max-w-xs ${align === 'center' ? 'mx-auto' : ''}`} />
    </div>
  )
}
