import { ref, computed } from 'vue'

/**
 * 轻量双语层：中文为默认与规范语言，英文为运行时叠加。
 * 项目名 / 描述 / 标签来自数据文件，不在此翻译。
 */
const zh = {
  htmlLang: 'zh-CN',
  docTitle: 'Rookery · 个人项目墙',
  kicker: 'ROOKERY / 海燕的聚居地 · 个人项目墙',
  title: '做点小东西',
  titleAccent: '。',
  lede: '工具要顺手，游戏要好玩，全部纯前端。每只海燕都是一件作品。',
  stats: ['全部项目', '扩展与应用', '在线工具', '游戏'],
  chips: { all: '全部', demo: '可在线试用', intro: '仅看介绍' },
  filtersAria: '项目筛选',
  secNo: '§1 · ROOKERY WALL · 项目墙',
  chartTitle: '每件作品都跑在浏览器里：纯静态、零后端、断网也能完整重放',
  chartSrc: 'SOURCE: petrel2015/GitHub · 各项目仓库 README 与在线部署',
  chartFoot: 'NOTE: 封面为各项目界面截图；无截图项目渲染首字母占位封面。',
  empty: '该分类暂无项目。',
  gridTitle: '网格视图',
  listTitle: '列表视图',
  viewAria: '视图切换',
  themeToLight: '切换到亮色',
  themeToDark: '切换到暗色',
  themeToLightAria: '切换到亮色模式',
  themeToDarkAria: '切换到暗色模式',
  noteLabel: '研究札记 · Research note',
  noteBefore: '本页是纯静态单页应用：项目数据唯一来源为仓库内的 ',
  noteAfter: '，随构建打包，运行期零请求、零埋点。视图与主题偏好仅保存在浏览器 localStorage，不上传任何信息；「在线体验」链接指向各项目的 GitHub Pages 部署。',
  legend: ['扩展与应用', '在线工具', '游戏'],
  footerMeta: 'VUE 3 + VITE · 纯静态，可托管到 GITHUB PAGES',
  disc: 'DISCLAIMER — 项目信息由作者自述并随仓库发布，页面不收集任何用户数据。',
  demoDefault: '在线体验',
  demoMap: {},
}

const en = {
  htmlLang: 'en',
  docTitle: 'Rookery · Project Wall',
  kicker: "ROOKERY / A PETREL'S ROOKERY · PROJECT WALL",
  title: 'Small things,',
  titleAccent: ' done.',
  lede: 'Handy tools, fun games — all pure front-end. Every petrel here is a piece of craft.',
  stats: ['Projects', 'Extensions', 'Tools', 'Games'],
  chips: { all: 'All', demo: 'Try online', intro: 'Intro only' },
  filtersAria: 'Project filters',
  secNo: '§1 · ROOKERY WALL',
  chartTitle: 'Everything runs in the browser: static, serverless, fully replayable offline',
  chartSrc: 'SOURCE: petrel2015/GitHub · project READMEs & live deployments',
  chartFoot: 'NOTE: covers are live screenshots; projects without one render an initial-letter placeholder.',
  empty: 'No projects in this category.',
  gridTitle: 'Grid view',
  listTitle: 'List view',
  viewAria: 'View switcher',
  themeToLight: 'Switch to light',
  themeToDark: 'Switch to dark',
  themeToLightAria: 'Switch to light mode',
  themeToDarkAria: 'Switch to dark mode',
  noteLabel: 'Research note',
  noteBefore: 'This page is a static single-page app: project data comes solely from ',
  noteAfter: ' in the repo, bundled at build time — zero runtime requests, zero tracking. View and theme preferences stay in browser localStorage; nothing is uploaded. “Try online” links point to each project’s GitHub Pages deployment.',
  legend: ['Extensions & apps', 'Online tools', 'Games'],
  footerMeta: 'VUE 3 + VITE · fully static, hosts on GITHUB PAGES',
  disc: 'DISCLAIMER — project info is self-published by the author. This page collects no user data.',
  demoDefault: 'Live demo',
  demoMap: { '在线体验': 'Live demo', '在线试玩': 'Play online', '在线训练': 'Train online' },
}

const LANGS = { zh, en }

export const lang = ref(localStorage.getItem('pw-lang') === 'en' ? 'en' : 'zh')
export const t = computed(() => LANGS[lang.value])

export function setLang(l) {
  lang.value = l
  localStorage.setItem('pw-lang', l)
  applyLang()
}

function applyLang() {
  document.documentElement.lang = t.value.htmlLang
  document.title = t.value.docTitle
}
applyLang()

// 赞赏文案英文叠加：中文规范在 src/data/donation.js（契约测试逐字锁定）
export const EN_DONATION = {
  entry: '☕ Buy me a coffee',
  title: 'Buy me a coffee ☕',
  subtitle: 'If this little tool helped you, you can buy the author a coffee.',
  scanAlipay: 'Open Alipay and scan',
  scanWechat: 'Open WeChat and scan',
  mobileFallback: 'Didn’t open? Scan the QR code with Alipay / WeChat',
  qrError: 'QR failed to render — take a screenshot instead',
  close: 'Close',
  nameAlipay: 'Alipay',
  nameWechat: 'WeChat Pay',
  qrAlipay: 'Alipay QR code',
  qrWechat: 'WeChat Pay QR code',
}
