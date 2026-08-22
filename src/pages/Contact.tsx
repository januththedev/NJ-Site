import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react'
import PageHero from '../components/ui/PageHero'
import SpotlightCard from '../components/ui/SpotlightCard'
import SectionHeading from '../components/ui/SectionHeading'
import { contact } from '../data/contact'
import { socials } from '../data/site'

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  phone: Phone,
  mail: Mail,
  map: MapPin,
  clock: Clock,
}

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M13.5 21v-7.8h2.62l.4-3.03H13.5V8.23c0-.88.24-1.48 1.5-1.48h1.6V4.05c-.28-.04-1.23-.12-2.34-.12-2.32 0-3.9 1.41-3.9 4v2.24H7.75v3.03h2.6V21h3.15Z" />
  </svg>
)
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="3.8" />
    <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
  </svg>
)
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.77.12V9.75a5.76 5.76 0 0 0-.77-.05 5.66 5.66 0 1 0 5.66 5.66V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.28 4.28 0 0 1-3.22-1.48Z" />
  </svg>
)
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M21.58 7.19a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.82.42A2.5 2.5 0 0 0 2.42 7.2 26.2 26.2 0 0 0 2 12a26.2 26.2 0 0 0 .42 4.81 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.82-.42a2.5 2.5 0 0 0 1.76-1.77A26.2 26.2 0 0 0 22 12a26.2 26.2 0 0 0-.42-4.81ZM10 15V9l5.2 3L10 15Z" />
  </svg>
)

const SOCIAL_LIST = [
  { name: 'Facebook', href: socials.facebook, Icon: FacebookIcon },
  { name: 'Instagram', href: socials.instagram, Icon: InstagramIcon },
  { name: 'TikTok', href: socials.tiktok, Icon: TikTokIcon },
  { name: 'YouTube', href: socials.youtube, Icon: YouTubeIcon },
]

export default function Contact() {
  return (
    <div>
      <PageHero eyebrow="Contact me" title={contact.title} />

      {/* Contact tilt-cards */}
      <section className="container-x mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {contact.cards.map((c) => {
          const Icon = ICONS[c.icon]
          return (
            <SpotlightCard key={c.label} className="h-full p-6 text-center">
              {Icon && (
                <div className="mx-auto flex justify-center text-glow-cyan">
                  <Icon />
                </div>
              )}
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{c.label}</p>
              {c.href ? (
                <a href={c.href} className="mt-2 block font-display text-sm font-bold text-white hover:text-glow-cyan sm:text-base break-words">
                  {c.value}
                </a>
              ) : (
                <p className="mt-2 font-display text-sm font-bold text-white sm:text-base">{c.value}</p>
              )}
            </SpotlightCard>
          )
        })}
      </section>

      {/* Telegram groups */}
      <section className="container-x mt-20">
        <SectionHeading eyebrow="Join Now" title="Telegram Groups" />
        <p className="mx-auto -mt-6 mb-10 max-w-2xl text-center leading-relaxed text-slate-400" lang="si">
          {contact.telegramIntroSi}
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contact.telegramGroups.map((g) => (
            <a key={g.url} href={g.url} target="_blank" rel="noreferrer" className="group">
              <SpotlightCard className="flex h-full items-center justify-between gap-3 p-5 transition-colors group-hover:border-glow-cyan/40">
                <span className="text-sm font-medium text-slate-200">{g.name}</span>
                <Send className="h-4 w-4 shrink-0 text-glow-cyan transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </SpotlightCard>
            </a>
          ))}
        </div>
      </section>

      {/* Socials */}
      <section className="container-x mt-20 pb-4 text-center">
        <SectionHeading eyebrow="Follow" title="NJ Physics Everywhere" />
        <div className="flex justify-center gap-4">
          {SOCIAL_LIST.map(({ name, href, Icon }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={name}
              className="glass grid h-14 w-14 place-items-center rounded-full text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:text-glow-cyan"
            >
              <Icon />
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
