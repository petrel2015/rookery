/**
 * 布局与功能断言：不依赖人眼，验证展示墙的关键视觉不变量。
 * 用法：npm run dev 之后执行 node scripts/verify.mjs
 */
import { chromium } from 'playwright-core'
import { existsSync } from 'node:fs'

const EXEC =
  process.env.CHROMIUM_PATH ||
  [
    process.env.HOME + '/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell',
  ].find((p) => existsSync(p))

if (!EXEC) throw new Error('未找到可用的 Chromium，可设 CHROMIUM_PATH 指定')

const BASE = process.env.BASE_URL || 'http://localhost:5180/'
const browser = await chromium.launch({ executablePath: EXEC })
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } })

const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(String(e)))

await page.goto(BASE, { waitUntil: 'domcontentloaded' })
await page.waitForSelector('.card')

let failed = 0
const check = (name, ok, detail = '') => {
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`)
  if (!ok) failed++
}

// 1. 卡片数量：默认落在「可在线试用」，点「全部」才是全量
check('默认「可在线试用」显示 9 张卡片', (await page.locator('.card').count()) === 9)
check('首屏前三张是最常用三件套', await page.evaluate(() =>
  [...document.querySelectorAll('.card .title')]
    .slice(0, 3).map((e) => e.textContent.trim().replace('↗', '').trim())
    .join('|') === 'JSON Viewer|时间戳工具|PW·GEN'
))
await page.click('.chip:has-text("全部")')
await page.waitForTimeout(250)
check('「全部」显示 12 张卡片', (await page.locator('.card').count()) === 12)

// 2. 所有封面图真实加载（naturalWidth > 0），占位封面除外。
// 先滚到底再回顶：loading="lazy" 的封面在折叠线以下不会自行触发加载
await page.evaluate(async () => {
  for (let y = 0; y <= document.body.scrollHeight; y += 600) {
    window.scrollTo(0, y)
    await new Promise((r) => setTimeout(r, 60))
  }
  window.scrollTo(0, 0)
})
await page.waitForTimeout(400)
const imgs = await page.$$eval('.card .cover img', (els) =>
  els.map((e) => ({ alt: e.alt, w: e.naturalWidth }))
)
check('11 张封面图全部加载成功', imgs.length === 11 && imgs.every((i) => i.w > 0),
  imgs.filter((i) => i.w === 0).map((i) => i.alt).join(',') || 'ok')

// 3. 无横向溢出
const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth
)
check('无横向溢出', overflow <= 0, `diff=${overflow}px`)

// 4. 桌面网格列数（1240 容器 / minmax(310) → 期望 3 列）
const cols = await page.$eval('.grid', (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length)
check('桌面端 3 列网格', cols === 3, `实际 ${cols} 列`)

// 5. 卡片等高（同一行内高度一致）
const rowHeights = await page.$$eval('.grid .card', (els) => {
  const byTop = new Map()
  els.forEach((e) => {
    const t = e.getBoundingClientRect().top
    byTop.set(t, e.getBoundingClientRect().height)
  })
  return [...byTop.values()]
})
check('同行卡片等高', new Set(rowHeights.map((h) => Math.round(h))).size <= rowHeights.length,
  rowHeights.map((h) => h.toFixed(0)).join(','))

// 6. 分类筛选：按「能否在线试用」划分
await page.click('.chip:has-text("可在线试用")')
await page.waitForTimeout(250)
check('筛选「可在线试用」显示 9 张卡片', (await page.locator('.card').count()) === 9)
await page.click('.chip:has-text("仅看介绍")')
await page.waitForTimeout(250)
check('筛选「仅看介绍」显示 3 张卡片', (await page.locator('.card').count()) === 3)
await page.click('.chip:has-text("全部")')
await page.waitForTimeout(250)

// 7. 列表视图切换
await page.click('.view-toggle button[title="列表视图"]')
await page.waitForTimeout(250)
check('列表视图生效', (await page.locator('.card.layout-list').count()) === 12)

// 8. 暗色模式切换
await page.click('.theme-toggle')
await page.waitForTimeout(250)
check('暗色模式生效', await page.evaluate(() => document.documentElement.classList.contains('dark')))

// 9. 移动端单列 + 无溢出
const m = await browser.newPage({ viewport: { width: 390, height: 844 } })
await m.goto(BASE, { waitUntil: 'domcontentloaded' })
await m.waitForSelector('.card')
const mCols = await m.$eval('.grid', (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length)
const mOverflow = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
check('移动端单列', mCols === 1, `实际 ${mCols} 列`)
check('移动端无横向溢出', mOverflow <= 0, `diff=${mOverflow}px`)
await m.close()

// 10. 控制台无错误
check('控制台无报错', errors.length === 0, errors.join(' | ') || 'ok')

await browser.close()
console.log(failed === 0 ? '\n全部通过 ✅' : `\n${failed} 项失败 ❌`)
process.exit(failed === 0 ? 0 : 1)
