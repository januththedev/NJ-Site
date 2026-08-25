import { Award } from 'lucide-react'
import PageHero from '../components/ui/PageHero'
import SpotlightCard from '../components/ui/SpotlightCard'
import SectionHeading from '../components/ui/SectionHeading'
import { getReviewsData } from '../data/reviews'
import { useContent } from '../content/store'

function Stars() {
  return (
    <div className="flex gap-1 text-glow-amber" aria-label="5 star review">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>★</span>
      ))}
    </div>
  )
}

export default function Reviews() {
  const { topReviews, studentReviews } = getReviewsData(useContent())
  return (
    <div>
      <PageHero eyebrow="Reviews" title="See What Our Top Students Say About Me!" />

      {/* Island rank wall */}
      <section className="container-x mt-8">
        <div className="grid gap-5 md:grid-cols-3">
          {topReviews.map((r) => (
            <SpotlightCard key={r.name} className="flex flex-col p-7">
              <div className="flex items-center justify-between">
                {r.rank ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-glow-amber/30 bg-glow-amber/10 px-3 py-1 text-xs font-bold text-glow-amber">
                    <Award className="h-3.5 w-3.5" /> Island Rank {r.rank}
                  </span>
                ) : (
                  <span />
                )}
                <Stars />
              </div>
              <p className="mt-5 flex-1 text-sm leading-relaxed text-slate-400">“{r.quote}”</p>
              <footer className="mt-5 border-t border-white/5 pt-4">
                <p className="font-display text-sm font-bold text-white">{r.name}</p>
                <p className="text-xs text-slate-500">{r.year}</p>
              </footer>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* Sinhala testimonials */}
      <section className="container-x mt-24">
        <SectionHeading eyebrow="Student Review" title="See What Our Valued Students Say" />
        <div className="grid gap-5 md:grid-cols-3">
          {studentReviews.map((r) => (
            <SpotlightCard key={r.name} className="flex flex-col p-7" >
              <img src={r.thumb} alt="" aria-hidden className="h-14 w-14 rounded-full border border-white/10 object-cover" loading="lazy" />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-400" lang="si">
                “{r.quote}”
              </p>
              <footer className="mt-5 border-t border-white/5 pt-4">
                <p className="font-display text-sm font-bold text-white">{r.name}</p>
                <p className="text-xs text-slate-500">{r.year}</p>
              </footer>
            </SpotlightCard>
          ))}
        </div>
      </section>
    </div>
  )
}
