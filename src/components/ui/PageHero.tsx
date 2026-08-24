import MiniModel from '../three/MiniModel'

interface Props {
  eyebrow: string
  title: string
  subtitle?: string
  model?: 'book' | 'caliper' | 'paper' | 'person' | 'prism' | 'island' | 'map' | 'phone' | 'hall' | 'mentor'
}

/** Sub-page header with a small rotating 3D accent. */
export default function PageHero({ eyebrow, title, subtitle, model = 'book' }: Props) {
  return (
    <section className="relative overflow-hidden pb-10 pt-36">
      <div className="container-x grid items-center gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="chip mb-5 font-semibold uppercase tracking-[0.25em] text-glow-cyan">{eyebrow}</p>
          <h1 className="font-display text-balance text-4xl font-bold leading-tight text-white sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-4 max-w-xl leading-relaxed text-slate-400">{subtitle}</p>}
        </div>
        <MiniModel model={model} className="hidden lg:block" stageHeight="240px" cameraPosition={[0, 0.2, 4.2]} />
      </div>
      <div className="hairline mt-12" />
    </section>
  )
}
