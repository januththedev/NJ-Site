import { MapPin, Monitor } from 'lucide-react'
import PageHero from '../components/ui/PageHero'
import PosterFrame from '../components/ui/PosterFrame'
import SectionHeading from '../components/ui/SectionHeading'
import MagneticButton from '../components/ui/MagneticButton'
import { classes } from '../data/classes'

export default function Classes() {
  return (
    <div>
      <PageHero eyebrow="Classes" title={classes.title} subtitle={classes.body} model="prism" />

      <section className="container-x mt-10">
        <div className="flex flex-wrap justify-center gap-3">
          {classes.venues.map((v) => (
            <span key={v.name} className="chip !px-5 !py-2.5 text-sm">
              {v.name === 'ONLINE' ? <Monitor className="h-4 w-4 text-glow-cyan" /> : <MapPin className="h-4 w-4 text-glow-cyan" />}
              <span className="font-display font-semibold text-white">{v.name}</span>
              <span className="text-slate-500">· {v.city}</span>
            </span>
          ))}
        </div>
      </section>

      <section className="container-x mt-16">
        <SectionHeading eyebrow={classes.kicker} title="Class Timetables" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {classes.posters.map((p) => (
            <PosterFrame key={p.src} src={p.src} label={p.label} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <MagneticButton to="/contact">{classes.cta}</MagneticButton>
        </div>
      </section>
    </div>
  )
}
