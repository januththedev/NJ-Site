import { useEffect, useMemo, useState } from 'react'
import baseContent from '../content/site-content.json'
import { Save, Upload, Lock, CheckCircle2, AlertTriangle, Plus, Trash2 } from 'lucide-react'

type Content = typeof baseContent

const inputCls =
  'w-full rounded-xl border border-white/10 bg-night-900/70 px-3.5 py-2.5 text-sm text-slate-200 outline-none transition focus:border-glow-cyan/60 focus:ring-2 focus:ring-glow-cyan/20'

function Field({
  label,
  value,
  onChange,
  textarea = false,
  hint,
}: {
  label: string
  value: string | number
  onChange: (v: string) => void
  textarea?: boolean
  hint?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      {textarea ? (
        <textarea className={`${inputCls} min-h-[96px] leading-relaxed`} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <span className="mt-1 block text-[11px] text-slate-600">{hint}</span>}
    </label>
  )
}

function ImageField({ label, value, onChange, authKey }: { label: string; value: string; onChange: (v: string) => void; authKey: string }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const upload = async (file: File) => {
    setBusy(true)
    setErr('')
    try {
      const dataBase64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader()
        r.onload = () => resolve(String(r.result).split(',')[1] ?? '')
        r.onerror = reject
        r.readAsDataURL(file)
      })
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': authKey },
        body: JSON.stringify({ filename: file.name, dataBase64 }),
      })
      const body = await res.json()
      if (!body.ok) throw new Error(body.error ?? 'upload failed')
      onChange(body.path)
    } catch (e) {
      setErr(String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      <div className="flex items-center gap-3">
        {value && <img src={value} alt="" className="h-16 w-16 shrink-0 rounded-lg border border-white/10 object-cover" />}
        <div className="min-w-0 flex-1">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-glow-cyan/10 px-4 py-2 text-xs font-semibold text-glow-cyan ring-1 ring-glow-cyan/40 transition hover:bg-glow-cyan/20">
            <Upload className="h-3.5 w-3.5" /> {busy ? 'Uploading…' : 'Replace image'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void upload(f)
                e.target.value = ''
              }}
            />
          </label>
          <p className="mt-1 truncate text-[11px] text-slate-600">{value}</p>
          {err && <p className="mt-1 text-[11px] text-red-400">{err}</p>}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-night-800/50 p-6 shadow-glass">
      <h2 className="mb-5 font-display text-lg font-bold text-white">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function RowCard({ children, onDelete }: { children: React.ReactNode; onDelete?: () => void }) {
  return (
    <div className="relative rounded-2xl border border-white/5 bg-night-900/60 p-4">
      {onDelete && (
        <button
          onClick={onDelete}
          aria-label="Remove row"
          className="absolute right-3 top-3 rounded-full p-1.5 text-slate-600 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
      <div className="space-y-3">{children}</div>
    </div>
  )
}

export default function Admin() {
  const [content, setContent] = useState<Content>(() => structuredClone(baseContent))
  const [key, setKey] = useState(() => sessionStorage.getItem('nj-admin-key') ?? '')
  const [keyInput, setKeyInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState('')
  const [live, setLive] = useState(true) // false when the save API is unreachable (static build)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    fetch('/api/content')
      .then((r) => r.json())
      .then((b) => {
        if (b.ok) setContent(b.content)
        else setLive(false)
      })
      .catch(() => {
        setLive(false)
        setLoadError('This static build cannot save edits — run `npm run dev` and open the admin there.')
      })
  }, [])

  const patch = useMemo(
    () => (fn: (draft: Content) => void) => {
      setContent((prev) => {
        const draft = structuredClone(prev)
        fn(draft)
        return draft
      })
    },
    [],
  )

  const save = async () => {
    setStatus('saving')
    setError('')
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
        body: JSON.stringify(content),
      })
      const body = await res.json()
      if (!body.ok) throw new Error(body.error ?? 'save failed')
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2500)
    } catch (e) {
      setStatus('error')
      setError(e instanceof Error && e.message === 'wrong passcode' ? 'Wrong passcode.' : String(e))
    }
  }

  /* ── passcode gate ── */
  if (!key) {
    return (
      <div className="container-x flex min-h-[70vh] items-center justify-center py-24">
        <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-night-800/50 p-8 text-center shadow-glass">
          <Lock className="mx-auto h-8 w-8 text-glow-cyan" />
          <h1 className="mt-4 font-display text-xl font-bold text-white">Content Editor</h1>
          <p className="mt-2 text-sm text-slate-400">Enter the admin passcode to edit site content.</p>
          <input
            type="password"
            className={`${inputCls} mt-6 text-center`}
            placeholder="Passcode"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && keyInput) {
                sessionStorage.setItem('nj-admin-key', keyInput)
                setKey(keyInput)
              }
            }}
          />
          <button
            onClick={() => {
              if (keyInput) {
                sessionStorage.setItem('nj-admin-key', keyInput)
                setKey(keyInput)
              }
            }}
            className="btn-primary mt-4 w-full"
          >
            Unlock
          </button>
          <p className="mt-4 text-[11px] leading-relaxed text-slate-600">
            Default passcode: <code className="text-slate-400">nj-admin-2026</code> (change with the ADMIN_PASSCODE env
            var). Editing works while the dev server runs.
          </p>
        </div>
      </div>
    )
  }

  const c = content

  return (
    <div className="container-x pb-32 pt-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-glow-cyan">NJ Physics</p>
          <h1 className="font-display text-3xl font-bold text-white">Content Editor</h1>
          <p className="mt-1 text-sm text-slate-500">Edits save to the source content file and hot-reload the site.</p>
        </div>
        <button onClick={save} disabled={status === 'saving' || !live} className="btn-primary disabled:opacity-50">
          {status === 'saving' ? (
            'Saving…'
          ) : (
            <>
              <Save className="relative z-10 h-4 w-4" /> <span className="relative z-10">Save changes</span>
            </>
          )}
        </button>
      </div>

      {!live && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-glow-amber/30 bg-glow-amber/10 p-4 text-sm text-glow-amber">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{loadError || 'Save API unavailable — start the dev server to edit.'}</span>
        </div>
      )}
      {status === 'saved' && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> Saved — the site has hot-reloaded with your changes.
        </div>
      )}
      {status === 'error' && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Contact & footer ── */}
        <Section title="Contact info & footer">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone" value={c.site.phone} onChange={(v) => patch((d) => void (d.site.phone = v))} />
            <Field label="Phone link (tel:)" value={c.site.phoneHref} onChange={(v) => void patch((d) => void (d.site.phoneHref = v))} />
            <Field label="Email" value={c.site.email} onChange={(v) => void patch((d) => void (d.site.email = v))} />
            <Field label="Location" value={c.site.address} onChange={(v) => void patch((d) => void (d.site.address = v))} />
            <Field label="Opening hours" value={c.site.hours} onChange={(v) => void patch((d) => void (d.site.hours = v))} />
          </div>
          <Field label="Footer tagline (Sinhala)" value={c.site.footerTagline} onChange={(v) => void patch((d) => void (d.site.footerTagline = v))} textarea />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Facebook URL" value={c.socials.facebook} onChange={(v) => void patch((d) => void (d.socials.facebook = v))} />
            <Field label="Instagram URL" value={c.socials.instagram} onChange={(v) => void patch((d) => void (d.socials.instagram = v))} />
            <Field label="TikTok URL" value={c.socials.tiktok} onChange={(v) => void patch((d) => void (d.socials.tiktok = v))} />
            <Field label="YouTube URL" value={c.socials.youtube} onChange={(v) => void patch((d) => void (d.socials.youtube = v))} />
          </div>
        </Section>

        {/* ── Hero + achievement stats ── */}
        <Section title="Home stats">
          <p className="text-xs text-slate-500">Hero counters and the achievement card.</p>
          {c.heroStats.map((s, i) => (
            <RowCard key={i} onDelete={() => patch((d) => void d.heroStats.splice(i, 1))}>
              <div className="grid grid-cols-[90px_70px_1fr] gap-3">
                <Field label="Value" value={s.value} onChange={(v) => void patch((d) => void (d.heroStats[i].value = Number(v) || 0))} />
                <Field label="Suffix" value={s.suffix} onChange={(v) => void patch((d) => void (d.heroStats[i].suffix = v))} />
                <Field label="Label" value={s.label} onChange={(v) => void patch((d) => void (d.heroStats[i].label = v))} />
              </div>
            </RowCard>
          ))}
          <button
            onClick={() => patch((d) => void d.heroStats.push({ value: 0, suffix: '', label: 'New stat' }))}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-glow-cyan hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add stat
          </button>
          <div className="h-px bg-white/5" />
          <Field label="Top-ranks badge line" value={c.aboutTeaser.rankLine} onChange={(v) => void patch((d) => void (d.aboutTeaser.rankLine = v))} />
          {c.aboutTeaser.stats.map((s, i) => (
            <div key={i} className="grid grid-cols-[110px_1fr] gap-3">
              <Field label="Value" value={s.value} onChange={(v) => void patch((d) => void (d.aboutTeaser.stats[i].value = Number(v) || 0))} />
              <Field label="Label" value={s.label} onChange={(v) => void patch((d) => void (d.aboutTeaser.stats[i].label = v))} />
            </div>
          ))}
          <Field
            label="Exam-halls heading"
            value={c.coverageTitle}
            onChange={(v) => void patch((d) => void (d.coverageTitle = v))}
            hint="{count} is replaced with the live centre count"
          />
        </Section>

        {/* ── Timetable posters ── */}
        <Section title="Timetable posters (Home + Classes)">
          {c.timetables.map((t, i) => (
            <RowCard key={i} onDelete={() => patch((d) => void d.timetables.splice(i, 1))}>
              <ImageField label="Poster image" value={t.src} onChange={(v) => void patch((d) => void (d.timetables[i].src = v))} authKey={key} />
              <Field label="Caption" value={t.label} onChange={(v) => void patch((d) => void (d.timetables[i].label = v))} />
            </RowCard>
          ))}
          <button
            onClick={() => patch((d) => void d.timetables.push({ src: '', label: 'New poster' }))}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-glow-cyan hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add poster
          </button>
          <div className="h-px bg-white/5" />
          {c.venues.map((v, i) => (
            <RowCard key={i} onDelete={() => patch((d) => void d.venues.splice(i, 1))}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Venue name" value={v.name} onChange={(x) => void patch((d) => void (d.venues[i].name = x))} />
                <Field label="City" value={v.city} onChange={(x) => void patch((d) => void (d.venues[i].city = x))} />
              </div>
            </RowCard>
          ))}
          <button
            onClick={() => patch((d) => void d.venues.push({ name: 'New Venue', city: 'CITY' }))}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-glow-cyan hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add venue
          </button>
        </Section>

        {/* ── Reviews ── */}
        <Section title="Reviews (Home + Reviews page)">
          <p className="text-xs text-slate-500">Top-rank cards.</p>
          {c.topReviews.map((r, i) => (
            <RowCard key={i} onDelete={() => patch((d) => void d.topReviews.splice(i, 1))}>
              <div className="grid grid-cols-[1fr_80px_130px] gap-3">
                <Field label="Name" value={r.name} onChange={(v) => void patch((d) => void (d.topReviews[i].name = v))} />
                <Field label="Rank #" value={r.rank ?? 0} onChange={(v) => void patch((d) => void (d.topReviews[i].rank = Number(v) || 0))} />
                <Field label="Year line" value={r.year} onChange={(v) => void patch((d) => void (d.topReviews[i].year = v))} />
              </div>
              <ImageField label="Thumbnail" value={r.thumb ?? ''} onChange={(v) => void patch((d) => void (d.topReviews[i].thumb = v))} authKey={key} />
              <Field label="Quote" value={r.quote} onChange={(v) => void patch((d) => void (d.topReviews[i].quote = v))} textarea />
            </RowCard>
          ))}
          <button
            onClick={() => patch((d) => void d.topReviews.push({ name: 'New Student', year: 'A/L Year: 2025', rank: 1, thumb: '', quote: '…' }))}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-glow-cyan hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add top review
          </button>
          <div className="h-px bg-white/5" />
          <p className="text-xs text-slate-500">Student review cards.</p>
          {c.studentReviews.map((r, i) => (
            <RowCard key={i} onDelete={() => patch((d) => void d.studentReviews.splice(i, 1))}>
              <div className="grid grid-cols-[1fr_130px] gap-3">
                <Field label="Name" value={r.name} onChange={(v) => void patch((d) => void (d.studentReviews[i].name = v))} />
                <Field label="Year line" value={r.year} onChange={(v) => void patch((d) => void (d.studentReviews[i].year = v))} />
              </div>
              <ImageField label="Avatar" value={r.thumb ?? ''} onChange={(v) => void patch((d) => void (d.studentReviews[i].thumb = v))} authKey={key} />
              <Field label="Quote" value={r.quote} onChange={(v) => void patch((d) => void (d.studentReviews[i].quote = v))} textarea />
            </RowCard>
          ))}
          <button
            onClick={() => patch((d) => void d.studentReviews.push({ name: 'New Student', year: 'A/L Year: 2025', thumb: '', quote: '…' }))}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-glow-cyan hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add student review
          </button>
        </Section>

        {/* ── Contact page ── */}
        <Section title="Contact page">
          {c.contactCards.map((card, i) => (
            <RowCard key={i}>
              <div className="grid grid-cols-[110px_1fr_1fr] gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Icon</span>
                  <select
                    className={inputCls}
                    value={card.icon}
                    onChange={(e) => void patch((d) => void (d.contactCards[i].icon = e.target.value))}
                  >
                    {['phone', 'mail', 'map', 'clock'].map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </label>
                <Field label="Label" value={card.label} onChange={(v) => void patch((d) => void (d.contactCards[i].label = v))} />
                <Field label="Value" value={card.value} onChange={(v) => void patch((d) => void (d.contactCards[i].value = v))} />
              </div>
              <Field label="Link (optional)" value={card.href} onChange={(v) => void patch((d) => void (d.contactCards[i].href = v))} />
            </RowCard>
          ))}
          <div className="h-px bg-white/5" />
          <Field label="Telegram intro (Sinhala)" value={c.telegramIntroSi} onChange={(v) => void patch((d) => void (d.telegramIntroSi = v))} textarea />
          {c.telegramGroups.map((g, i) => (
            <RowCard key={i} onDelete={() => patch((d) => void d.telegramGroups.splice(i, 1))}>
              <div className="grid gap-3">
                <Field label="Group name" value={g.name} onChange={(v) => void patch((d) => void (d.telegramGroups[i].name = v))} />
                <Field label="Invite URL" value={g.url} onChange={(v) => void patch((d) => void (d.telegramGroups[i].url = v))} />
              </div>
            </RowCard>
          ))}
          <button
            onClick={() => patch((d) => void d.telegramGroups.push({ name: 'New group', url: 'https://t.me/…' }))}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-glow-cyan hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add group
          </button>
        </Section>

        {/* ── Exam centres ── */}
        <Section title={`Exam centres (${c.centres.length})`}>
          <p className="text-xs text-slate-500">
            Name, town, Telegram invite and map pin coordinates (lat/lng power the nearest-centre locator).
          </p>
          <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
            {c.centres.map((ct, i) => (
              <RowCard key={i} onDelete={() => patch((d) => void d.centres.splice(i, 1))}>
                <div className="grid grid-cols-[1fr_1fr_1.4fr] gap-3">
                  <Field label="Name" value={ct.name} onChange={(v) => void patch((d) => void (d.centres[i].name = v))} />
                  <Field label="Town" value={ct.town} onChange={(v) => void patch((d) => void (d.centres[i].town = v))} />
                  <Field label="Telegram URL" value={ct.url} onChange={(v) => void patch((d) => void (d.centres[i].url = v))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Lat" value={ct.lat} onChange={(v) => void patch((d) => void (d.centres[i].lat = Number(v) || 0))} />
                  <Field label="Lng" value={ct.lng} onChange={(v) => void patch((d) => void (d.centres[i].lng = Number(v) || 0))} />
                </div>
              </RowCard>
            ))}
          </div>
          <button
            onClick={() => patch((d) => void d.centres.push({ name: 'New Centre', town: '', url: 'https://t.me/…', lat: 7, lng: 80 }))}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-glow-cyan hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add centre
          </button>
        </Section>
      </div>
    </div>
  )
}
