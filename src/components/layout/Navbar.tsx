import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Atom, Menu, Phone, X } from 'lucide-react'
import { navLinks, site } from '../../data/site'
import { useAutoHideDock } from '../../hooks/useAutoHideDock'
import { useMagnetic } from '../../hooks/useMagnetic'

/** Floating pill navbar: magnetic hover physics + auto-hide on scroll down. */
export default function Navbar() {
  const { hidden, ref } = useAutoHideDock()
  const magnetic = useMagnetic<HTMLAnchorElement>(0.25)
  const [open, setOpen] = useState(false)

  return (
    <header
      ref={ref as React.RefObject<HTMLElement>}
      className={`fixed inset-x-0 top-4 z-50 transition-transform duration-500 ease-out ${
        hidden && !open ? '-translate-y-[130%]' : 'translate-y-0'
      }`}
    >
      <div className="container-x flex justify-center">
        <nav className="glass-strong pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-2 rounded-full py-2 pl-5 pr-2">
          <Link to="/" className="flex items-center gap-2 font-display text-sm font-bold tracking-tight text-white">
            <Atom className="h-6 w-6 text-glow-cyan" strokeWidth={1.8} />
            <span>
              NJ<span className="text-glow-cyan">Physics</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) =>
                    `rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-200 ${
                      isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href={site.phoneHref}
              {...magnetic}
              className="btn-primary hidden !px-5 !py-2 text-xs md:inline-flex"
              aria-label={`Call ${site.phone}`}
            >
              <Phone className="h-3.5 w-3.5" /> {site.phone}
            </a>
            <button
              onClick={() => setOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-slate-300 lg:hidden"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile sheet */}
      <div className="container-x mt-2 lg:hidden">
        {open && (
          <div className="glass-strong rounded-3xl p-4">
            <ul className="grid grid-cols-2 gap-1">
              {navLinks.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-xl px-4 py-3 text-sm ${isActive ? 'bg-white/10 text-white' : 'text-slate-400'} `
                    }
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <Link to="/student-login" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-glow-cyan">
                  Student Login
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  )
}
