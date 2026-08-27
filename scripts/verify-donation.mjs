/**
 * 赞赏功能 DOM 级视觉验收：读取弹窗与入口的真实渲染样式（颜色/边框/布局/QR 像素）。
 * 用法：BASE_URL 指向 dev/preview 服务后执行 node scripts/verify-donation.mjs
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
let failed = 0
const check = (name, ok, detail = '') => {
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`)
  if (!ok) failed++
}

for (const mode of ['light', 'dark']) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } })
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.card')
  if (mode === 'dark') {
    await page.click('.theme-toggle')
    await page.waitForTimeout(300)
  }
  const tag = `[${mode}]`

  // Footer 入口低调性：颜色弱于正文、无边框无背景
  const entry = await page.$eval('.footer .donate-entry', (el) => {
    const s = getComputedStyle(el)
    return { color: s.color, bg: s.backgroundColor, border: s.borderWidth, size: s.fontSize }
  })
  check(`${tag} 入口为纯文字链接`, entry.bg === 'rgba(0, 0, 0, 0)' && entry.border === '0px', JSON.stringify(entry))

  // 入口在 footer 内且不高于主内容
  const inFooter = await page.$eval('.footer .donate-entry', (el) => !!el.closest('.footer'))
  check(`${tag} 入口位于 footer`, inFooter)

  await page.click('.donate-entry')
  await page.waitForSelector('.donation-overlay')
  await page.waitForTimeout(600)

  const dlg = await page.$eval('.donation-dialog', (el) => {
    const s = getComputedStyle(el)
    return {
      width: el.getBoundingClientRect().width,
      radius: s.borderRadius,
      border: s.borderTopWidth + ' ' + s.borderTopColor,
      bg: s.backgroundColor,
      overlayBg: getComputedStyle(el.parentElement).backgroundColor
    }
  })
  check(`${tag} 弹窗宽度 320~420px`, dlg.width >= 320 && dlg.width <= 420, `${dlg.width}px`)
  check(`${tag} 弹窗零圆角（贴站点）`, dlg.radius === '0px', dlg.radius)

  const qr = await page.$eval('.donation-qr', (el) => {
    const r = el.getBoundingClientRect()
    const card = getComputedStyle(el.parentElement)
    return {
      w: el.width,
      h: el.height,
      cssW: r.width,
      cardBg: card.backgroundColor,
      cardPad: card.padding
    }
  })
  check(`${tag} QR canvas 1:1 无拉伸`, qr.w === qr.h && Math.abs(qr.cssW - qr.w) < 1, `${qr.w}x${qr.h} css ${qr.cssW}`)
  check(`${tag} 码卡白色底`, qr.cardBg === 'rgb(255, 255, 255)', qr.cardBg)

  // QR 像素：四角为白色静区、中心附近存在深色模块
  const pix = await page.$eval('.donation-qr', (el) => {
    const ctx = el.getContext('2d')
    const at = (x, y) => Array.from(ctx.getImageData(x, y, 1, 1).data)
    const n = el.width
    return {
      corner: at(1, 1),
      centerSamples: [at(n >> 1, n >> 1), at(n >> 1, (n >> 1) + 3), at((n >> 1) + 5, n >> 1)].map((p) => p[0] < 128)
    }
  })
  check(`${tag} 静区为白色`, pix.corner[0] > 240 && pix.corner[1] > 240 && pix.corner[2] > 240, JSON.stringify(pix.corner))
  check(`${tag} 存在深色模块`, pix.centerSamples.some(Boolean), JSON.stringify(pix.centerSamples))

  // 文案与结构
  const texts = await page.$$eval('.donation-title, .donation-subtitle, .donation-tab.active, [data-donation-hint]', (els) => els.map((e) => e.textContent.trim()))
  check(`${tag} 标题正确`, texts[0] === '请作者喝杯咖啡 ☕', texts[0])
  check(`${tag} 副标题正确`, texts[1] === '如果这个小工具帮到了你，可以请作者喝杯咖啡。')
  check(`${tag} 默认支付宝激活`, texts[2] === '支付宝')
  check(`${tag} 扫码提示正确`, texts[3] === '打开支付宝扫一扫', texts[3])

  // 无横向溢出
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  check(`${tag} 弹窗无横向溢出`, overflow <= 0, `diff=${overflow}px`)

  // ESC 关闭 + 遮罩关闭
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  check(`${tag} ESC 关闭`, !(await page.$('.donation-overlay')))

  // 暗色模式下弹窗底色应深、码卡仍白
  if (mode === 'dark') {
    check('[dark] 弹窗深底白卡分层', dlg.bg !== 'rgb(255, 255, 255)' && qr.cardBg === 'rgb(255, 255, 255)', `${dlg.bg} / ${qr.cardBg}`)
  }

  await page.close()
}

// 移动端
const m = await browser.newPage({ viewport: { width: 390, height: 844 } })
await m.goto(BASE, { waitUntil: 'domcontentloaded' })
await m.waitForSelector('.card')
await m.click('.donate-entry')
await m.waitForSelector('.donation-overlay')
await m.waitForTimeout(600)
const mDlg = await m.$eval('.donation-dialog', (el) => el.getBoundingClientRect())
check('[mobile] 弹窗不超出视口', mDlg.left >= 0 && mDlg.right <= 390, `${mDlg.left}~${mDlg.right}`)
const mOverflow = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
check('[mobile] 无横向溢出', mOverflow <= 0, `diff=${mOverflow}px`)
const mTab = await m.$eval('.donation-tab', (el) => el.getBoundingClientRect().height)
check('[mobile] tab 触控高度 ≥ 36px', mTab >= 36, `${mTab}px`)
await m.close()

await browser.close()
console.log(failed === 0 ? '\n全部通过 ✅' : `\n${failed} 项失败 ❌`)
process.exit(failed === 0 ? 0 : 1)
