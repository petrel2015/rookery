/* 合同断言（防回退）：
   - 不得出现 alipays:// 等自定义支付 scheme
   - 不得保存/引用任何二维码图片文件
   - 入口与弹窗文案与统一规范逐字一致（本站为中文站）
   - QR 库必须懒加载：仅 qrDraw.js 以动态 import() 引用 qrcode-generator
   - donation-* / donate-* 类名在模板与样式间对账 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { DONATION_CONFIG, DONATION_TEXT } from '../src/data/donation.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DONATION_SOURCES = [
  'src/data/donation.js',
  'src/utils/qrDraw.js',
  'src/components/DonationButton.vue',
  'src/components/DonationDialog.vue',
  'src/App.vue'
].map((p) => join(ROOT, p))
const read = (p) => readFileSync(p, 'utf8')

test('支付配置与规范一致（唯一数据源）', () => {
  assert.equal(DONATION_CONFIG.alipay.qrContent, 'https://qr.alipay.com/fkx16432isyyhmx9ttwpi79')
  assert.equal(
    DONATION_CONFIG.wechat.qrContent,
    'wxp://f2f1fJpOcJc7F-MSeLMxALhc6tWu-oohtxueHRbCe98bMy2AmDunimuOJFv-8bjobLBM'
  )
})

test('文案与统一规范逐字一致（中文站）', () => {
  assert.equal(DONATION_TEXT.entry, '☕ 请作者喝杯咖啡')
  assert.equal(DONATION_TEXT.title, '请作者喝杯咖啡 ☕')
  assert.equal(DONATION_TEXT.subtitle, '如果这个小工具帮到了你，可以请作者喝杯咖啡。')
  assert.equal(DONATION_TEXT.scanAlipay, '打开支付宝扫一扫')
  assert.equal(DONATION_TEXT.scanWechat, '打开微信扫一扫')
  assert.equal(DONATION_TEXT.mobileFallback, '没有自动打开？请使用支付宝 / 微信扫码')
  assert.equal(DONATION_TEXT.close, '关闭')
  assert.equal(DONATION_CONFIG.alipay.name, '支付宝')
  assert.equal(DONATION_CONFIG.wechat.name, '微信支付')
})

test('不出现 alipays:// 等自定义支付 scheme', () => {
  for (const p of DONATION_SOURCES) {
    assert.ok(!read(p).includes('alipays://'), `${p} 不含 alipays://`)
  }
})

test('不保存/引用任何二维码图片', () => {
  for (const p of DONATION_SOURCES) {
    assert.ok(!/\.(png|jpe?g|svg)['"`/]/i.test(read(p)), `${p} 不引用二维码图片文件`)
  }
  // public/ 不得新增赞赏相关静态资源（covers/ 为既有项目封面，按名称区分）
  const publicFiles = existsSync(join(ROOT, 'public'))
    ? readdirSync(join(ROOT, 'public'), { recursive: true })
    : []
  const offenders = publicFiles.filter((f) => /donat|coffee|tip|alipay|wechat|pay\b/i.test(String(f)))
  assert.deepEqual(offenders, [], 'public/ 无赞赏相关图片')
})

test('QR 库懒加载：仅 qrDraw.js 动态 import，其余源码零 QR 引用', () => {
  for (const p of DONATION_SOURCES) {
    const src = read(p)
    if (p.endsWith('qrDraw.js')) {
      assert.match(src, /import\('qrcode-generator'\)/, 'qrDraw.js 用动态 import 加载 QR 库')
      assert.ok(!/from\s+'qrcode-generator'/.test(src), 'qrDraw.js 不静态 import QR 库')
    } else {
      assert.ok(!src.includes('qrcode-generator'), `${p} 不直接引用 QR 库`)
    }
  }
  const main = read(join(ROOT, 'src/main.js'))
  assert.ok(!main.includes('qrcode'), '入口文件不含 QR 相关代码')
})

test('donation-* / donate-* 类名与 scoped 样式对账', () => {
  for (const p of DONATION_SOURCES.filter(
    (x) => x.endsWith('.vue') && /Donation(Button|Dialog)\.vue$/.test(x)
  )) {
    const src = read(p)
    const tpl = src.slice(src.indexOf('<template>'), src.lastIndexOf('</template>'))
    const style = src.slice(src.indexOf('<style'), src.lastIndexOf('</style>'))
    const names = new Set()
    for (const m of tpl.matchAll(/class="([^"]+)"/g)) {
      for (const c of m[1].split(/\s+/)) {
        if (/^(donation|donate)-/.test(c)) names.add(c)
      }
    }
    assert.ok(names.size > 0, `${p} 模板中存在赞赏类名`)
    for (const c of names) {
      assert.ok(style.includes(`.${c}`), `${p} 模板类 ${c} 在样式中定义`)
    }
  }
})

test('Footer 入口位于页脚且不抢主操作视觉', () => {
  const src = read(join(ROOT, 'src/App.vue'))
  const template = src.slice(src.indexOf('<template>'), src.lastIndexOf('</template>'))
  const footer = template.slice(template.indexOf('<footer'), template.indexOf('</footer>'))
  assert.ok(footer.includes('<DonationButton'), '入口组件位于 footer 内')
  assert.ok(
    !template.slice(0, template.indexOf('<footer')).includes('DonationButton'),
    'Header/正文无入口'
  )
})
