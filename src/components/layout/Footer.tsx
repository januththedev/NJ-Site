import { Mail, MapPin, Phone } from 'lucide-react'
import { site, socials } from '../../data/site'

const TikTok = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.77.12V9.75a5.76 5.76 0 0 0-.77-.05 5.66 5.66 0 1 0 5.66 5.66V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.28 4.28 0 0 1-3.22-1.48Z" />
  </svg>
)

/**
 * Footer: contact info on the left, Sinhala tagline on the right, and an
 * open middle column where the scroll-journey rocket lands dead center.
 */
export default function Footer() {
  return (
    <footer className="relative z-10 mt-10 border-t border-white/10 bg-night-900/30 pb-8 pt-14">
      <div className="container-x grid items-center gap-12 md:grid-cols-[1fr_minmax(180px,0.9fr)_1fr]">
        {/* Contact — left */}
        <div>
          <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Contact</h4>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-glow-cyan" />
              <a href={site.phoneHref} className="hover:text-white">{site.phone}</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-glow-cyan" />
              <a href={`mailto:${site.email}`} className="hover:text-white break-all">{site.email}</a>
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 shrink-0 text-glow-cyan" /> {site.address}
            </li>
          </ul>
          <div className="mt-6 flex gap-2.5 text-xs">
            <a href={socials.facebook} target="_blank" rel="noreferrer" className="glass rounded-full px-3 py-1.5 text-slate-400 hover:text-glow-cyan">Facebook</a>
            <a href={socials.instagram} target="_blank" rel="noreferrer" className="glass rounded-full px-3 py-1.5 text-slate-400 hover:text-glow-cyan">Instagram</a>
            <a href={socials.tiktok} target="_blank" rel="noreferrer" className="glass rounded-full px-3 py-1.5 text-slate-400 hover:text-glow-cyan">TikTok</a>
            <a href={socials.youtube} target="_blank" rel="noreferrer" className="glass rounded-full px-3 py-1.5 text-slate-400 hover:text-glow-cyan">YouTube</a>
          </div>
        </div>

        {/* Middle column intentionally left open — the rocket lands here */}
        <div aria-hidden className="hidden h-64 md:block" />

        {/* Tagline — right */}
        <div className="md:text-right">
          <p className="font-display text-lg leading-relaxed text-slate-200 md:text-xl" lang="si">
            යුගයේ අතිශ්‍රේෂ්ඨතම A/L භෞතික විද්‍යා ගුරුවරයා — NJ Physics සමඟ ඔබේ ජයග්‍රහණය තහවුරු කරගන්න.
          </p>
        </div>
      </div>

      <div className="container-x mt-12 border-t border-white/5 pt-6 text-center text-xs text-slate-500">
        Copyright 2026 Physics.lk developed by Januth
      </div>
    </footer>
  )
}
