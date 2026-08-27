# 部署指南

[English](../en/deployment.md) | 简体中文 · 文档[索引](./index.md) · 主 [README](../../README.zh.md)

## 当前状态

**尚未部署**（截至 2026-08-27）：`https://petrel2015.github.io/rookery/`
返回 404，仓库里也还没有部署工作流。构建产物本身开箱即可静态托管；
本页就是配方。

## 部署的是什么

`npm run build` 产出 `dist/`：

- `index.html`——因为 `vite.config.js` 设了 `base: './'`，资源地址被
  重写为相对（`./assets/...`）。
- `assets/`——带哈希的 JS/CSS 包。
- `covers/`、`favicon.svg`——从 `public/` 原样复制。

v0.1.0 的体积：代码资源合计约 90 kB（gzip 后约 36 kB），另加
`public/covers/` 里的封面图。

## 子路径处理（为什么放哪都能用）

一切皆相对：

- 打包后的 JS/CSS 引用 `./assets/...`——相对页面地址解析。
- 数据文件里的封面路径是相对的（`covers/x.webp`，无前导斜杠），在
  `https://user.github.io/rookery/` 下解析为
  `https://user.github.io/rookery/covers/x.webp`。
- `index.html` 引用 `./favicon.svg` 同理。

`github.io/<repo>/`、自定义域名、嵌套路径——同一个构建无需按环境重
build。这一点已在文档化期间本地验证：把 `dist/` 挂在 `/rookery/`
前缀下伺服，12 张卡全渲染、11 张封面全加载、控制台零报错。

## 部署到 GitHub Pages

### 方式 A —— 经典分支部署（无需工作流文件）

1. 本地构建：`npm run build`。
2. 把 `dist/` 发布到托管分支——例如用
   [gh-pages](https://www.npmjs.com/package/gh-pages)：
   `npx gh-pages -d dist`。
3. 仓库 **Settings → Pages** → Source 选 `gh-pages` 分支、`/ (root)`。

### 方式 B —— GitHub Actions（长期推荐）

1. Settings → Pages → Build and deployment → Source 选
   **GitHub Actions**。
2. 添加工作流（`.github/workflows/deploy.yml`）：push 到 `main` 时执行
   `npm ci && npm run build`，用官方 `actions/upload-pages-artifact` /
   `actions/deploy-pages` 上传 `dist/`。（仓库尚未包含——见项目文档的
   Remaining issues。）
3. 可选：部署后加一步 `BASE_URL=<预览地址> node scripts/verify.mjs`
   作为线上验收。

## 自定义域名

无需重新构建（相对 base）。GitHub Pages 下：在 `public/` 放 `CNAME`
文件写入域名，DNS 指过去（`CNAME` 到 `<user>.github.io`，或 A 记录到
Pages 的 IP），证书签发后开启 **Enforce HTTPS**。若换回默认地址，删掉
`CNAME` 文件即可。

## 部署后验证清单

- `curl -s -o /dev/null -w '%{http_code}' https://<host>/<path>/` →
  `200`（注意结尾斜杠；缺省时 GitHub Pages 会重定向）。
- 抽查一张封面：
  `curl -s -o /dev/null -w '%{http_code}' https://<host>/<path>/covers/nback.webp` → `200`。
- 浏览器打开：12 张卡片、图片渲染、切换暗色后刷新（主题持久、不闪白）、
  切到列表视图。
- 全自动验收：
  `BASE_URL=https://<host>/<path>/ node scripts/verify.mjs` → 11/11。

## 其它静态主机

任意 Web 服务器或 CDN 都可以（nginx、Caddy、Netlify、Cloudflare Pages、
对象存储静态托管）：上传 `dist/` 的全部内容，根路径落到 `index.html`
即可。没有服务端渲染、不需要 rewrite 规则、没有要设置的环境变量。
