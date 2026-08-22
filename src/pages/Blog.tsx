import { ArrowUpRight, CalendarDays } from 'lucide-react'
import PageHero from '../components/ui/PageHero'
import SpotlightCard from '../components/ui/SpotlightCard'
import { posts } from '../data/blog'

export default function Blog() {
  return (
    <div>
      <PageHero eyebrow="Blog" title="News & Highlights from NJ Physics" />

      <section className="container-x mt-8 grid gap-5 md:grid-cols-3">
        {posts.map((p) => (
          <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="group">
            <SpotlightCard className="flex h-full flex-col p-7 transition-colors group-hover:border-glow-cyan/40">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <CalendarDays className="h-3.5 w-3.5" /> {p.date}
                </span>
                <ArrowUpRight className="h-4 w-4 text-glow-cyan transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <h2 className="mt-4 font-display text-lg font-bold leading-snug text-white">{p.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400" lang="si">
                {p.excerpt}
              </p>
              {p.body && <p className="mt-3 border-t border-white/5 pt-3 text-xs leading-relaxed text-slate-500">{p.body}</p>}
            </SpotlightCard>
          </a>
        ))}
      </section>
    </div>
  )
}
