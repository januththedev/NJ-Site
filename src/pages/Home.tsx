import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpenCheck, FlaskConical, GraduationCap, Lightbulb, PenLine, Sparkles } from 'lucide-react'
import ModelStage from '../components/three/ModelStage'
import StudyIsland from '../components/three/StudyIsland'
import PrismScene from '../components/three/PrismScene'
import VelocityTicker from '../components/ui/VelocityTicker'
import SpotlightCard from '../components/ui/SpotlightCard'
import SectionHeading from '../components/ui/SectionHeading'
import KineticText from '../components/ui/KineticText'
import StatCounter from '../components/ui/StatCounter'
import TelemetryConsole from '../components/ui/TelemetryConsole'
import MagneticButton from '../components/ui/MagneticButton'
import PosterFrame from '../components/ui/PosterFrame'
import FaqAccordion from '../components/ui/FaqAccordion'
import { useGsapContext, gsap } from '../hooks/useGsapContext'
import { hero, aboutTeaser, scheduleHighlights, monthlyTutes, practicalsBand } from '../data/home'
import { marqueeWords } from '../data/site'
import { classes } from '../data/classes'
import { exams } from '../data/exams'
import { topReviews } from '../data/reviews'
import { faqs } from '../data/helpingHand'

const pillars = [
  { icon: BookOpenCheck, title: 'Theory', body: 'Full syllabus theory taught practically — no rote learning, real understanding.' },
  { icon: PenLine, title: 'Revision', body: 'Structured revision sessions with short notes that make every chapter stick.' },
  { icon: GraduationCap, title: 'Paper', body: 'MCQ & structured paper discussions, mock exams with marking and A/B/C/S grading.' },
  { icon: FlaskConical, title: 'Practicals', body: 'See the laws come alive — dedicated practical demonstrations and sessions.' },
]

export default function Home() {
  const root = useRef<HTMLElement>(null)

  useGsapContext(root, () => {
    // cinematic hero sequence: staggered reveals + ambient light sweep
    gsap.fromTo(
      '[data-hero-line]',
      { yPercent: 120, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.14, ease: 'power4.out', delay: 0.25 },
    )
    gsap.fromTo('[data-hero-sub]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, delay: 0.9, ease: 'power3.out' })
    gsap.fromTo('[data-hero-canvas]', { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 1.6, delay: 0.5, ease: 'power3.out' })
    gsap.fromTo(
      '[data-sweep]',
      { xPercent: -30, opacity: 0 },
      { xPercent: 130, opacity: 1, duration: 2.2, delay: 0.4, ease: 'power2.inOut' },
    )
    gsap.utils.toArray<HTMLElement>('[data-rise]').forEach((el) => {
      gsap.fromTo(el, { y: 42, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%' },
      })
    })
  })

  return (
    <div ref={root as React.RefObject<HTMLDivElement>}>
      {/* ── Cinematic hero ─────────────────────────────────────────── */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-28">
        <div className="pointer-events-none absolute inset-0" data-sweep aria-hidden>
          <div className="absolute left-0 top-1/3 h-[40vh] w-[60vw] -rotate-12 bg-gradient-to-r from-transparent via-glow-blue/10 to-transparent blur-3xl" />
        </div>

        <div className="container-x grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative z-10 text-center lg:text-left">
            <p data-hero-line className="chip mb-6 overflow-hidden font-semibold uppercase tracking-[0.25em] text-glow-cyan">
              <Sparkles className="h-3.5 w-3.5" /> {hero.eyebrow}
            </p>
            <h1 className="font-display text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl xl:text-7xl">
              <span className="block overflow-hidden pb-1">
                <span data-hero-line className="block text-white">
                  {hero.titleTop}
                </span>
              </span>
              <span className="block overflow-hidden pb-2">
                <span data-hero-line className="text-gradient block">
                  {hero.titleBottom}
                </span>
              </span>
            </h1>
            <p data-hero-sub className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-400 lg:mx-0">
              {hero.subtitle}
            </p>

            <div data-hero-sub className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <MagneticButton to="/classes">
                Join the Class <ArrowRight className="h-4 w-4" />
              </MagneticButton>
              <MagneticButton to="/student-login" variant="ghost">
                Student Portals
              </MagneticButton>
            </div>

            <div data-hero-sub className="mt-10 flex flex-wrap justify-center gap-x-10 gap-y-6 lg:justify-start">
              {hero.stats.map((s) => (
                <StatCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
              ))}
            </div>
          </div>

          <div data-hero-canvas className="relative h-[46svh] min-h-[340px] lg:h-[74svh]">
            <ModelStage cameraPosition={[0, 1.6, 7]} fov={40} ariaLabel="Floating physics study island with textbooks, calculator, pendulum and a glowing lightbulb">
              <ambientLight intensity={0.65} />
              <directionalLight position={[5, 8, 5]} intensity={1.5} color="#dceaff" />
              <pointLight position={[-4, 2, 3]} intensity={18} color="#38e8ff" distance={16} />
              <pointLight position={[0, 3.4, 1]} intensity={26} color="#ffb454" distance={7} />
              <StudyIsland position={[0, -1.15, 0]} scale={1.05} />
            </ModelStage>
            <div className="glass pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-slate-400">
              <Lightbulb className="h-3.5 w-3.5 text-glow-amber" /> Click the bulb for your lightbulb moment
            </div>
          </div>
        </div>
      </section>

      <VelocityTicker words={marqueeWords} />

      {/* ── About teaser ───────────────────────────────────────────── */}
      <section className="container-x mt-24 grid items-center gap-12 lg:grid-cols-2">
        <div data-rise>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-glow-cyan">{aboutTeaser.eyebrow}</p>
          <h2 className="font-display text-balance text-3xl font-bold leading-tight text-white sm:text-4xl">{aboutTeaser.title}</h2>
          <p className="mt-4 inline-block rounded-xl border border-glow-amber/20 bg-glow-amber/10 px-4 py-2 font-display text-sm font-semibold text-glow-amber">
            {aboutTeaser.rankLine}
          </p>
          <p className="mt-5 leading-relaxed text-slate-400">{aboutTeaser.bodySi}</p>
          <div className="mt-8">
            <MagneticButton to="/about" variant="ghost">
              About Me <ArrowRight className="h-4 w-4" />
            </MagneticButton>
          </div>
        </div>
        <div data-rise>
          <TelemetryConsole />
        </div>
      </section>

      {/* ── Pillars (spotlight cards) ─────────────────────────────── */}
      <section className="container-x mt-28">
        <SectionHeading eyebrow="What we cover" title="Learn Smarter. Score Higher." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" data-rise>
          {pillars.map((p) => (
            <SpotlightCard key={p.title} className="p-7">
              <p.icon className="h-8 w-8 text-glow-cyan" strokeWidth={1.6} />
              <h3 className="mt-5 font-display text-lg font-bold text-white">{p.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{p.body}</p>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* ── Kinetic scrub statement ───────────────────────────────── */}
      <KineticText className="mt-24" text="Physics is not memorised. It is understood." />

      {/* ── Schedule + monthly tutes preview ──────────────────────── */}
      <section className="container-x mt-24 grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <SectionHeading align="left" eyebrow={scheduleHighlights.kicker} title={scheduleHighlights.title} />
          <div className="grid gap-5 sm:grid-cols-2" data-rise>
            {classes.posters.slice(0, 2).map((p) => (
              <PosterFrame key={p.src} src={p.src} label={p.label} />
            ))}
          </div>
          <div className="mt-6">
            <MagneticButton to="/classes">View Full Schedule</MagneticButton>
          </div>
        </div>
        <div className="glass rounded-3xl p-7" data-rise>
          <h3 className="font-display text-xl font-bold text-white">{monthlyTutes.title}</h3>
          <ul className="mt-6 space-y-3">
            {monthlyTutes.items.map((m) => (
              <li key={m} className="flex items-center justify-between rounded-xl border border-white/5 bg-night-800/60 px-4 py-3 text-sm text-slate-300">
                {m}
                <span className="chip !px-3 !py-1 text-[10px]">NEW</span>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <MagneticButton to="/contact" variant="ghost">
              {monthlyTutes.cta}
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ── Practicals band (prism) ───────────────────────────────── */}
      <section className="relative mt-32 overflow-hidden border-y border-white/5 bg-gradient-to-b from-night-900/40 to-transparent py-20">
        <div className="container-x grid items-center gap-10 lg:grid-cols-2">
          <div className="order-2 h-[320px] sm:h-[380px] lg:order-1">
            <ModelStage cameraPosition={[0, 0.4, 6]} fov={42} ariaLabel="Glass prism splitting white light into a rainbow spectrum">
              <ambientLight intensity={0.55} />
              <directionalLight position={[3, 5, 4]} intensity={1.1} />
              <pointLight position={[-4, 1, 2]} intensity={14} color="#ffffff" distance={12} />
              <PrismScene position={[0, -0.35, 0]} rotation={[0, 0.35, 0]} speed={0.8} />
            </ModelStage>
          </div>
          <div className="order-1 text-center lg:order-2 lg:text-left" data-rise>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-glow-violet">{practicalsBand.kicker}</p>
            <h2 className="font-display text-balance text-4xl font-bold leading-tight text-white sm:text-5xl">
              Come, let&apos;s learn physics with <span className="text-gradient">practicals.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg leading-relaxed text-slate-400 lg:mx-0">{practicalsBand.body}</p>
            <div className="mt-8 flex justify-center lg:justify-start">
              <MagneticButton to="/helping-hand">
                Explore Sessions <ArrowRight className="h-4 w-4" />
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── Exam centres strip ────────────────────────────────────── */}
      <section className="container-x mt-24 text-center" data-rise>
        <SectionHeading eyebrow="Islandwide" title={`${exams.centres.length} Exam Halls Across the Island`} />
        <div className="flex flex-wrap justify-center gap-2.5">
          {exams.centres.slice(0, 12).map((c) => (
            <Link key={c.url} to="/exams" className="chip transition-colors hover:border-glow-cyan/50 hover:text-white">
              {c.name} · {c.town}
            </Link>
          ))}
          <Link to="/exams" className="chip !border-glow-cyan/40 text-glow-cyan hover:bg-glow-cyan/10">
            +{exams.centres.length - 12} more →
          </Link>
        </div>
      </section>

      {/* ── Top reviews preview ───────────────────────────────────── */}
      <section className="container-x mt-28">
        <SectionHeading eyebrow="Student Review" title="Real Stories, Real Results" />
        <div className="grid gap-5 md:grid-cols-3" data-rise>
          {topReviews.map((r) => (
            <SpotlightCard key={r.name} className="flex flex-col p-7">
              {r.rank && (
                <span className="text-gradient-warm font-display text-4xl font-bold">
                  #{r.rank}
                  <span className="ml-2 text-xs font-medium uppercase tracking-widest text-slate-500">Island Rank</span>
                </span>
              )}
              <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-400">“{r.quote}”</p>
              <footer className="mt-5 border-t border-white/5 pt-4 text-sm font-semibold text-white">
                {r.name} <span className="font-normal text-slate-500">· {r.year}</span>
              </footer>
            </SpotlightCard>
          ))}
        </div>
        <div className="mt-8 text-center">
          <MagneticButton to="/reviews" variant="ghost">
            See all reviews
          </MagneticButton>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────── */}
      <section className="container-x mt-28">
        <SectionHeading eyebrow="Questions about Physics Class" title="FAQ – We'll give you hand!" />
        <FaqAccordion items={faqs} />
      </section>

      {/* ── Contact strip ─────────────────────────────────────────── */}
      <section className="container-x mt-28">
        <div className="glass-strong relative overflow-hidden rounded-[2rem] p-10 text-center sm:p-14" data-rise>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_circle_at_50%_-20%,rgba(56,232,255,0.15),transparent)]" />
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Ready to Learn with NJ Sir?</h2>
          <p className="mx-auto mt-3 max-w-md text-slate-400">A/L Physics with NJ Sir — Theory · Revision · Paper · Practicals.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <MagneticButton to="/contact">Contact Now</MagneticButton>
            <MagneticButton to="/student-login" variant="ghost">
              Find Your Institute
            </MagneticButton>
          </div>
        </div>
      </section>
    </div>
  )
}
