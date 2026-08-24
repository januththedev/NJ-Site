import { chromium } from 'playwright-core'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = process.env.TEST_URL ?? 'http://localhost:5173/'
const W = Number(process.argv[2] ?? 1280)
const H = Number(process.argv[3] ?? 800)
const TAG = process.argv[4] ?? 'pg'

const PAGES = ['', 'about', 'classes', 'exams', 'helping-hand', 'contact', 'reviews', 'blog']

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--use-angle=default', '--enable-webgl', '--no-sandbox', '--proxy-server=direct://', '--proxy-bypass-list=*'],
})
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })

const logs = []
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${m.type()}] ${page.url()} ${m.text()}`)
})
page.on('pageerror', (e) => logs.push(`[pageerror] ${page.url()} ${e.message}`))
page.on('requestfailed', (r) => logs.push(`[reqfail] ${r.url()} ${r.failure()?.errorText}`))

for (const p of PAGES) {
  const name = p === '' ? 'home' : p
  await page.goto(BASE + p, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('canvas', { timeout: 15000 })
  await page.waitForTimeout(3500) // GLB + shaders settle
  await page.screenshot({ path: `.tmp/${TAG}-${name}.png` })
  console.log(`shot: ${TAG}-${name}`)
}

console.log('--- errors/warnings ---')
console.log(logs.length ? logs.join('\n') : '(none)')
await browser.close()
