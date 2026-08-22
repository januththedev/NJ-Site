import { CheckCircle2, Clock, MapPin, User } from 'lucide-react'
import PageHero from '../components/ui/PageHero'
import SpotlightCard from '../components/ui/SpotlightCard'
import SectionHeading from '../components/ui/SectionHeading'
import FaqAccordion from '../components/ui/FaqAccordion'
import MagneticButton from '../components/ui/MagneticButton'
import MiniModel from '../components/three/MiniModel'
import { helpingHand, faqs } from '../data/helpingHand'
import { practicalsBand } from '../data/home'

export default function HelpingHand() {
  return (
    <div>
      <PageHero eyebrow="Helping Hands" title={helpingHand.title} model="prism" />

      {/* Seminar card */}
      <section className="container-x mt-8">
        <SpotlightCard className="grid gap-6 p-8 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <h2 className="font-display text-xl font-bold text-white">{helpingHand.brandTitle}</h2>
            <p className="mt-2 leading-relaxed text-slate-400" lang="si">
              {helpingHand.intro}
            </p>
          </div>
          <ul className="space-y-3 text-sm text-slate-300 sm:min-w-[240px]">
            <li className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-glow-cyan" /> {helpingHand.meta.place}
            </li>
            <li className="flex items-center gap-2.5">
              <User className="h-4 w-4 text-glow-cyan" /> {helpingHand.meta.speaker}
            </li>
            <li className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-glow-cyan" /> {helpingHand.meta.time}
            </li>
          </ul>
        </SpotlightCard>
      </section>

      {/* Free programme details */}
      <section className="container-x mt-20 grid gap-10 lg:grid-cols-2">
        <div data-rise>
          <SectionHeading align="left" eyebrow="Free for every student" title="දිවයින පුරා සියලුම සිසුන් සඳහා" className="mb-6" />
          <ul className="space-y-3">
            {helpingHand.services.map((s) => (
              <li key={s} className="flex items-start gap-3 rounded-xl border border-white/5 bg-night-800/50 px-5 py-4 text-sm leading-relaxed text-slate-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-glow-cyan" />
                <span lang="si">{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div data-rise>
          <h3 className="font-display text-lg font-bold text-glow-amber">{helpingHand.brandLead}</h3>
          <ul className="mt-5 space-y-3">
            {helpingHand.brandPoints.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm leading-relaxed text-slate-400">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-glow-amber" />
                <span lang="si">{p}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-2xl border border-white/5 bg-night-900/60 p-5 text-sm italic leading-relaxed text-slate-500" lang="si">
            {helpingHand.closingSi}
          </p>
        </div>
      </section>

      {/* Practicals prism moment */}
      <section className="container-x mt-24 grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <MiniModel model="prism" className="h-[280px]" cameraPosition={[0, 0.4, 5.4]} modelY={-0.35} speed={0.85} />
        <div data-rise>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-glow-violet">{practicalsBand.kicker}</p>
          <h2 className="font-display text-balance text-3xl font-bold text-white sm:text-4xl">Come, let&apos;s learn physics with practicals.</h2>
          <p className="mt-4 max-w-lg leading-relaxed text-slate-400">{practicalsBand.body}</p>
          <div className="mt-7">
            <MagneticButton to="/contact">Join a Session</MagneticButton>
          </div>
        </div>
      </section>

      {/* Video band */}
      <section className="container-x mt-24">
        <div className="glass-strong relative overflow-hidden rounded-[2rem] p-12 text-center" data-rise>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(500px_circle_at_50%_0%,rgba(139,92,246,0.14),transparent)]" />
          <h2 className="font-display text-3xl font-bold text-white">{helpingHand.videoBand.title}</h2>
          <p className="mt-2 text-slate-400">{helpingHand.videoBand.sub}</p>
          <div className="mt-7 flex justify-center">
            <MagneticButton to="/contact">Contact Now</MagneticButton>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x mt-24">
        <SectionHeading eyebrow="Questions about Physics Class" title="FAQ – We'll give you hand!" />
        <FaqAccordion items={faqs} />
      </section>
    </div>
  )
}
