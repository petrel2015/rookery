/* 二维码布局计算与 canvas 绘制 —— 组件与测试共用同一份算法。
   QR 库只在弹窗首次打开后才通过动态 import 加载，首屏零开销。 */

const QR_DISPLAY_SIZE = 220 // 展示尺寸 px
const QR_ECC = 'M' // 纠错等级 M
const QR_QUIET_MODULES = 4 // 静区 ≥ 4 modules

let qrLibPromise = null

function loadQrLib() {
  if (!qrLibPromise) {
    qrLibPromise = import('qrcode-generator').then((m) => m.default || m)
  }
  return qrLibPromise
}

// 按内容计算模块矩阵与画布尺寸；整数倍缩放保证模块边缘锐利
export async function computeQrLayout(content) {
  const qrcode = await loadQrLib()
  const qr = qrcode(0, QR_ECC) // typeNumber 0 = 按内容自动选型
  qr.addData(content)
  qr.make()
  const modules = qr.getModuleCount()
  const total = modules + QR_QUIET_MODULES * 2
  const px = Math.max(1, Math.floor(QR_DISPLAY_SIZE / total))
  return {
    isDark: (row, col) => qr.isDark(row, col),
    modules,
    total,
    px,
    canvasSize: px * total
  }
}

// 二维码本体永远是深色前景 + 白色背景，扫码成功率优先于视觉统一
export async function drawQrToCanvas(canvas, content) {
  const layout = await computeQrLayout(content)
  canvas.width = layout.canvasSize
  canvas.height = layout.canvasSize
  const ctx = canvas.getContext && canvas.getContext('2d')
  if (!ctx) return null // 环境不支持 canvas 时跳过绘制（提示文案仍可用）
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, layout.canvasSize, layout.canvasSize)
  ctx.fillStyle = '#111111'
  for (let row = 0; row < layout.modules; row++) {
    for (let col = 0; col < layout.modules; col++) {
      if (layout.isDark(row, col)) {
        ctx.fillRect(
          (col + QR_QUIET_MODULES) * layout.px,
          (row + QR_QUIET_MODULES) * layout.px,
          layout.px,
          layout.px
        )
      }
    }
  }
  return layout
}
