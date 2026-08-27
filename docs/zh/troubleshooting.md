# 故障排查

[English](../en/troubleshooting.md) | 简体中文 · 文档[索引](./index.md) · 主 [README](../../README.zh.md)

以下症状均来自实际观察或可由代码直接推导，按出现概率排序。若此处
帮不上忙，请开 GitHub Issue 并附：浏览器及版本、操作系统、访问的
URL、浏览器控制台输出。

## 常见问题

| 症状 | 可能原因（按顺序排查） | 修复 |
| --- | --- | --- |
| `npm run dev` 打印的端口不是 5180（如 5181） | 5180 已被占用；因未设 `strictPort`，Vite 自动换下一个空闲端口 | 以 Vite 打印的 URL 为准。释放端口：`lsof -nP -iTCP:5180 -sTCP:LISTEN` 后结束对应进程。辅助脚本用 `BASE_URL` 指向真实端口。 |
| `scripts/verify.mjs` 或 `shot.mjs` 报「未找到可用的 Chromium」 | 自动探测的 Playwright 缓存路径（`~/Library/Caches/ms-playwright/chromium-1223/...`）下没有 Chromium——换了机器，或缓存版本不同 | 设 `CHROMIUM_PATH=/path/to/Chrome` 指向任意 Chrome/Chromium 可执行文件，或安装对应版本的 Playwright 浏览器缓存。 |
| 新加的项目没出现 | ① `src/data/projects.js` 语法错误（Vite 会显示错误浮层 / 控制台报错）→ ② 记录加在了 `PROJECTS` 数组外面 → ③ 文件没保存 | 修语法、确认记录在 `PROJECTS` 内；保存后 Vite 自动热更新。 |
| 明明设了 `cover`，卡片仍是坐标纸占位图 | ① `public/covers/` 里没有该文件 → ② 路径写错（必须相对、无前导斜杠、文件名连扩展名完全一致）→ ③ 图片是构建后才放进 `public/` 的，`dist/` 已过期 | 确认文件在 `public/covers/` 下、记录写的是 `covers/<精确文件名>`，然后重新 `npm run build`。 |
| 自托管 `dist/` 上封面 404 | 服务器的文档根目录没包含 `public/` 复制过来的资源（只传了 `index.html` + `assets/`），或服务器做了路径改写 | 上传**整个** `dist/` 目录；检查构建后 `dist/covers/` 存在；不需要任何 rewrite 规则。 |
| 部署后页面能开但 JS/CSS 404 | 构建时 base 被改成了绝对路径（有人动了 `base: './'`），或上传时多套了一层目录 | 保持 `vite.config.js` 里 `base: './'`；按 `index.html` 与 `assets/` 同级的结构上传 `dist/` 内容。 |
| 主题或视图选择刷新后丢失 | `localStorage` 不可用——隐私窗口限制，或页面嵌在沙箱 iframe 里 | 预期降级：应用回退到系统配色偏好与默认网格布局；首屏恢复脚本有 try/catch 包裹，页面照常渲染。 |
| 怀疑布局/行为回归 | —— | 对可疑实例跑 `node scripts/verify.mjs`（`BASE_URL=...`）；它检查卡片数、图片加载、溢出、列数、等高、筛选、视图、暗色、移动端与控制台洁净度。 |
