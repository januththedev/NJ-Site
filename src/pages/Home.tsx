import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Award, FlaskConical, Lightbulb, MapPin, Sparkles } from 'lucide-react'
import { ContactShadows } from '@react-three/drei'
import ModelStage from '../components/three/ModelStage'
import OpenBook from '../components/three/OpenBook'
import ExamPaper from '../components/three/ExamPaper'
import LankaMap from '../components/three/LankaMap'
import SpotlightCard from '../components/ui/SpotlightCard'

import SectionHeading from '../components/ui/SectionHeading'
import StatCounter from '../components/ui/StatCounter'
import MagneticButton from '../components/ui/MagneticButton'
import PosterFrame from '../components/ui/PosterFrame'
import FaqAccordion from '../components/ui/FaqAccordion'
import { useGsapContext, gsap, ScrollTrigger } from '../hooks/useGsapContext'
import { getHomeData, scheduleHighlights, cards, practicalsBand, ctaBand } from '../data/home'
import { getClassesData } from '../data/classes'
import { getReviewsData } from '../data/reviews'
import { useContent } from '../content/store'
import { faqs } from '../data/helpingHand'

export default function Home() {
  const content = useContent()
  const { hero, aboutTeaser, coverage } = getHomeData(content)
  const classes = getClassesData(content)
  const { topReviews } = getReviewsData(content)
  const root = useRef<HTMLElement>(null)
  const bookHover = useRef(false)
  const paperZone = useRef<HTMLDivElement>(null)
  const [gradeKey, setGradeKey] = useState(0)

  useGsapContext(root, () => {
    // cinematic hero sequence: staggered reveals + ambient light sweep
    gsap.fromTo(
      '[data-hero-line]',
      { yPercent: 120, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.14, ease: 'power4.out', delay: 0.25 },
    )
    gsap.fromTo('[data-hero-sub]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, delay: 0.9, ease: 'power3.out' })
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

    // Papers card grading — red-pen animation on first scroll into view
    ScrollTrigger.create({
      trigger: paperZone.current ?? undefined,
      start: 'top 70%',
      once: true,
      onEnter: () => setGradeKey((k) => k + 1),
    })
  })

  return (
    <div ref={root as React.RefObject<HTMLDivElement>} className="relative z-10">
      {/* ── Cinematic hero (rocket lives behind on the right) ─────── */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-28">
        <div className="pointer-events-none absolute inset-0" data-sweep aria-hidden>
          <div className="absolute left-0 top-1/3 h-[40vh] w-[60vw] -rotate-12 bg-gradient-to-r from-transparent via-glow-blue/10 to-transparent blur-3xl" />
        </div>

        <div className="container-x">
          <div className="relative z-10 max-w-2xl text-center lg:text-left">
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
        </div>

        {/* scroll hint toward the rocket */}
        <div data-hero-sub className="absolute bottom-8 right-[8%] hidden items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-500 lg:flex">
          <Lightbulb className="h-4 w-4 text-glow-amber" /> scroll to approach the rocket
        </div>
      </section>

      {/* ── About teaser ───────────────────────────────────────────── */}
      <section className="container-x mt-16 grid items-center gap-10 sm:mt-20 lg:mt-24 lg:grid-cols-2">
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
          <SpotlightCard className="grid gap-6 p-8 sm:grid-cols-3 sm:p-10">
            {aboutTeaser.stats.map((s) => (
              <div key={s.label} className="text-center">
                <StatCounter value={s.value} label={s.label} />
              </div>
            ))}
          </SpotlightCard>
        </div>
      </section>

      {/* ── Two interactive 3D cards ───────────────────────────────── */}
      <section className="container-x mt-16 sm:mt-20 lg:mt-28">
        <SectionHeading eyebrow="What we cover" title="Learn Smarter. Score Higher." />
        <div className="grid gap-6 lg:grid-cols-2" data-rise>
          {cards.map((card) => (
            <SpotlightCard key={card.id} className="overflow-hidden p-0">
              <div
                className="h-[300px] w-full"
                onPointerEnter={() => {
                  bookHover.current = true
                  if (card.model === 'paper') setGradeKey((k) => k + 1)
                }}
                onPointerLeave={() => (bookHover.current = false)}
              >
                <ModelStage cameraPosition={[0, 0.35, 4]} fov={42} ariaLabel={card.title}>
                  <ambientLight intensity={0.85} />
                  <directionalLight position={[4, 6, 4]} intensity={1.6} color="#dceaff" />
                  <pointLight position={[-3, 1, 2]} intensity={14} color="#38e8ff" distance={14} />
                  {card.model === 'book' && <OpenBook hoverRef={bookHover} />}
                  {card.model === 'paper' && <ExamPaper trigger={gradeKey} />}
                  <ContactShadows position={[0, -1.05, 0]} opacity={0.42} scale={5} blur={2.6} far={2.2} color="#000814" />
                </ModelStage>
              </div>
              <div ref={card.model === 'paper' ? paperZone : undefined} className="p-7 pt-2">
                <h3 className="font-display text-lg font-bold text-white">{card.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{card.body}</p>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* ── Class schedule highlights (kept) ───────────────────────── */}
      <section className="container-x mt-16 sm:mt-20 lg:mt-28">
        <SectionHeading eyebrow={scheduleHighlights.kicker} title={scheduleHighlights.title} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" data-rise>
          {classes.posters.map((p) => (
            <PosterFrame key={p.src} src={p.src} label={p.label} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <MagneticButton to="/classes">View Full Schedule</MagneticButton>
        </div>
      </section>

      {/* ── Practical sessions ────────────────────────────────────── */}
      <section id="practicals" className="relative mt-20 overflow-hidden border-y border-white/5 bg-gradient-to-b from-night-900/40 to-transparent py-12 sm:py-16 lg:mt-32 lg:py-20">
        <div className="container-x" data-rise>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-glow-violet">
              <FlaskConical className="h-3.5 w-3.5" /> {practicalsBand.kicker}
            </p>
            <h2 className="font-display text-balance text-4xl font-bold leading-tight text-white sm:text-5xl">
              Come, let&apos;s learn physics with <span className="text-gradient">practicals.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg leading-relaxed text-slate-400">{practicalsBand.body}</p>
            <div className="mt-8 flex justify-center">
              <MagneticButton to="/helping-hand">
                Explore Sessions <ArrowRight className="h-4 w-4" />
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── Island-wide coverage — 3D Sri Lanka map with 27 pins ──── */}
      <section className="container-x mt-20 sm:mt-24 lg:mt-32">
        <SectionHeading eyebrow={coverage.kicker} title={coverage.title} />
        <p className="mx-auto -mt-6 mb-10 max-w-xl text-center text-slate-400">{coverage.body}</p>
        <div className="glass mx-auto max-w-3xl rounded-[2rem] p-4" data-rise>
          <ModelStage height="460px" cameraPosition={[0, 2.2, 23]} fov={38} ariaLabel="3D map of Sri Lanka with 27 glowing exam hall pins">
            <ambientLight intensity={0.7} />
            <directionalLight position={[4, 7, 5]} intensity={1.4} color="#cfe4ff" />
            <pointLight position={[-4, 3, 3]} intensity={20} color="#38e8ff" distance={16} />
            <LankaMap />
          </ModelStage>
        </div>
        <div className="mt-8 flex justify-center">
          <MagneticButton to="/exams" variant="ghost">
            <MapPin className="h-4 w-4" /> Find your nearest centre
          </MagneticButton>
        </div>
      </section>

      {/* ── FAQ (kept) ─────────────────────────────────────────────── */}
      <section className="container-x mt-20 sm:mt-24 lg:mt-32">
        <SectionHeading eyebrow="Questions about Physics Class" title="FAQ – We'll give you a hand!" />
        <FaqAccordion items={faqs} />
      </section>

      {/* ── Student reviews (bottom of homepage, 3 featured) ──────── */}
      <section className="container-x mt-20 sm:mt-24 lg:mt-32">
        <SectionHeading eyebrow="Student Review" title="Real Stories, Real Results" />
        <div className="grid gap-5 md:grid-cols-3" data-rise>
          {topReviews.slice(0, 3).map((r) => (
            <SpotlightCard key={r.name} className="flex flex-col p-7">
              {r.rank && (
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-glow-amber/30 bg-glow-amber/10 px-3 py-1 text-xs font-bold text-glow-amber">
                  <Award className="h-3.5 w-3.5" /> Island Rank {r.rank}
                </span>
              )}
              <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-400">“{r.quote}”</p>
              <footer className="mt-5 border-t border-white/5 pt-4 font-display text-sm font-bold text-white">
                {r.name} <span className="font-normal text-slate-500">· {r.year}</span>
              </footer>
            </SpotlightCard>
          ))}
        </div>
        <div className="mt-9 text-center">
          <MagneticButton to="/reviews" variant="ghost">
            See All Reviews
          </MagneticButton>
        </div>
      </section>

      {/* ── CTA band above the footer rocket ───────────────────────── */}
      <section className="container-x mb-8 mt-20 sm:mt-24 lg:mt-32">
        <div className="glass-strong relative overflow-hidden rounded-[2rem] p-10 text-center sm:p-14" data-rise>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_circle_at_50%_-20%,rgba(56,232,255,0.15),transparent)]" />
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">{ctaBand.header}</h2>
          <p className="mx-auto mt-3 max-w-md text-slate-400">{ctaBand.sub}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <MagneticButton to="/contact">Contact Now</MagneticButton>
            <MagneticButton to="/student-login" variant="ghost">
              Find Your Institute
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* Rocket stage — open space where the scroll-journey rocket lands
          dead-center, just above the footer (rendered by the fixed canvas) */}
      <div aria-hidden className="h-[58vh]" />
    </div>
  )
}
