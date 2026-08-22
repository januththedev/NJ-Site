import { Send } from 'lucide-react'
import PageHero from '../components/ui/PageHero'
import SpotlightCard from '../components/ui/SpotlightCard'
import { exams } from '../data/exams'

export default function Exams() {
  return (
    <div>
      <PageHero eyebrow="Exams · Location" title={exams.title} subtitle={exams.body} />

      <section className="container-x mt-8 pb-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {exams.centres.map((c, i) => (
            <a key={c.url} href={c.url} target="_blank" rel="noreferrer" className="group">
              <SpotlightCard className="h-full p-5 transition-colors group-hover:border-glow-cyan/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] text-slate-600">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="font-display text-base font-bold text-white">{c.name}</h3>
                    <p className="mt-0.5 text-sm text-slate-400">{c.town}</p>
                  </div>
                  <Send className="mt-1 h-4 w-4 shrink-0 text-glow-cyan transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </SpotlightCard>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
