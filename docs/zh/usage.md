# 使用指南

[English](../en/usage.md) | 简体中文 · 文档[索引](./index.md) · 主 [README](../../README.zh.md)

## 浏览展示墙

![完整项目墙 · 亮色 · 桌面端](../img/overview-grid-light.webp)

展示墙分三个区域：

- **顶栏**——ROOKERY 品牌字、GitHub 主页链接、主题切换按钮（☾ / ☀）。
- **工具条**（吸附置顶）——左侧分类片，右侧视图切换。每个分类片带实时
  数量角标；数字只在数据文件变化时才会变化（v0.1.0 时为 12 / 2 / 7 / 3）。
- **项目墙**——每个项目一张卡。

手机端（390 px 视口）网格收成单列，工具条不再吸附：

![移动端视图](../img/mobile-grid.webp)

## 切换视图与主题

- **视图切换**（工具条右端）在网格与列表间切换。列表视图在桌面端为
  「左图右文」，680 px 以下纵向堆叠；描述的截断行数从 3 行变为 2 行。

  ![列表视图](../img/list-view-light.webp)

- **主题切换**在亮暗间切换。初始主题跟随系统偏好
  （`prefers-color-scheme`）；一旦手动切换，你的选择优先生效并存入
  `localStorage`（`pw-theme`）。布局选择同理（`pw-layout`）。两个键都会
  保留到你在浏览器里清除站点数据为止——详见[隐私说明](./privacy.md)。

- **分类片**筛选项目墙，切换带短促淡入动画。分类按能否在线试用划分：
  配了 `demo` 链接的项目归入「可在线试用」，其余为「仅看介绍」。空分类会显示
  「该分类暂无项目。」。

每张卡片的封面与标题指向该项目**注册了的在线演示；没有演示则指向其
GitHub 仓库**——都在新标签页打开（`rel="noopener"`）。卡片底部是
GitHub 按钮；存在演示时再加一个按钮，文案按项目注册（默认「在线体验」，
游戏类如「在线试玩」）。

## 添加项目

添加项目 = 改一条数据 + 放一张图——不动任何组件。设计取舍见
[数据驱动的项目墙](./features/data-driven-wall.md)。

1. 复制一张封面图到 `public/covers/`（见[封面图建议](#封面图建议)）。
2. 在 `src/data/projects.js` 的 `PROJECTS` 数组追加一条记录。
3. 刷新 dev server 页面（Vite 热更新自动生效）——完成。

```js
{
  id: 'my-project',
  name: 'My Project',
  tagline: '一句话定位',
  desc: '两三句话介绍。',
  tags: ['标签一', '标签二'],
  category: 'tool',          // ext=扩展与应用 tool=在线工具 game=游戏（仅用于卡片徽章与首页指标）
  cover: 'covers/my-project.webp',
  github: 'https://github.com/petrel2015/my-project',
  demo: 'https://petrel2015.github.io/my-project/', // 配了才进「可在线试用」分类
  demoLabel: '在线体验',      // 可选
  year: 2026,
}
```

### 项目记录字段

| 字段 | 必填 | 行为 |
| --- | --- | --- |
| `id` | 是 | 唯一 slug，用作 Vue 列表 key。 |
| `name` | 是 | 卡片标题；同时生成占位封面的首字母与封面图的 `alt` 文案。 |
| `tagline` | 是 | 一句话定位，以强调色渲染在标题下方。 |
| `desc` | 是 | 简短介绍；网格视图截断 3 行，列表视图 2 行。 |
| `tags` | 是 | 短标签数组，渲染为描边小片。 |
| `category` | 是 | `ext` / `tool` / `game` 三选一，驱动筛选片。固定集合——新增分类需同文件编辑 `CATEGORIES`。 |
| `cover` | 否 | `public/` 下的相对路径，无前导斜杠——如 `covers/nback.webp`。留空渲染占位封面。 |
| `coverFit` | 否 | `'cover'`（默认铺满）或 `'contain'`（居中留白——适配 App 图标类素材）。 |
| `github` | 是 | 仓库地址；渲染 GitHub 按钮。 |
| `demo` | 否 | 在线地址。存在时卡片多一个按钮，且标题/封面指向这里而非 GitHub。留空则只有 GitHub 按钮。 |
| `demoLabel` | 否 | 演示按钮与封面角标的文案；默认「在线体验」。 |
| `year` | 否 | 显示在卡片正文右上角；不写则不显示。 |

### 封面图建议

- 格式：优先 WebP（PNG 亦可）；**16:10 左右的桌面截图**与卡片比例最合
  （网格封面为 `aspect-ratio: 16/10`）。
- 文件放入 `public/covers/`，引用写 `covers/<文件>.webp`——相对路径、
  无前导斜杠（这正是构建对子路径安全的原因）。
- App 图标 / 非截图素材：用近似方形的图并加 `coverFit: 'contain'`。
- 还没有截图？`cover` 留空即可。卡片会渲染「坐标纸 + 项目首字（中文名
  取首字，英文名取前两个字母）+ 红点」的占位封面——发布永远不会被
  截图阻塞。

  ![占位封面](../img/cover-fallback.webp)

- 推荐来源：从项目自己的 `docs/img/` 复制截图，让展示墙持有自己的
  副本、不依赖那个仓库。

### 删除或排序

删掉记录（可顺带删封面文件）即下墙；数组顺序即上墙顺序。分类片上的
数量角标自动更新。

## 预览你的改动

```bash
npm run dev      # http://localhost:5180 —— 编辑时热更新
npm run build    # 生产构建产物在 dist/
npm run preview  # 在 http://localhost:4173/ 伺服 dist/
```

对运行中的实例（dev 或 preview）跑布局与行为断言：

```bash
BASE_URL=http://localhost:4173/ node scripts/verify.mjs
```

完整命令参考见[开发指南](./development.md)。
