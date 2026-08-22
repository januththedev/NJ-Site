import { GraduationCap, LogIn, UserPlus } from 'lucide-react'
import PageHero from '../components/ui/PageHero'
import SpotlightCard from '../components/ui/SpotlightCard'
import SectionHeading from '../components/ui/SectionHeading'
import { studentLogin } from '../data/login'

/**
 * Student portals. The four login URLs are external systems that must keep
 * their exact original addresses — they are plain anchors, never router links.
 */
export default function StudentLogin() {
  return (
    <div>
      <PageHero eyebrow={studentLogin.kicker} title={studentLogin.title} />

      <section className="container-x mt-6">
        <div className="mb-10 flex flex-wrap justify-center gap-2.5">
          {studentLogin.chips.map((c) => (
            <span key={c} className="chip">
              {c}
            </span>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {studentLogin.institutes.map((inst) => (
            <SpotlightCard key={inst.loginUrl} className="flex h-full flex-col p-7 text-center">
              <GraduationCap className="mx-auto h-9 w-9 text-glow-cyan" strokeWidth={1.5} />
              <h3 className="mt-4 flex-1 font-display text-lg font-bold leading-snug text-white">{inst.name}</h3>
              <a href={inst.loginUrl} target="_blank" rel="noreferrer" className="btn-primary mt-6 w-full !py-2.5 text-xs">
                <LogIn className="h-4 w-4" /> Login Now
              </a>
              {inst.registerUrl && (
                <a href={inst.registerUrl} target="_blank" rel="noreferrer" className="btn-ghost mt-3 w-full !py-2.5 text-xs">
                  <UserPlus className="h-4 w-4" /> New Register
                </a>
              )}
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* Call centre */}
      <section className="container-x mt-20 pb-4">
        <SectionHeading eyebrow="Call Centre" title="තාක්ෂණික සහාය අවශ්‍යද?" />
        <p className="mx-auto -mt-6 mb-8 max-w-2xl text-center text-sm leading-relaxed text-slate-400" lang="si">
          {studentLogin.callCentreSi}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {studentLogin.numbers.map((n) => (
            <a key={n.href} href={n.href} className="glass rounded-2xl px-8 py-5 font-display text-xl font-bold text-white transition-colors hover:border-glow-cyan/40 hover:text-glow-cyan">
              {n.display}
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
