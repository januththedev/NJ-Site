import MiniModel from '../three/MiniModel'

interface Props {
  eyebrow: string
  title: string
  subtitle?: string
  model?: 'island' | 'prism'
}

/** Sub-page header with a small rotating 3D accent. */
export default function PageHero({ eyebrow, title, subtitle, model = 'prism' }: Props) {
  return (
    <section className="relative overflow-hidden pb-10 pt-36">
      <div className="container-x grid items-center gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="chip mb-5 font-semibold uppercase tracking-[0.25em] text-glow-cyan">{eyebrow}</p>
          <h1 className="font-display text-balance text-4xl font-bold leading-tight text-white sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-4 max-w-xl leading-relaxed text-slate-400">{subtitle}</p>}
        </div>
        <MiniModel model={model} className="hidden h-[240px] lg:block" cameraPosition={[0, 0.8, 5]} modelY={model === 'island' ? -0.9 : -0.3} modelScale={model === 'island' ? 0.75 : 0.85} speed={0.7} />
      </div>
      <div className="hairline mt-12" />
    </section>
  )
}
