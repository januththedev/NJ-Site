import { chromium } from 'playwright-core'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = process.env.TEST_URL ?? 'http://localhost:5173/'
const W = Number(process.argv[2] ?? 383)
const H = Number(process.argv[3] ?? 786)
const TAG = process.argv[4] ?? 'm'

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--use-angle=default', '--enable-webgl', '--no-sandbox', '--proxy-server=direct://', '--proxy-bypass-list=*'],
})
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })

const logs = []
page.on('console', (m) => logs.push(`[console.${m.type()}] ${m.text()}`))
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`))
page.on('requestfailed', (r) => logs.push(`[reqfail] ${r.url()} ${r.failure()?.errorText}`))

await page.goto(BASE, { waitUntil: 'domcontentloaded' })
await page.waitForSelector('canvas', { timeout: 20000 })
await page.waitForTimeout(5000) // let GLB + shaders settle

await page.screenshot({ path: `.tmp/${TAG}-0-idle.png` })

// scroll to the footer so the launch button becomes active, like a real user
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
await page.waitForTimeout(1500)
await page.screenshot({ path: `.tmp/${TAG}-1-footer.png` })

// click the launch button (fallback: drive window API directly)
const clicked = await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) =>
    (x.getAttribute('aria-label') ?? '').includes('Launch'),
  )
  if (b) {
    b.click()
    return 'button'
  }
  if (window.__startFlight) {
    window.__flightActive = true
    window.__startFlight()
    return 'api'
  }
  return 'none'
})

const t0 = Date.now()
const marks = [
  ['2-ascent', 1200],
  ['3-midascent', 3000],
  ['4-lateascent', 4600],
  ['5-transit', 5400],
  ['6-touchdown', 7300],
  ['7-fade', 8200],
  ['8-after', 9800],
]
for (const [name, ms] of marks) {
  const wait = ms - (Date.now() - t0)
  if (wait > 0) await page.waitForTimeout(wait)
  await page.screenshot({ path: `.tmp/${TAG}-${name}.png` })
}

const state = await page.evaluate(() => ({
  flightActive: window.__flightActive,
  hasStart: typeof window.__startFlight === 'function',
  scrollY: window.scrollY,
}))
console.log('clicked:', clicked, 'finalState:', JSON.stringify(state))
console.log('--- logs ---')
console.log(logs.slice(-40).join('\n') || '(no console output)')
await browser.close()
