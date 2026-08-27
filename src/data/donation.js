/* 「请作者喝杯咖啡」赞赏功能 —— 配置与文案（唯一数据源）
   不保存任何二维码图片：二维码由浏览器按 qrContent 原始字符串实时生成。 */

export const DONATION_CONFIG = {
  alipay: {
    name: '支付宝',
    qrContent: 'https://qr.alipay.com/fkx16432isyyhmx9ttwpi79'
  },
  wechat: {
    name: '微信支付',
    // wxp:// 只是二维码 payload，永远不用于页面跳转
    qrContent: 'wxp://f2f1fJpOcJc7F-MSeLMxALhc6tWu-oohtxueHRbCe98bMy2AmDunimuOJFv-8bjobLBM'
  }
}

// 站点主语言为中文（index.html lang="zh-CN"），文案取统一规范中文对照表
export const DONATION_TEXT = {
  entry: '☕ 请作者喝杯咖啡',
  title: '请作者喝杯咖啡 ☕',
  subtitle: '如果这个小工具帮到了你，可以请作者喝杯咖啡。',
  scanAlipay: '打开支付宝扫一扫',
  scanWechat: '打开微信扫一扫',
  mobileFallback: '没有自动打开？请使用支付宝 / 微信扫码',
  qrError: '二维码生成失败，请稍后重试',
  close: '关闭'
}
