/**
 * 缩略图重拍脚本：逐个访问有在线部署的项目，重拍 1600×1000 封面。
 * PNG → webp 用 Chromium canvas 编码（本机无 cwebp）。
 * 用法：node scripts/shot-covers.mjs   （无需 dev server，访问的是线上站点）
 */
import { chromium } from 'playwright-core'
import { writeFileSync, existsSync, readFileSync } from 'node:fs'

const EXEC =
  process.env.CHROMIUM_PATH ||
  [
    process.env.HOME + '/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell',
  ].find((p) => existsSync(p))
if (!EXEC) throw new Error('未找到可用的 Chromium，可设 CHROMIUM_PATH 指定')

// 与 src/data/projects.js 的 demo 链接一一对应（quota-watcher 无部署，跳过）
const SITES = [
  { id: 'qr-studio', url: 'https://petrel2015.github.io/qr-studio/', settle: 1200 },
  { id: 'crossword-studio', url: 'https://petrel2015.github.io/crossword-studio/', settle: 1200 },
  { id: 'markdown-press', url: 'https://petrel2015.github.io/markdown-press/', settle: 1500 },
  { id: 'json-viewer', url: 'https://petrel2015.github.io/json-viewer/', settle: 1200 },
  { id: 'password-generator', url: 'https://petrel2015.github.io/password-generator/', settle: 1200 },
  { id: 'timestamp-tool', url: 'https://petrel2015.github.io/timestamp-tool/', settle: 1200 },
  { id: 'gecko-monte', url: 'https://petrel2015.github.io/gecko-monte/', settle: 2000 },
  { id: 'nback', url: 'https://petrel2015.github.io/nback/', settle: 1500 },
  { id: 'space-impact', url: 'https://petrel2015.github.io/space-impact/', settle: 2500 },
]

const browser = await chromium.launch({ executablePath: EXEC })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })

for (const { id, url, settle } of SITES) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(settle) // 等字体加载/入场动画/游戏启动
    const png = await page.screenshot({ type: 'png' })

    // canvas 编码 webp（Chromium 原生支持）
    const webp = await page.evaluate(async (b64) => {
      const img = new Image()
      img.src = 'data:image/png;base64,' + b64
      await img.decode()
      const c = document.createElement('canvas')
      c.width = img.width
      c.height = img.height
      c.getContext('2d').drawImage(img, 0, 0)
      const data = c.toDataURL('image/webp', 0.85)
      const bin = atob(data.split(',')[1])
      return Uint8Array.from(bin, (ch) => ch.charCodeAt(0))
    }, png.toString('base64'))

    writeFileSync(`public/covers/${id}.webp`, webp)
    console.log(`✓ covers/${id}.webp  (${webp.length} bytes)`)
  } catch (e) {
    console.log(`✗ ${id}: ${e.message.split('\n')[0]}`)
  }
}

await browser.close()
