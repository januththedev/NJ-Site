import { put } from '@vercel/blob'

/** Passcode for the /admin editor — set ADMIN_PASSCODE in Vercel env vars. */
const PASSCODE = process.env.ADMIN_PASSCODE ?? 'nj-admin-2026'

function json(res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (b?: string) => void }, code: number, body: unknown) {
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

export default async function handler(req: { method?: string; headers: Record<string, string | undefined>; body?: unknown }, res: any) {
  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, error: 'method not allowed' })
  }
  if (req.headers['x-admin-key'] !== PASSCODE) {
    return json(res, 401, { ok: false, error: 'wrong passcode' })
  }

  let payload: { filename?: string; dataBase64?: string }
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {})
  } catch {
    return json(res, 400, { ok: false, error: 'invalid json' })
  }

  const { filename, dataBase64 } = payload
  if (!filename || !dataBase64) {
    return json(res, 400, { ok: false, error: 'filename and dataBase64 required' })
  }

  try {
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase()
    const ext = safe.includes('.') ? '.' + safe.split('.').pop() : '.png'
    const base = safe.replace(/\.[^.]+$/, '').slice(0, 40) || 'image'
    const buffer = Buffer.from(dataBase64, 'base64')
    const blob = await put(`uploads/${Date.now()}-${base}${ext}`, buffer, { access: 'public' })
    return json(res, 200, { ok: true, path: blob.url })
  } catch (e) {
    return json(res, 500, { ok: false, error: String(e) })
  }
}
