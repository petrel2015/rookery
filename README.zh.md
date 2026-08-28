# Rookery · 个人项目墙

[English](./README.md) | 简体中文

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Vue](https://img.shields.io/badge/Vue-3.5-42b883)
![Vite](https://img.shields.io/badge/Vite-5.4-646cff)
![Backend](https://img.shields.io/badge/backend-none-success)
![Output](https://img.shields.io/badge/output-pure%20static-success)

> **rookery** /ˈrʊkəri/ —— 海鸟（海燕）群居繁殖的岩礁。petrel 的每一件作品都是一只海燕，这里让它们聚居在一起。

Rookery 是一个纯前端的个人项目墙：一张静态页面，图文并茂地聚合作者的小工具与小游戏。每个卡片展示一张封面截图、项目名称、一句话定位、简短介绍，以及 GitHub / 在线体验链接。

它解决的问题：当你的 side project 散落在十几个仓库里，README 里的纯文字清单既看不出东西长什么样，也容易腐烂失修。Rookery 用一个数据文件做唯一事实源，把所有封面图随仓库自带（展示墙不依赖其它仓库的可用性），渲染出一个可按分类筛选的卡片墙——零后端、零运行时服务。

> AI 助手与 Agent：如需本项目的结构化、机器友好描述，见
> [README_FOR_AI.md](./README_FOR_AI.md)（仅英文）。

## 在线演示

截至 2026-08-27 尚未部署——构建产物是纯静态目录，可直接上 GitHub Pages 或任意静态主机。部署只需一页指南，见[部署文档](./docs/zh/deployment.md)；上线后此处会补上地址。

## 为什么做这个

- **一个数据文件，一堵墙。** `src/data/projects.js` 是项目登记的唯一入口，UI 不硬编码任何项目信息。上项目 = 改数据，不是改组件。设计取舍见[数据驱动的项目墙](./docs/zh/features/data-driven-wall.md)。
- **封面图随仓库自带。** 封面复制进 `public/covers/`，即使被链接的仓库改名或消失，展示墙照常渲染。
- **没截图也能上墙。** 没有封面图的项目自动渲染「坐标纸 + 首字母」占位封面，发布永远不会被截图阻塞。
- **零后端。** 无服务器、无 API、无数据库——部署产物就是一个静态文件目录。

## 功能

### 网格 / 列表双视图

网格是「上图下文」的卡片墙（响应式：宽屏 3~4 列、平板 2 列、手机 1 列）；列表是「左图右文」的横向条目。选择会跨访问持久化。

![列表视图](docs/img/list-view-light.webp)

### 分类筛选

全部 / 可在线试用 / 仅看介绍，每个分类片带实时数量角标（当前为 12 / 9 / 3）。
分类按是否配置 `demo` 链接划分：配了「在线体验」的项目归入「可在线试用」，其余只能看介绍。

![暗色模式下的「仅看介绍」分类筛选](docs/img/overview-grid-dark.webp)

### 暗色模式

手动切换，默认跟随系统偏好，选择持久化到 `localStorage`。`index.html` 里的内联脚本会在首屏绘制前恢复主题，不会闪白。

### 无截图兜底

没有截图的项目得到一张生成的「坐标纸 + 首字母」占位封面——永远不会有裂图。

![占位封面](docs/img/cover-fallback.webp)

完整项目墙如下（亮色模式，全部 12 个项目）：

![亮色模式下的完整项目墙](docs/img/overview-grid-light.webp)

包含移动端在内的详细行为见[使用指南](./docs/zh/usage.md)。

## 快速开始

```bash
npm install
npm run dev     # http://localhost:5180
```

生产构建与本地预览构建产物：

```bash
npm run build   # 产物在 dist/，base 为相对路径
npm run preview # 在 http://localhost:4173/ 伺服 dist/
```

可选的质量脚本（需要本机 Chromium，见[开发指南](./docs/zh/development.md)）：

```bash
node scripts/verify.mjs  # 11 项布局与行为断言
node scripts/shot.mjs    # 截 4 张验证图到 shots/
```

## 如何让新海燕入巢

放一张封面截图（建议 16:10 左右的桌面截图，webp/png 均可）到 `public/covers/`，然后在 `src/data/projects.js` 的 `PROJECTS` 数组里追加一条记录：

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

没有截图可留空 `cover`（渲染占位封面）；没有在线演示可留空 `demo`（卡片只显示 GitHub 按钮）。完整字段说明见[使用指南 · 添加项目](./docs/zh/usage.md#添加项目)。

## 技术栈

| 层 | 选型 | 说明 |
| --- | --- | --- |
| 框架 | Vue 3.5（Composition API，SFC） | 单页，无路由、无状态库 |
| 构建 | Vite 5.4 + @vitejs/plugin-vue | `base: './'` → 可部署到任意子路径 |
| 样式 | 原生 CSS，设计令牌在 `src/style.css` | 瑞士国际主义风格：纸白、墨黑、一抹红 |
| 数据 | 纯 JS 模块 `src/data/projects.js` | 唯一事实源，无 CMS |
| 开发工具 | playwright-core（devDependency） | 驱动 `scripts/verify.mjs` / `scripts/shot.mjs` |

## 架构概要

```
index.html ── 内联主题恢复脚本（暗色模式不闪白）
   └── src/main.js ── 挂载 App.vue
          ├── src/data/projects.js    PROJECTS + CATEGORIES（唯一数据源）
          └── src/components/ProjectCard.vue   每个项目一张卡
                 ├── 网格布局：上图下文
                 └── 列表布局：左图右文
public/covers/*   随仓库自带的封面图
```

筛选是对 `PROJECTS` 的一个 `computed`；视图与主题偏好存 `localStorage`（`pw-layout`、`pw-theme`）。没有路由、没有 store、没有网络层。带注释的目录树见[开发指南](./docs/zh/development.md)。

## 文档

| 文档 | 中文 | English |
| --- | --- | --- |
| 文档索引 | [简体中文](./docs/zh/index.md) | [English](./docs/en/index.md) |
| 使用指南 | [简体中文](./docs/zh/usage.md) | [English](./docs/en/usage.md) |
| 开发指南 | [简体中文](./docs/zh/development.md) | [English](./docs/en/development.md) |
| 部署指南 | [简体中文](./docs/zh/deployment.md) | [English](./docs/en/deployment.md) |
| 故障排查 | [简体中文](./docs/zh/troubleshooting.md) | [English](./docs/en/troubleshooting.md) |
| 隐私说明 | [简体中文](./docs/zh/privacy.md) | [English](./docs/en/privacy.md) |
| 常见问题 | [简体中文](./docs/zh/faq.md) | [English](./docs/en/faq.md) |
| 功能设计：数据驱动的项目墙 | [简体中文](./docs/zh/features/data-driven-wall.md) | [English](./docs/en/features/data-driven-wall.md) |
| 更新日志 | [CHANGELOG.zh.md](./CHANGELOG.zh.md) | [CHANGELOG.md](./CHANGELOG.md) |

## 兼容性

任意现代常青浏览器（Chrome / Edge / Firefox / Safari）。UI 依赖 CSS 自定义属性、`clamp()`、`aspect-ratio`、grid 端等特性；不附带 polyfill，不以旧浏览器为目标。

## 更新日志

见 [CHANGELOG.zh.md](./CHANGELOG.zh.md)。仓库尚无 Git tag；更新日志以 v0.1.0（2026-08-27）作为首个汇总发布条目。

## 参与贡献

这是个人展示墙，项目清单由维护者本人策展。Bug 与建议欢迎提 GitHub Issue。如果你 fork 做自己的墙，只需替换 `src/data/projects.js` 与 `public/covers/`——见[使用指南 · 添加项目](./docs/zh/usage.md#添加项目)。

## 许可证说明

**尚未选择许可证**——截至 2026-08-27 仓库中没有 `LICENSE` 文件，默认保留所有权利。如需复用代码，请先开 Issue 询问。（这一节也是对维护者的提醒：选定许可证后，请同步更新本节与 `README_FOR_AI.md`。）
