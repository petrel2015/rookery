# 开发指南

[English](../en/development.md) | 简体中文 · 文档[索引](./index.md) · 主 [README](../../README.zh.md)

## 环境要求

- **Node.js 18+**（Vite 5 的要求）。本次文档化期间使用 Node v22.22.3 /
  npm 10.9.8 验证。`package.json` 没有 `engines` 字段。
- 可选（浏览器驱动脚本需要）：本机 Chromium。脚本会自动探测 Playwright
  浏览器缓存 `~/Library/Caches/ms-playwright/chromium-1223/...`
  （macOS arm64 路径）；也可用环境变量 `CHROMIUM_PATH` 指向任意
  Chrome/Chromium 可执行文件。

## 命令

下表所有命令都在本次文档化期间（2026-08-27）真实执行并记录了结果。

| 命令 | 作用 | 实测结果 |
| --- | --- | --- |
| `npm ci` | 按 `package-lock.json` 干净安装 | 72 个包，约 2 秒 |
| `npm run dev` | Vite dev server，端口 **5180** | 200 OK；热更新正常 |
| `npm run build` | 生产构建到 `dist/` | 373 ms 构建完成——`index.html` 0.89 kB、CSS 8.55 kB（gzip 2.32 kB）、JS 80.5 kB（gzip 33.77 kB） |
| `npm run preview` | 在端口 **4173** 伺服 `dist/` | 200 OK |
| `node scripts/verify.mjs` | 11 项布局与行为断言（见下） | dev 与 preview 各跑一遍，11/11 全过 |
| `node scripts/shot.mjs` | 截 4 张验证图到 `shots/`（已 gitignore） | 对运行中的服务正常工作 |

端口说明：`vite.config.js` 设了 `server.port: 5180` 但没有
`strictPort`，所以 5180 被占用时 Vite 会静默换到下一个空闲端口（实测
出现过 5181）。**始终以启动输出打印的 URL 为准**；辅助脚本支持
`BASE_URL` 指向别处（见「环境变量」）。

## 断言脚本（`scripts/verify.mjs`）

经 `playwright-core` 驱动真实无头 Chromium，检查：

1. 渲染 12 张卡片（与数据文件当前规模一致）。
2. 已登记的 11 张封面图全部真实加载（`naturalWidth > 0`；第 12 个项目
   刻意无封面）。
3. 桌面端无横向溢出。
4. 1440 px 下桌面网格为 3 列。
5. 同一行的卡片等高。
6. 筛选「游戏」恰好显示 3 张卡片。
7. 列表视图对全部 12 张卡片生效。
8. 暗色切换会给 `<html>` 加上 `dark` 类。
9. 移动端视口（390 px）：单列、无横向溢出。
10. 整个运行过程控制台零报错、零页面错误。

全部通过才返回退出码 0——适合日后接入 CI。用法：

```bash
npm run dev                                            # 终端 1
BASE_URL=http://localhost:5180/ node scripts/verify.mjs  # 终端 2
# 或对生产产物：
npm run build && npm run preview
BASE_URL=http://localhost:4173/ node scripts/verify.mjs
```

## Lint 现状

仓库**没有任何 lint 配置**（无 ESLint / Stylelint / Prettier，无
`lint` 脚本）。代码风格靠约定——新代码请与现有文件保持一致。

## 依赖审计现状

`npm audit`（2026-08-27，v0.1.0 锁文件）报告 **2 条告警：1 中危 +
1 高危**，均在开发工具链：

- `esbuild <= 0.24.2`（中危，GHSA-67mh-4wv8-2f99）：恶意网站可读取运行
  中 `vite dev` server 的响应。
- `vite <= 6.4.2`（高危）：因依赖受影响版本的 esbuild 而被连带标记。

两者都**只影响开发期 server**——发布产物是不含 dev server 的静态
`dist/` 目录。`npm audit fix --force` 会装 Vite 8（破坏性升级），维护者
尚未执行。实际缓解：不要在不受信任的网络环境里长期开着
`npm run dev`。

## 目录结构

```
├── index.html                  入口页；内联的首屏前主题恢复脚本
├── vite.config.js              vue 插件、base './'（子路径安全）、端口 5180
├── public/
│   ├── favicon.svg
│   └── covers/                 随仓库自带的封面图
├── src/
│   ├── main.js                 createApp(App).mount('#app')
│   ├── App.vue                 页面骨架：顶栏、头部、工具条（分类片 +
│   │                           视图切换）、项目墙、页脚；筛选 computed
│   ├── style.css               设计令牌（亮/暗）+ 瑞士风基础样式
│   ├── components/
│   │   └── ProjectCard.vue     单张卡片；网格/列表双布局；占位封面
│   └── data/
│       └── projects.js         PROJECTS + CATEGORIES —— 唯一数据源
├── scripts/
│   ├── verify.mjs              11 项断言（playwright-core）
│   └── shot.mjs                4 张截图到 shots/（playwright-core）
└── docs/                       本文档体系（en/zh + img/）
```

## 环境变量

应用与构建本身不读取任何环境变量。两个辅助脚本会读：

| 变量 | 使用者 | 含义 |
| --- | --- | --- |
| `BASE_URL` | `verify.mjs`、`shot.mjs` | 目标地址；默认 `http://localhost:5180/`。 |
| `CHROMIUM_PATH` | `verify.mjs`、`shot.mjs` | 显式指定 Chrome/Chromium 可执行文件路径，覆盖自动探测的 Playwright 缓存路径。 |

## 在本地验证一次生产构建形态

文档化期间实际使用的完整配方：

```bash
npm ci                       # 干净安装
npm run build                # 产出 dist/
npm run preview              # 在 http://localhost:4173/ 伺服 dist/
BASE_URL=http://localhost:4173/ node scripts/verify.mjs   # 11/11 通过
```

如需进一步模拟子路径托管（GitHub Pages 的 `/rookery/` 形态）：把
`dist/` 放在任意静态服务的 `/rookery/` 前缀下即可——相对 base 意味着
无需重新构建。`docs/img/` 里的截图正是以该形态截取的（12 卡全渲染、
封面全加载、控制台零报错）。见[部署指南](./deployment.md)。
