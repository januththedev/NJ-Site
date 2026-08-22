import { Link } from 'react-router-dom'
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from 'lucide-react'
import { footerLinks, site, socials } from '../../data/site'

const TikTok = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.77.12V9.75a5.76 5.76 0 0 0-.77-.05 5.66 5.66 0 1 0 5.66 5.66V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.28 4.28 0 0 1-3.22-1.48Z" />
  </svg>
)

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/10 bg-night-900/60">
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="max-w-md font-display text-xl leading-relaxed text-slate-200">{site.footerTagline}</p>
          <div className="mt-6 flex gap-3">
            <a href={socials.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="glass grid h-10 w-10 place-items-center rounded-full text-slate-300 transition-colors hover:text-glow-cyan">
              <Facebook className="h-4 w-4" />
            </a>
            <a href={socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="glass grid h-10 w-10 place-items-center rounded-full text-slate-300 transition-colors hover:text-glow-cyan">
              <Instagram className="h-4 w-4" />
            </a>
            <a href={socials.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok" className="glass grid h-10 w-10 place-items-center rounded-full text-slate-300 transition-colors hover:text-glow-cyan">
              <TikTok className="h-4 w-4" />
            </a>
            <a href={socials.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="glass grid h-10 w-10 place-items-center rounded-full text-slate-300 transition-colors hover:text-glow-cyan">
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Quick Links</h4>
          <ul className="space-y-2.5">
            {footerLinks.map((l) => (
              <li key={l.label}>
                <Link to={'to' in l ? l.to : '/'} className="text-sm text-slate-400 transition-colors hover:text-glow-cyan">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/student-login" className="text-sm text-slate-400 transition-colors hover:text-glow-cyan">
                Gallery Information
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Information</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-glow-cyan" /> {site.address}
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-glow-cyan" />
              <a href={`mailto:${site.email}`} className="hover:text-white">
                {site.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-glow-cyan" />
              <a href={site.phoneHref} className="hover:text-white">
                {site.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
        © Copyright 2025 Physics.lk | Developed by <span className="font-semibold text-slate-300">Januth Nimnal</span>.
      </div>
    </footer>
  )
}
