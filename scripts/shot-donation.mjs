/**
 * 赞赏功能视觉验证：对 preview server 截弹窗三态（亮色 / 暗色 / 移动端）。
 * 用法：npm run preview 之后执行 node scripts/shot-donation.mjs
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

async function shot(name, { width, height, dark, channel, mobile }) {
  const page = await browser.newPage({ viewport: { width, height } })
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.card')
  if (dark) {
    await page.click('.theme-toggle')
    await page.waitForTimeout(300)
  }
  await page.click('.donate-entry')
  await page.waitForSelector('.donation-overlay')
  await page.waitForTimeout(500) // 等 QR 懒加载绘制
  if (channel === 'wechat') {
    await page.click('.donation-tab:has-text("微信支付")')
    await page.waitForTimeout(300)
  }
  await page.screenshot({ path: `shots/${name}.png` })
  await page.close()
  console.log(`✓ shots/${name}.png`)
}

await shot('donation-light', { width: 1440, height: 960 })
await shot('donation-dark', { width: 1440, height: 960, dark: true })
await shot('donation-light-wechat', { width: 1440, height: 960, channel: 'wechat' })
await shot('donation-mobile', { width: 390, height: 844, mobile: true })

await browser.close()
