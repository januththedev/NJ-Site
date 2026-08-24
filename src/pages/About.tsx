import { useRef } from 'react'
import { GraduationCap, MapPin, Phone, Mail } from 'lucide-react'
import PageHero from '../components/ui/PageHero'
import SpotlightCard from '../components/ui/SpotlightCard'
import SectionHeading from '../components/ui/SectionHeading'
import StatCounter from '../components/ui/StatCounter'
import { useGsapContext, gsap } from '../hooks/useGsapContext'
import { about, resultsWall } from '../data/about'

export default function About() {
  const root = useRef<HTMLDivElement>(null)

  useGsapContext(root, () => {
    gsap.utils.toArray<HTMLElement>('[data-rise]').forEach((el) => {
      gsap.fromTo(el, { y: 42, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%' } })
    })
    gsap.utils.toArray<HTMLElement>('[data-meter]').forEach((el) => {
      const fill = el.querySelector<HTMLElement>('[data-fill]')
      if (!fill) return
      gsap.fromTo(fill, { width: '0%' }, { width: '100%', duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } })
    })
  })

  return (
    <div ref={root}>
      <PageHero eyebrow="About me" title={about.name} subtitle={about.role} model="person" />

      {/* Results wall — island ranks */}
      <section className="container-x mt-16">
        <SectionHeading eyebrow="2024 A/L" title="Island Top Ranks — 01 · 03 · 10" />
        <div className="grid gap-5 sm:grid-cols-3">
          {resultsWall.map((r) => (
            <SpotlightCard key={r.rank} className="p-8 text-center">
              <p className="text-gradient-warm font-display text-6xl font-bold">{r.rank}</p>
              <p className="mt-3 font-display text-lg font-semibold text-white">{r.name}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{r.year} · Island Rank</p>
            </SpotlightCard>
          ))}
        </div>
        <StatCounter className="mt-12 text-center" value={1000} suffix="+" label="Students guided past the A/L mark" />
      </section>

      {/* Bio */}
      <section className="container-x mt-24 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <SpotlightCard className="p-8">
          <GraduationCap className="h-9 w-9 text-glow-cyan" strokeWidth={1.5} />
          <h3 className="mt-4 font-display text-xl font-bold text-white">The Journey</h3>
          <p className="mt-4 text-sm leading-loose text-slate-400" lang="si">
            {about.bioSi}
          </p>
          <ul className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm text-slate-300">
            <li className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-glow-cyan" /> {about.locations.join(' · ')}
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-glow-cyan" /> Hotline: +94 33 221 8614
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-glow-cyan" /> physicslk@gmail.com
            </li>
          </ul>
        </SpotlightCard>

        <div>
          <SectionHeading align="left" eyebrow="The Guiding Star" title="Sri Lanka's No.1 Physics Teacher" className="mb-6" />
          <p data-rise className="leading-relaxed text-slate-400">
            {about.guidingStar.body}
          </p>
          <p data-rise className="mt-5 leading-loose text-slate-400" lang="si">
            {about.approachSi}
          </p>

          {/* Skill meters */}
          <div className="mt-9 space-y-5" data-rise>
            {about.skills.map((s) => (
              <div key={s.label} data-meter>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-300">{s.label}</span>
                  <span className="font-display font-bold text-glow-cyan">{s.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-night-700">
                  <div data-fill className="h-full rounded-full bg-gradient-to-r from-glow-blue via-glow-cyan to-glow-violet" style={{ width: '100%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x mt-20">
        <div className="glass rounded-3xl p-8 text-center" data-rise>
          <p className="font-display text-lg text-slate-200">{about.includes}</p>
          <p className="mt-4 text-slate-500" lang="si">
            {about.everyYearSi}
          </p>
        </div>
      </section>
    </div>
  )
}
