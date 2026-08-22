import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

function setMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export default function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    const page = pathname === '/' ? 'Home' : pathname.slice(1).replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
    document.title = `NJ Physics | ${page} — Nilantha Jayasuriya A/L Physics`
    setMeta('description', 'NJ Physics — Nilantha Jayasuriya. Sri Lanka\'s leading A/L Physics class. Theory, Revision & Paper sessions islandwide and online.')
  }, [pathname])

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
