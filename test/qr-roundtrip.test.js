/* QR 回环测试：用页面同款布局算法（src/utils/qrDraw.js 的 computeQrLayout）
   渲染位图 → jsQR 解码 → 与支付链接逐字一致；并输出 PNG 样张供人工扫码验收。
   注意：不同 QR 库的模块矩阵不保证逐位一致（掩码启发式不同），只比解码回环。 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import jsQR from 'jsqr'
import { PNG } from 'pngjs'
import { DONATION_CONFIG } from '../src/data/donation.js'
import { computeQrLayout } from '../src/utils/qrDraw.js'

const HERE = dirname(fileURLToPath(import.meta.url))

// 与组件绘制一致的参数：深色 #111 前景 + 白色背景
function renderToPng(layout, boost = 1) {
  const quiet = (layout.total - layout.modules) / 2
  const px = layout.px * boost
  const size = px * layout.total
  const png = new PNG({ width: size, height: size })
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = 255
    png.data[i + 1] = 255
    png.data[i + 2] = 255
    png.data[i + 3] = 255
  }
  for (let row = 0; row < layout.modules; row++) {
    for (let col = 0; col < layout.modules; col++) {
      if (!layout.isDark(row, col)) continue
      const x0 = (col + quiet) * px
      const y0 = (row + quiet) * px
      for (let dy = 0; dy < px; dy++) {
        for (let dx = 0; dx < px; dx++) {
          const idx = (size * (y0 + dy) + (x0 + dx)) * 4
          png.data[idx] = 17
          png.data[idx + 1] = 17
          png.data[idx + 2] = 17
        }
      }
    }
  }
  return png
}

test('QR 回环：两个渠道编码参数正确且解码内容逐字一致', async () => {
  for (const [channel, cfg] of Object.entries(DONATION_CONFIG)) {
    const layout = await computeQrLayout(cfg.qrContent)
    assert.ok(layout.modules >= 21 && layout.modules <= 177, `${channel} 自动选型合理`)
    assert.ok((layout.total - layout.modules) / 2 >= 4, `${channel} 静区 ≥ 4 modules`)
    assert.ok(layout.canvasSize <= 220 && layout.px >= 1, `${channel} 画布约 220px`)
    assert.equal(layout.canvasSize, layout.px * layout.total, `${channel} 整数倍缩放`)

    const png = renderToPng(layout)
    const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height)
    assert.ok(decoded, `${channel} jsQR 解码成功`)
    assert.equal(decoded.data, cfg.qrContent, `${channel} 解码内容与支付链接逐字一致`)
  }
})

test('输出可人工扫码的样张', async () => {
  const layout = await computeQrLayout(DONATION_CONFIG.alipay.qrContent)
  const png = renderToPng(layout, 4) // 放大 4 倍便于打印/扫码
  writeFileSync(join(HERE, 'qr-sample-alipay.png'), PNG.sync.write(png))
})
