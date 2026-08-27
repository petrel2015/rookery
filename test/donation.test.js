/* 交互逻辑测试：构建真实产物（vite build）→ jsdom 注入浏览器全局 →
   import 入口 chunk 挂载应用 → 驱动真实交互。
   覆盖：入口文案、弹窗开关、渠道切换、焦点管理、手机端 window.open
   与同会话不重复跳转、二维码绘制参数、QR 库懒加载与 chunk 分离。 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'vite'
import { JSDOM } from 'jsdom'
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import qrcodeFactory from 'qrcode-generator'
import { DONATION_CONFIG, DONATION_TEXT } from '../src/data/donation.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const tick = (ms = 40) => new Promise((r) => setTimeout(r, ms))

// ---------- 构建与产物检查 ----------

await build({ root: ROOT, logLevel: 'warn' })
const dist = join(ROOT, 'dist')
const entrySrc = readFileSync(join(dist, 'index.html'), 'utf8').match(/src="([^"]+\.js)"/)[1]

// 与页面绘制公式一致的期望画布尺寸（不同内容模块数不同 → 尺寸不同）
function expectedCanvasSize(content) {
  const qr = qrcodeFactory(0, 'M')
  qr.addData(content)
  qr.make()
  const total = qr.getModuleCount() + 8
  const px = Math.max(1, Math.floor(220 / total))
  return px * total
}

// ---------- jsdom 环境（在 import 产物之前注入全局） ----------

const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true
})
const w = dom.window
// navigator/location 等在 Node 22 下是只读 getter，需 defineProperty 覆盖
for (const [name, value] of Object.entries({
  window: w,
  document: w.document,
  navigator: w.navigator,
  localStorage: w.localStorage,
  location: w.location,
  history: w.history,
  HTMLElement: w.HTMLElement,
  HTMLCanvasElement: w.HTMLCanvasElement,
  SVGElement: w.SVGElement,
  Element: w.Element,
  Node: w.Node,
  Event: w.Event,
  CustomEvent: w.CustomEvent,
  MouseEvent: w.MouseEvent,
  KeyboardEvent: w.KeyboardEvent,
  MutationObserver: w.MutationObserver,
  getComputedStyle: w.getComputedStyle,
  requestAnimationFrame: w.requestAnimationFrame,
  cancelAnimationFrame: w.cancelAnimationFrame
})) {
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true })
}

// canvas 2d 上下文 stub：jsdom 无原生 2d，记录绘制调用
const canvasLog = []
w.HTMLCanvasElement.prototype.getContext = function () {
  const canvas = this
  let style = null
  return {
    set fillStyle(v) {
      style = v
    },
    get fillStyle() {
      return style
    },
    fillRect(x, y, width, height) {
      canvasLog.push({ canvas, style, x, y, width, height })
    }
  }
}

let openCalls = []
w.open = (...args) => {
  openCalls.push(args)
  return null
}

const DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
function setUA(ua) {
  Object.defineProperty(w.navigator, 'userAgent', { get: () => ua, configurable: true })
}

// ---------- 加载产物并挂载 ----------

setUA(DESKTOP_UA)
await import(pathToFileURL(join(dist, entrySrc)).href)

/* 全部测试在模块求值完成后注册：若顶层 await 挂起期间存在已注册测试，
   node:test 会与其交错执行，产物挂载的应用会被提前回收。 */

function qrMarkerCheck() {
  const assetsDir = join(dist, 'assets')
  const files = readdirSync(assetsDir).filter((f) => f.endsWith('.js'))
  // qrcode-generator 内部的字符串字面量，压缩后仍保留（类名会被混淆，字符串不会）
  const LIB_MARKER = 'preserveAspectRatio='
  const entryJs = readFileSync(join(dist, entrySrc), 'utf8')
  const libFiles = files.filter((f) => readFileSync(join(assetsDir, f), 'utf8').includes(LIB_MARKER))
  assert.ok(!entryJs.includes(LIB_MARKER), '主入口 chunk 不含 QR 库代码')
  assert.equal(libFiles.length, 1, `QR 库独立懒加载 chunk：${libFiles.join(', ')}`)
  assert.match(libFiles[0], /^qrcode-/, '懒加载 chunk 由 qrcode-generator 动态 import 产生')
}

test('构建产物：QR 库与主入口 chunk 分离（懒加载）', qrMarkerCheck)

const $ = (sel) => document.querySelector(sel)
const $$ = (sel) => [...document.querySelectorAll(sel)]
const rectsFor = (canvas) => canvasLog.filter((e) => e.canvas === canvas)

async function openDialog() {
  const entry = $('.donate-entry')
  entry.focus()
  entry.click()
  await tick()
  return entry
}

function switchTab(name) {
  $$('.donation-tab').find((t) => t.textContent.trim() === name).click()
}

test('Footer 入口：文案与可访问性属性', () => {
  const entry = $('.footer .donate-entry')
  assert.ok(entry, '入口位于 Footer')
  assert.equal(entry.textContent, DONATION_TEXT.entry)
  assert.equal(entry.textContent, '☕ 请作者喝杯咖啡', '入口文案逐字符合规范')
  assert.equal(entry.getAttribute('aria-haspopup'), 'dialog')
})

test('挂载后、未打开弹窗前：无 QR 相关加载痕迹', () => {
  const nodes = $$('script[src], link[href]')
  assert.ok(nodes.every((n) => !/qrcode/i.test(n.src || n.href)), '页面无 QR 库 script/link')
  assert.equal(openCalls.length, 0)
})

test('打开弹窗：默认支付宝、标题文案、焦点移入', async () => {
  await openDialog()
  assert.ok($('.donation-overlay'), '弹窗已打开')
  assert.equal($('.donation-dialog').getAttribute('role'), 'dialog')
  assert.equal($('.donation-dialog').getAttribute('aria-modal'), 'true')
  assert.equal($('.donation-title').textContent, '请作者喝杯咖啡 ☕')
  assert.equal($('.donation-subtitle').textContent, '如果这个小工具帮到了你，可以请作者喝杯咖啡。')

  const tabs = $$('.donation-tab')
  assert.equal(tabs.length, 2)
  assert.equal(tabs.map((t) => t.textContent.trim()).join('｜'), '支付宝｜微信支付')
  const active = $('.donation-tab.active')
  assert.equal(active.textContent.trim(), '支付宝', '默认渠道为支付宝')
  assert.equal(active.getAttribute('aria-pressed'), 'true')
  assert.equal(tabs[1].getAttribute('aria-pressed'), 'false')
  assert.equal(document.activeElement, tabs[0], '打开后焦点移入当前渠道 tab')
})

test('桌面端：二维码绘制参数（白底、深色模块、整数倍缩放）', async () => {
  const canvas = $('.donation-qr')
  assert.ok(canvas, 'canvas 存在')
  await tick(120) // 首次动态 import QR 库
  const rects = rectsFor(canvas)
  assert.ok(rects.length > 50, `绘制了深色模块（${rects.length - 1} 个）`)
  assert.equal(rects[0].style, '#ffffff', '先铺白色背景')
  assert.equal(rects[0].x, 0)
  assert.equal(rects[0].width, canvas.width, '背景覆盖整幅画布')
  assert.equal(rects[0].height, canvas.height)
  assert.ok(rects.slice(1).every((r) => r.style === '#111111'), '模块为深色前景')
  assert.ok(rects.slice(1).every((r) => r.width === r.height && r.width > 1), '模块为正方形（整数倍缩放）')
  assert.equal(canvas.width, expectedCanvasSize(DONATION_CONFIG.alipay.qrContent), '画布尺寸与公式一致')
  assert.equal(canvas.getAttribute('aria-label'), '支付宝收款二维码')
  assert.equal($('[data-donation-hint]').textContent, '打开支付宝扫一扫', '桌面端扫码提示')
  assert.equal(openCalls.length, 0, '桌面端不尝试唤起支付')
})

test('切换微信支付：tab 状态、提示与二维码重绘', async () => {
  const canvas = $('.donation-qr')
  canvasLog.length = 0
  switchTab('微信支付')
  await tick(120)
  assert.equal($('.donation-tab.active').textContent.trim(), '微信支付')
  assert.equal($('[data-donation-hint]').textContent, '打开微信扫一扫', '微信扫码提示')
  assert.equal(canvas.getAttribute('aria-label'), '微信支付收款二维码')
  assert.equal(canvas.width, expectedCanvasSize(DONATION_CONFIG.wechat.qrContent), '按微信内容重绘')
  assert.notEqual(
    expectedCanvasSize(DONATION_CONFIG.wechat.qrContent),
    expectedCanvasSize(DONATION_CONFIG.alipay.qrContent),
    '两渠道内容不同 → 尺寸可区分'
  )
  assert.ok(rectsFor(canvas).length > 50, '微信码已绘制')
  assert.equal(openCalls.length, 0, '桌面端微信同样不跳转')
})

test('切回支付宝：恢复提示，不额外跳转', async () => {
  canvasLog.length = 0
  switchTab('支付宝')
  await tick(120)
  assert.equal($('[data-donation-hint]').textContent, '打开支付宝扫一扫')
  assert.equal($('.donation-qr').width, expectedCanvasSize(DONATION_CONFIG.alipay.qrContent))
  assert.equal(openCalls.length, 0)
})

test('关闭按钮与焦点归还', async () => {
  const entry = $('.donate-entry')
  const closeBtn = $('.donation-close')
  assert.equal(closeBtn.getAttribute('aria-label'), '关闭')
  closeBtn.click()
  await tick(120)
  assert.ok(!$('.donation-overlay'), '弹窗已关闭')
  assert.equal(document.activeElement, entry, '焦点归还入口按钮')
})

test('ESC 关闭', async () => {
  await openDialog()
  document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  await tick(120)
  assert.ok(!$('.donation-overlay'), 'ESC 关闭弹窗')
})

test('点遮罩关闭；点对话框内容不关闭', async () => {
  await openDialog()
  $('.donation-title').dispatchEvent(new w.MouseEvent('click', { bubbles: true }))
  await tick()
  assert.ok($('.donation-overlay'), '点击弹窗内容不误关')
  $('.donation-overlay').dispatchEvent(new w.MouseEvent('click', { bubbles: false }))
  await tick(120)
  assert.ok(!$('.donation-overlay'), '点击遮罩关闭')
})

// ---------- 手机端 ----------

test('手机端支付宝：打开即跳官方收款链接，二维码常驻兜底', async () => {
  setUA(MOBILE_UA)
  assert.ok(/Mobi|Android|iPhone|iPad|iPod/i.test(w.navigator.userAgent), 'UA 覆盖生效（jsdom 陷阱防护）')
  openCalls = []
  await openDialog()
  assert.deepEqual(
    openCalls,
    [[DONATION_CONFIG.alipay.qrContent, '_blank', 'noopener']],
    'window.open 官方 https 链接，target=_blank + noopener'
  )
  assert.equal($('[data-donation-hint]').textContent, '没有自动打开？请使用支付宝 / 微信扫码', '手机兜底提示')
  const canvas = $('.donation-qr')
  await tick(120)
  assert.ok(rectsFor(canvas).length > 50, '二维码始终可见')
})

test('同一弹窗会话至多跳转一次；手机微信不跳转', async () => {
  switchTab('微信支付')
  await tick()
  assert.equal(openCalls.length, 1, '切到微信不新增跳转')
  switchTab('支付宝')
  await tick()
  assert.equal(openCalls.length, 1, '切回支付宝不重复跳转')
  assert.equal($('[data-donation-hint]').textContent, '没有自动打开？请使用支付宝 / 微信扫码')
})

test('重新打开弹窗：跳转次数随会话重置', async () => {
  $('.donation-close').click()
  await tick(120)
  await openDialog()
  assert.equal(openCalls.length, 2, '新弹窗会话允许再次尝试跳转')
})

test.after(() => {
  dom.window.close()
})
