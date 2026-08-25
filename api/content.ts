import fs from 'node:fs'
import path from 'node:path'
import { kv } from '@vercel/kv'

/** Passcode for the /admin editor — set ADMIN_PASSCODE in Vercel env vars. */
const PASSCODE = process.env.ADMIN_PASSCODE ?? 'nj-admin-2026'
const CONTENT_KEY = 'site-content'

// bundled fallback (the build-time content) for a fresh, empty database.
// Read lazily and defensively — a missing file must never crash the function
// at import time (Vercel's file tracing may not include src/).
let fallbackCache: unknown = null
function fallbackContent(): unknown {
  if (fallbackCache !== null) return fallbackCache
  for (const p of [
    path.join(process.cwd(), 'src/content/site-content.json'),
    path.join(__dirname, '../src/content/site-content.json'),
    path.join(__dirname, '../../src/content/site-content.json'),
  ]) {
    try {
      fallbackCache = JSON.parse(fs.readFileSync(p, 'utf-8'))
      break
    } catch {
      /* try next path */
    }
  }
  return fallbackCache
}

function json(res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (b?: string) => void }, code: number, body: unknown) {
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

export default async function handler(req: { method?: string; headers: Record<string, string | undefined>; body?: unknown }, res: any) {
  if (req.method === 'GET') {
    try {
      const saved = await kv.get(CONTENT_KEY)
      return json(res, 200, { ok: true, content: saved ?? fallbackContent() })
    } catch {
      // KV not connected — serve the bundled content read-only
      return json(res, 200, { ok: true, content: fallbackContent(), readOnly: true })
    }
  }

  if (req.method === 'POST') {
    if (req.headers['x-admin-key'] !== PASSCODE) {
      return json(res, 401, { ok: false, error: 'wrong passcode' })
    }
    const raw = req.body
    let parsed: unknown
    try {
      parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    } catch {
      return json(res, 400, { ok: false, error: 'invalid json' })
    }
    try {
      await kv.set(CONTENT_KEY, parsed)
      return json(res, 200, { ok: true })
    } catch (e) {
      return json(res, 500, { ok: false, error: String(e) })
    }
  }

  return json(res, 405, { ok: false, error: 'method not allowed' })
}
