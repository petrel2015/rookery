# Rookery · 个人项目墙

[English](./README.md) | 简体中文

> **rookery** /ˈrʊkəri/ —— 海鸟（海燕）群居繁殖的岩礁。petrel 的每一件作品都是一只海燕，这里让它们聚居在一起。

纯前端（Vue 3 + Vite，零后端）的个人项目展示墙：图文并茂地聚合我在 GitHub 上的小工具与小游戏——每个卡片一张封面截图 + 项目名称 + 一句话定位 + 介绍 + GitHub / 在线体验链接。

## 功能

- **网格 / 列表双视图**：网格为「上图下文」的卡片墙（响应式，宽屏 3~4 列、平板 2 列、手机 1 列）；列表为「左图右文」的横向条目。
- **分类筛选**：全部 / 扩展与应用 / 在线工具 / 游戏，带数量角标。
- **暗色模式**：手动切换，跟随系统偏好初始化，选择持久化到 localStorage。
- **无截图兜底**：没有封面图的项目自动渲染「坐标纸 + 首字母」的占位封面，上墙不被截图阻塞。

## 开发

```bash
npm install
npm run dev     # http://localhost:5180
npm run build   # 产物在 dist/，base 为相对路径
npm run preview
```

另有两个辅助脚本（依赖 `playwright-core` + 本机 Chromium，仅开发期使用）：

```bash
node scripts/shot.mjs    # 对 dev server 截四张验证图到 shots/
node scripts/verify.mjs  # 布局与功能断言（卡片数/图片加载/溢出/等高/筛选/视图/暗色/移动端）
```

## 如何让新海燕入巢

1. 放一张封面截图到 `public/covers/`（建议 16:10 左右的桌面截图，webp/png 均可）。
2. 在 `src/data/projects.js` 的 `PROJECTS` 数组里追加一条记录：

```js
{
  id: 'my-project',
  name: 'My Project',
  tagline: '一句话定位',
  desc: '两三句话介绍。',
  tags: ['标签一', '标签二'],
  category: 'tool',          // ext=扩展与应用 tool=在线工具 game=游戏
  cover: 'covers/my-project.webp',
  github: 'https://github.com/petrel2015/my-project',
  demo: 'https://petrel2015.github.io/my-project/',
  demoLabel: '在线体验',      // 可选，游戏类可写「在线试玩」
  year: 2026,
}
```

没有截图可留空 `cover`；没有在线演示可留空 `demo`（卡片只显示 GitHub 按钮）。

## 部署

构建产物是纯静态文件，任选其一：

- **GitHub Pages**：推送仓库后 Settings → Pages → GitHub Actions（或 `gh-pages` 分支），无需额外配置，`base: './'' 已兼容子路径。
- **本地直开**：`npm run build` 后用任意静态服务器打开 `dist/`。

## 约定

- 数据唯一入口是 `src/data/projects.js`，UI 不硬编码任何项目信息。
- 封面图随仓库自带（复制自各项目的 `docs/img/`），展示墙不依赖各仓库的可用性。
