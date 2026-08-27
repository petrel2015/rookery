/**
 * 视觉验证脚本：用本地缓存的 Chromium 对 dev server 截四张图。
 * 用法：npm run dev 之后，另开终端执行 node scripts/shot.mjs
 */
import { chromium } from 'playwright-core'
import { existsSync, mkdirSync } from 'node:fs'

const EXEC =
  process.env.CHROMIUM_PATH ||
  [
    process.env.HOME + '/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell',
  ].find((p) => existsSync(p))

if (!EXEC) throw new Error('未找到可用的 Chromium，可设 CHROMIUM_PATH 指定')

const BASE = process.env.BASE_URL || 'http://localhost:5180/'
mkdirSync('shots', { recursive: true })

const browser = await chromium.launch({ executablePath: EXEC })

async function shot(name, { width, height, dark, list, category }) {
  const page = await browser.newPage({ viewport: { width, height } })
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.card')
  if (dark) {
    await page.click('.theme-toggle')
    await page.waitForTimeout(300)
  }
  if (category) {
    await page.click(`.chip:has-text("${category}")`)
    await page.waitForTimeout(300)
  }
  if (list) {
    await page.click('.view-toggle button[title="列表视图"]')
    await page.waitForTimeout(300)
  }
  await page.waitForTimeout(400) // 等封面图解码
  await page.screenshot({ path: `shots/${name}.png`, fullPage: true })
  await page.close()
  console.log(`✓ shots/${name}.png`)
}

await shot('grid-light', { width: 1440, height: 960 })
await shot('list-light', { width: 1440, height: 960, list: true })
await shot('grid-dark-game', { width: 1440, height: 960, dark: true, category: '游戏' })
await shot('grid-mobile', { width: 390, height: 844 })

await browser.close()
