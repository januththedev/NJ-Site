import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[80svh] flex-col items-center justify-center pt-24 text-center">
      <p className="font-mono text-sm uppercase tracking-[0.3em] text-glow-cyan">// ERROR 404</p>
      <h1 className="text-gradient mt-4 font-display text-7xl font-bold sm:text-8xl">404</h1>
      <p className="mt-5 max-w-md text-slate-400">
        This page collapsed like an unobserved wavefunction. Let&apos;s get you back to solid ground.
      </p>
      <Link to="/" className="btn-primary mt-9">
        <ArrowLeft className="h-4 w-4" /> Back Home
      </Link>
    </section>
  )
}
