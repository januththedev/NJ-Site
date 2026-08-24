import { chromium } from 'playwright-core'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = process.env.TEST_URL ?? 'http://localhost:5173/'
const PAGES = ['', 'about', 'classes', 'exams', 'helping-hand', 'contact', 'reviews', 'blog']

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--use-angle=default', '--enable-webgl', '--no-sandbox', '--proxy-server=direct://', '--proxy-bypass-list=*'],
})

for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, colorScheme: scheme })
  const page = await ctx.newPage()
  for (const p of PAGES) {
    const name = p === '' ? 'home' : p
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2800)
    // warm every canvas by scrolling through the page once
    await page.evaluate(async () => {
      const h = document.documentElement.scrollHeight
      for (let y = 0; y < h; y += 700) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 120))
      }
      window.scrollTo(0, 0)
    })
    await page.waitForTimeout(1200)
    await page.screenshot({ path: `.tmp/cm-${scheme}-${name}-full.png`, fullPage: true })
    console.log(`cm-${scheme}-${name}-full`)
  }
  await ctx.close()
}

// targeted canvas sections on home in both schemes
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, colorScheme: scheme })
  const page = await ctx.newPage()
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)
  const canvases = await page.evaluate(() =>
    [...document.querySelectorAll('canvas')].map((c) => {
      const r = c.getBoundingClientRect()
      return { top: r.top + window.scrollY, h: r.height }
    }),
  )
  let n = 0
  for (const c of canvases) {
    n++
    await page.evaluate((t) => window.scrollTo(0, t - 200), c.top)
    await page.waitForTimeout(2200)
    await page.screenshot({ path: `.tmp/cm-${scheme}-home-canvas${n}.png` })
    console.log(`cm-${scheme}-home-canvas${n}`)
  }
  await ctx.close()
}

await browser.close()
