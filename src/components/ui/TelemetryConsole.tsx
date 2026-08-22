import { useEffect, useState } from 'react'
import { Activity, Cpu, Radio, Waves } from 'lucide-react'

const ROWS = [
  { icon: Waves, label: 'wave.freq', unit: 'Hz', base: 50, spread: 4, decimals: 2 },
  { icon: Activity, label: 'accel.g', unit: 'm/s²', base: 9.81, spread: 0.05, decimals: 3 },
  { icon: Radio, label: 'photon.eV', unit: 'eV', base: 2.48, spread: 0.08, decimals: 3 },
  { icon: Cpu, label: 'students.online', unit: '', base: 1240, spread: 30, decimals: 0 },
]

/** Decorative physics telemetry console — live-jittering readouts in a glass shell. */
export default function TelemetryConsole() {
  const [vals, setVals] = useState(ROWS.map((r) => r.base))

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => {
      setVals(ROWS.map((r) => r.base + (Math.random() - 0.5) * r.spread * 2))
    }, 900)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="glass-strong rounded-3xl p-6 font-mono text-[13px]">
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
        <span className="text-slate-500">~/nj-physics/telemetry</span>
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> LIVE
        </span>
      </div>
      <ul className="space-y-3">
        {ROWS.map((row, i) => (
          <li key={row.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-slate-400">
              <row.icon className="h-3.5 w-3.5 text-glow-cyan" /> {row.label}
            </span>
            <span className="text-slate-200">
              {vals[i].toFixed(row.decimals)}
              {row.unit && <span className="ml-1 text-slate-500">{row.unit}</span>}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-5 h-16 overflow-hidden rounded-xl border border-white/5 bg-night-950/80 p-2">
        <svg viewBox="0 0 300 48" preserveAspectRatio="none" className="h-full w-full">
          <path
            d="M0 24 Q 12 6, 25 24 T 50 24 T 75 24 T 100 24 T 125 24 T 150 24 T 175 24 T 200 24 T 225 24 T 250 24 T 275 24 T 300 24"
            fill="none"
            stroke="#38e8ff"
            strokeWidth="1.5"
            opacity="0.85"
            style={{ strokeDasharray: 600, animation: 'none' }}
          />
        </svg>
      </div>
    </div>
  )
}
