<script setup>
import { ref, computed } from 'vue'
import { PROJECTS, CATEGORIES } from './data/projects.js'
import ProjectCard from './components/ProjectCard.vue'
import DonationButton from './components/DonationButton.vue'

const GITHUB_PROFILE = 'https://github.com/petrel2015'

const activeCategory = ref('all')
const layout = ref(localStorage.getItem('pw-layout') || 'grid')
const dark = ref(document.documentElement.classList.contains('dark'))

const filtered = computed(() =>
  activeCategory.value === 'all'
    ? PROJECTS
    : PROJECTS.filter((p) => p.category === activeCategory.value)
)

const countOf = (id) =>
  id === 'all' ? PROJECTS.length : PROJECTS.filter((p) => p.category === id).length

// 指标条：挂载时由唯一数据源实时统计（可溯源）
const stats = computed(() => [
  { v: PROJECTS.length, k: '全部项目' },
  { v: countOf('ext'), k: '扩展与应用' },
  { v: countOf('tool'), k: '在线工具' },
  { v: countOf('game'), k: '游戏' },
])

function setLayout(mode) {
  layout.value = mode
  localStorage.setItem('pw-layout', mode)
}

function toggleDark() {
  dark.value = !dark.value
  document.documentElement.classList.toggle('dark', dark.value)
  localStorage.setItem('pw-theme', dark.value ? 'dark' : 'light')
}
</script>

<template>
  <div class="page">
    <!-- 顶栏：研报 masthead -->
    <header class="topbar">
      <div class="container topbar-inner">
        <span class="brand eyebrow">ROOKERY<span class="brand-square"></span></span>
        <nav class="topbar-actions">
          <a class="topbar-link eyebrow" :href="GITHUB_PROFILE" target="_blank" rel="noopener">GITHUB ↗</a>
          <button class="theme-toggle" type="button" :title="dark ? '切换到亮色' : '切换到暗色'"
            :aria-label="dark ? '切换到亮色模式' : '切换到暗色模式'" @click="toggleDark">
            {{ dark ? '☀' : '☾' }}
          </button>
        </nav>
      </div>
    </header>

    <!-- 封面式头部：kicker + 大衬线标题（唯一蓝词）+ lede + 指标条 -->
    <section class="hero container">
      <p class="kicker">ROOKERY / 海燕的聚居地 · 个人项目墙</p>
      <h1 class="hero-title">做点小东西<span class="accent">。</span></h1>
      <p class="hero-lede">工具要顺手，游戏要好玩，全部纯前端。每只海燕都是一件作品。</p>
      <div class="hero-stats">
        <div class="metric-strip">
          <div v-for="s in stats" :key="s.k" class="m">
            <div class="v">{{ s.v }}</div>
            <div class="k">{{ s.k }}</div>
          </div>
        </div>
        <p class="hero-src">SOURCE: src/data/projects.js · 页面挂载时统计</p>
      </div>
    </section>

    <!-- 工具条：分类筛选（chips）+ 视图切换 -->
    <div class="toolbar-wrap">
      <div class="container toolbar">
        <div class="chips" role="tablist" aria-label="项目分类">
          <button
            v-for="c in CATEGORIES"
            :key="c.id"
            class="chip"
            :class="{ active: activeCategory === c.id }"
            type="button"
            @click="activeCategory = c.id"
          >
            {{ c.label }}<span class="chip-count">{{ countOf(c.id) }}</span>
          </button>
        </div>
        <div class="view-toggle" role="group" aria-label="视图切换">
          <button
            type="button"
            :class="{ active: layout === 'grid' }"
            title="网格视图"
            aria-label="网格视图"
            @click="setLayout('grid')"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <rect x="1" y="1" width="6" height="6" fill="currentColor" />
              <rect x="9" y="1" width="6" height="6" fill="currentColor" />
              <rect x="1" y="9" width="6" height="6" fill="currentColor" />
              <rect x="9" y="9" width="6" height="6" fill="currentColor" />
            </svg>
          </button>
          <button
            type="button"
            :class="{ active: layout === 'list' }"
            title="列表视图"
            aria-label="列表视图"
            @click="setLayout('list')"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <rect x="1" y="2" width="14" height="2.6" fill="currentColor" />
              <rect x="1" y="6.7" width="14" height="2.6" fill="currentColor" />
              <rect x="1" y="11.4" width="14" height="2.6" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 项目墙：图表四件套容器（图题 / 图例副题 / 数据区 / 来源行 / 注脚） -->
    <main class="container wall">
      <figure class="chart-frame">
        <figcaption class="chart-title">每件作品都跑在浏览器里：纯静态、零后端、断网也能完整重放</figcaption>
        <p class="chart-sub">
          serif = 项目条目 · mono = 年份与标签 · blue = 可在线体验 · 点击条目下钻仓库
        </p>
        <transition name="fade" mode="out-in">
          <div :key="activeCategory + layout" :class="layout === 'grid' ? 'grid' : 'list'">
            <ProjectCard v-for="p in filtered" :key="p.id" :project="p" :layout="layout" />
          </div>
        </transition>
        <p class="chart-src">SOURCE: petrel2015/GitHub · 各项目仓库 README 与在线部署</p>
        <p class="chart-foot">NOTE: 封面为各项目界面截图；无截图项目渲染首字母占位封面。</p>
      </figure>
      <p v-if="filtered.length === 0" class="empty">该分类暂无项目。</p>
    </main>

    <!-- 页脚：方法论 + 徽章图例 + 免责声明 -->
    <footer class="footer">
      <div class="container">
        <div class="note-box">
          <p>
            本页是纯静态单页应用：项目数据唯一来源为仓库内的
            <code class="mono-path">src/data/projects.js</code>，随构建打包，运行期零请求、零埋点。
            视图与主题偏好仅保存在浏览器 localStorage，不上传任何信息；「在线体验」链接指向各项目的
            GitHub Pages 部署。
          </p>
        </div>
        <div class="footer-legend" aria-label="分类图例">
          <span class="legend-item"><span class="badge b-blue">EXT</span>扩展与应用</span>
          <span class="legend-item"><span class="badge b-green">TOOL</span>在线工具</span>
          <span class="legend-item"><span class="badge b-violet">GAME</span>游戏</span>
        </div>
        <div class="footer-inner eyebrow">
          <span>© 2026 PETREL2015</span>
          <DonationButton />
          <span>VUE 3 + VITE · 纯静态，可托管到 GITHUB PAGES</span>
        </div>
        <p class="footer-disc">
          DISCLAIMER — 项目信息由作者自述并随仓库发布，页面不收集任何用户数据。
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ---------- 顶栏 masthead ---------- */
.topbar {
  border-bottom: 1px solid var(--line);
  background: var(--paper);
  position: sticky;
  top: 0;
  z-index: 10;
}

.topbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--ink);
  font-weight: 700;
}

/* 电光蓝方形弹点（era-tag 语法） */
.brand-square {
  width: 6px;
  height: 6px;
  background: var(--blue);
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.topbar-link:hover {
  color: var(--blue);
}

.theme-toggle {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: transparent;
  color: var(--ink);
  font-size: 14px;
  transition: border-color 0.15s ease;
}

.theme-toggle:hover {
  border-color: var(--ink);
}

/* ---------- 封面式头部 ---------- */
.hero {
  padding: 68px 28px 48px;
}

.hero-title {
  margin: 0;
  font-size: clamp(44px, 6.2vw, 76px);
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.08;
}

.hero-title .accent {
  color: var(--blue);
}

.hero-lede {
  max-width: 620px;
  margin: 18px 0 0;
  font-size: 16.5px;
  color: var(--ink-md);
  line-height: 1.75;
}

.hero-stats {
  margin-top: 34px;
  max-width: 800px;
  border-top: 1px solid var(--line-lo);
  padding-top: 18px;
}

.hero-src {
  margin: 16px 0 0;
  font-family: var(--mono);
  font-size: 10px;
  color: var(--ink-lo);
  letter-spacing: 0.04em;
}

/* ---------- 工具条 ---------- */
.toolbar-wrap {
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  background: var(--paper);
  position: sticky;
  top: 52px;
  z-index: 9;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 12px;
  padding-bottom: 12px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* chips：衬线粗体 + 墨描边 + 6px 圆角；hover / active 实心蓝（全页唯一按钮形态） */
.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 13px;
  font-family: var(--serif);
  font-size: 12.5px;
  font-weight: 700;
  color: var(--ink);
  background: var(--paper);
  border: 1.5px solid var(--ink);
  border-radius: 6px;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.chip:hover,
.chip.active {
  background: var(--blue);
  border-color: var(--blue);
  color: #fff;
}

.chip-count {
  font-family: var(--mono);
  font-size: 10.5px;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  opacity: 0.75;
}

/* 视图切换：分段式发丝线控件，激活为墨底 */
.view-toggle {
  display: flex;
  border: 1px solid var(--line);
  border-radius: 4px;
  overflow: hidden;
}

.view-toggle button {
  width: 36px;
  height: 32px;
  display: grid;
  place-items: center;
  border: none;
  background: transparent;
  color: var(--ink-lo);
  transition: background-color 0.15s ease, color 0.15s ease;
}

.view-toggle button + button {
  border-left: 1px solid var(--line);
}

.view-toggle button.active {
  background: var(--ink);
  color: var(--paper);
}

/* ---------- 项目墙：图表四件套容器 ---------- */
.wall {
  flex: 1;
  /* 纵向 flex 子项默认 min-width:auto，会被卡片内容撑出横向滚动 */
  min-width: 0;
  padding-top: 14px;
  padding-bottom: 56px;
}

.chart-frame {
  margin: 28px 0 0;
}

.chart-title {
  font-weight: 700;
  font-size: 17.5px;
  letter-spacing: -0.01em;
  margin: 0 0 3px;
}

.chart-sub {
  font-family: var(--mono);
  font-size: 10.5px;
  color: var(--ink-lo);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin: 0 0 22px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--line-lo);
}

.chart-src {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--ink-lo);
  margin: 26px 0 4px;
}

.chart-foot {
  font-family: var(--mono);
  font-size: 9.5px;
  color: var(--ink-lo);
  margin: 0;
  letter-spacing: 0.01em;
}

.grid {
  display: grid;
  /* min() 兜底：320px 窄屏下轨道不撑破容器 */
  grid-template-columns: repeat(auto-fill, minmax(min(310px, 100%), 1fr));
  gap: 22px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.empty {
  text-align: center;
  color: var(--ink-lo);
  padding: 60px 0;
}

/* 切换动画（尊重 reduced-motion） */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}

/* ---------- 页脚：方法论 ---------- */
.footer {
  border-top: 1px solid var(--line);
  padding: 36px 0 44px;
}

.footer .note-box {
  max-width: 800px;
}

.mono-path {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--blue);
}

.footer-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin: 18px 0 26px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  color: var(--ink-md);
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.footer-disc {
  margin: 22px 0 0;
  padding-top: 12px;
  border-top: 1px dotted var(--line);
  font-family: var(--mono);
  font-size: 10px;
  color: var(--ink-lo);
  letter-spacing: 0.04em;
}

@media (max-width: 640px) {
  .hero {
    padding: 44px 18px 32px;
  }

  .toolbar-wrap {
    position: static;
  }
}
</style>
