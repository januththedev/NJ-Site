import { useState } from 'react'
import { Loader2, MapPin, Navigation, Send } from 'lucide-react'
import PageHero from '../components/ui/PageHero'
import SpotlightCard from '../components/ui/SpotlightCard'
import { exams } from '../data/exams'

/** Great-circle distance in km between two lat/lng points. */
function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export default function Exams() {
  const [nearest, setNearest] = useState<{ idx: number; km: number } | null>(null)
  const [status, setStatus] = useState<'idle' | 'locating' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const findNearest = () => {
    if (!('geolocation' in navigator)) {
      setStatus('error')
      setErrorMsg('Your browser does not support location — browse all centres below.')
      return
    }
    setStatus('locating')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        let best = 0
        let bestKm = Infinity
        exams.centres.forEach((c, i) => {
          const km = haversineKm(latitude, longitude, c.lat, c.lng)
          if (km < bestKm) {
            bestKm = km
            best = i
          }
        })
        setNearest({ idx: best, km: bestKm })
        setStatus('idle')
        requestAnimationFrame(() =>
          document.getElementById(`centre-${best}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
        )
      },
      (err) => {
        setStatus('error')
        setErrorMsg(
          err.code === err.PERMISSION_DENIED
            ? 'Location access was denied — allow it in your browser, or browse all centres below.'
            : 'Could not get your location — please try again.',
        )
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    )
  }

  return (
    <div>
      <PageHero eyebrow="Exams · Location" title={exams.title} subtitle={exams.body} model="paper" />

      {/* nearest-centre locator */}
      <section className="container-x mt-8">
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/5 bg-night-800/50 px-5 py-4">
          <button
            onClick={findNearest}
            disabled={status === 'locating'}
            className="group inline-flex items-center gap-2 rounded-full bg-glow-cyan/10 px-5 py-2.5 text-sm font-semibold text-glow-cyan ring-1 ring-glow-cyan/40 transition hover:bg-glow-cyan/20 hover:shadow-[0_0_24px_rgba(56,232,255,0.25)] disabled:opacity-60"
          >
            {status === 'locating' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            )}
            {status === 'locating' ? 'Finding you…' : nearest ? 'Find again' : 'Find my nearest centre'}
          </button>
          {nearest && (
            <p className="text-sm text-slate-300">
              Nearest to you:{' '}
              <span className="font-semibold text-white">
                {exams.centres[nearest.idx].name} — {exams.centres[nearest.idx].town}
              </span>{' '}
              <span className="text-glow-cyan">({nearest.km.toFixed(0)} km away)</span>
            </p>
          )}
          {status === 'error' && <p className="text-sm text-slate-400">{errorMsg}</p>}
        </div>
      </section>

      <section className="container-x mt-6 pb-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {exams.centres.map((c, i) => {
            const isNearest = nearest?.idx === i
            return (
              <a key={c.url} href={c.url} target="_blank" rel="noreferrer" className="group" id={`centre-${i}`}>
                <SpotlightCard
                  className={`h-full p-5 transition-all ${
                    isNearest
                      ? 'border-glow-cyan/60 shadow-[0_0_30px_rgba(56,232,255,0.18)]'
                      : 'group-hover:border-glow-cyan/40'
                  }`}
                >
                  {isNearest && (
                    <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-glow-cyan/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-glow-cyan ring-1 ring-glow-cyan/40">
                      <MapPin className="h-3 w-3" /> Nearest · {nearest!.km.toFixed(0)} km
                    </span>
                  )}
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
            )
          })}
        </div>
      </section>
    </div>
  )
}
