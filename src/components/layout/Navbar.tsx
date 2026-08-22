import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Atom, LogIn, Menu, X } from 'lucide-react'

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/classes', label: 'Classes' },
  { to: '/exams', label: 'Exams' },
  { to: '/helping-hand', label: 'Help' },
  { to: '/contact', label: 'Contact' },
]

/**
 * Sticky glassmorphism navbar. No scroll-tracking animation.
 * The "Student Login" button is visible only at scrollY === 0 and fades
 * out the moment the user scrolls down; the bar itself stays sticky.
 */
export default function Navbar() {
  const [atTop, setAtTop] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY <= 2)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-4 z-50">
      <div className="container-x flex justify-center">
        <nav className="glass-strong pointer-events-auto flex w-full max-w-4xl items-center justify-between gap-3 rounded-full py-2 pl-5 pr-2">
          <Link to="/" className="flex items-center gap-2 font-display text-sm font-bold tracking-tight text-white">
            <Atom className="h-6 w-6 text-glow-cyan" strokeWidth={1.8} />
            <span>
              NJ<span className="text-glow-cyan">Physics</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-0.5 lg:flex">
            {links.map((l) => (
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
            {/* Student Login — extreme right edge, only at the very top of the page */}
            <NavLink
              to="/student-login"
              className={`btn-primary !px-5 !py-2 text-xs transition-all duration-500 hidden sm:inline-flex ${
                atTop ? 'opacity-100 translate-x-0' : 'pointer-events-none opacity-0 translate-x-4'
              }`}
            >
              <LogIn className="h-3.5 w-3.5" /> Student Login
            </NavLink>
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
              {links.map((l) => (
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
                <Link to="/reviews" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-slate-400">
                  Reviews
                </Link>
              </li>
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
