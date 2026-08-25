import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

const CONTENT_FILE = path.resolve(__dirname, 'src/content/site-content.json')
const UPLOAD_DIR = path.resolve(__dirname, 'public/assets/img/uploads')

/** Passcode for the /admin editor — override with ADMIN_PASSCODE env var. */
const PASSCODE = process.env.ADMIN_PASSCODE ?? 'nj-admin-2026'

function readBody(req: fs.ReadableStream | import('node:http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

/**
 * Dev-server API behind the /admin CMS page.
 *   POST /api/content  — persist edits to src/content/site-content.json
 *   GET  /api/content  — current content (admin loads fresh values)
 *   POST /api/upload   — save a base64 image into public/assets/img/uploads
 * Edits hit the real source file, so they persist, ship with the next build,
 * and hot-reload every page that reads the content layer.
 */
function contentApi(PASSCODE: string): Plugin {
  return {
    name: 'nj-content-api',
    configureServer(server) {
      const json = (res: import('node:http').ServerResponse, code: number, body: unknown) => {
        res.statusCode = code
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(body))
      }

      server.middlewares.use('/api/content', (req, res) => {
        if (req.method === 'GET') {
          json(res, 200, { ok: true, content: JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8')) })
          return
        }
        if (req.method !== 'POST') {
          json(res, 405, { ok: false, error: 'method not allowed' })
          return
        }
        if (req.headers['x-admin-key'] !== PASSCODE) {
          json(res, 401, { ok: false, error: 'wrong passcode' })
          return
        }
        readBody(req).then((raw) => {
          try {
            const parsed = JSON.parse(raw)
            fs.writeFileSync(CONTENT_FILE, JSON.stringify(parsed, null, 2) + '\n', 'utf-8')
            json(res, 200, { ok: true })
          } catch (e) {
            json(res, 400, { ok: false, error: String(e) })
          }
        })
      })

      server.middlewares.use('/api/upload', (req, res) => {
        if (req.method !== 'POST') {
          json(res, 405, { ok: false, error: 'method not allowed' })
          return
        }
        if (req.headers['x-admin-key'] !== PASSCODE) {
          json(res, 401, { ok: false, error: 'wrong passcode' })
          return
        }
        readBody(req).then((raw) => {
          try {
            const { filename, dataBase64 } = JSON.parse(raw) as { filename: string; dataBase64: string }
            const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase()
            const ext = path.extname(safe) || '.png'
            const base = path.basename(safe, ext).slice(0, 40) || 'image'
            const name = `${Date.now()}-${base}${ext}`
            fs.mkdirSync(UPLOAD_DIR, { recursive: true })
            fs.writeFileSync(path.join(UPLOAD_DIR, name), Buffer.from(dataBase64, 'base64'))
            json(res, 200, { ok: true, path: `/assets/img/uploads/${name}` })
          } catch (e) {
            json(res, 400, { ok: false, error: String(e) })
          }
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // ADMIN_PASSCODE can come from the shell OR a .env / .env.local file;
  // real shell variables win over file values
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env } as Record<string, string>
  const passcode = env.ADMIN_PASSCODE ?? 'nj-admin-2026'
  return {
    plugins: [react(), contentApi(passcode)],
    server: { port: 5173 },
    preview: { port: 4173 },
  }
})
