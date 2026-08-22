import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface Faq {
  q: string
  a: string
}

export default function FaqAccordion({ items }: { items: readonly Faq[] }) {
  const [open, setOpen] = useState(0)

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {items.map((f, i) => {
        const isOpen = open === i
        return (
          <div key={f.q} className={`glass overflow-hidden rounded-2xl transition-colors ${isOpen ? 'border-glow-cyan/30' : ''}`}>
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-display text-base font-semibold text-white">{f.q}</span>
              <ChevronDown className={`h-5 w-5 shrink-0 text-glow-cyan transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-6 text-sm leading-relaxed text-slate-400">{f.a}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
