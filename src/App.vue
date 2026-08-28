<script setup>
import { ref, computed } from 'vue'
import { PROJECTS, CATEGORIES } from './data/projects.js'
import { lang, t, setLang } from './i18n.js'
import ProjectCard from './components/ProjectCard.vue'
import DonationButton from './components/DonationButton.vue'

const GITHUB_PROFILE = 'https://github.com/petrel2015'

// 默认落在「可在线试用」：进页面先看到能直接上手的作品
const activeCategory = ref('demo')
const layout = ref(localStorage.getItem('pw-layout') || 'grid')
const dark = ref(document.documentElement.classList.contains('dark'))

const filtered = computed(() => {
  if (activeCategory.value === 'all') return PROJECTS
  if (activeCategory.value === 'demo') return PROJECTS.filter((p) => p.demo)
  return PROJECTS.filter((p) => !p.demo)
})

const countOf = (id) => {
  if (id === 'all') return PROJECTS.length
  if (id === 'demo') return PROJECTS.filter((p) => p.demo).length
  return PROJECTS.filter((p) => !p.demo).length
}

// 指标条 + 点阵条：挂载时由唯一数据源实时统计
// 点阵语义：一方块 = 一个项目；紫 = 分类型指标，黄 = 全部对比（黄仅做色块）
const stats = computed(() => [
  { v: PROJECTS.length, k: t.value.stats[0], dot: 'y', hl: true },
  { v: countOf('ext'), k: t.value.stats[1], dot: '', hl: false },
  { v: countOf('tool'), k: t.value.stats[2], dot: '', hl: false },
  { v: countOf('game'), k: t.value.stats[3], dot: '', hl: false },
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

function toggleLang() {
  setLang(lang.value === 'zh' ? 'en' : 'zh')
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
          <button class="lang-toggle eyebrow" type="button"
            :aria-label="lang === 'zh' ? 'Switch to English' : '切换到中文'"
            @click="toggleLang">{{ lang === 'zh' ? 'EN' : '中' }}</button>
          <button class="theme-toggle" type="button" :title="dark ? t.themeToLight : t.themeToDark"
            :aria-label="dark ? t.themeToLightAria : t.themeToDarkAria" @click="toggleDark">
            {{ dark ? '☀' : '☾' }}
          </button>
        </nav>
      </div>
    </header>

    <!-- 封面式头部：紫 kicker + 大衬线标题（唯一紫词）+ lede + 指标条/点阵条 -->
    <section class="hero container">
      <p class="kicker">{{ t.kicker }}</p>
      <h1 class="hero-title">{{ t.title }}<span class="accent">{{ t.titleAccent }}</span></h1>
      <p class="hero-lede">{{ t.lede }}</p>
      <div class="hero-stats">
        <div class="metric-strip">
          <div v-for="s in stats" :key="s.k" class="m">
            <div class="v" :class="{ hl: s.hl }">{{ s.v }}</div>
            <div class="k">{{ s.k }}</div>
            <span class="dots" aria-hidden="true">
              <i v-for="n in s.v" :key="n" :class="s.dot"></i>
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- 工具条：分类筛选（pill 胶囊）+ 视图切换 -->
    <div class="toolbar-wrap">
      <div class="container toolbar">
        <div class="chips" role="tablist" :aria-label="t.filtersAria">
          <button
            v-for="c in CATEGORIES"
            :key="c.id"
            class="chip"
            :class="{ active: activeCategory === c.id }"
            type="button"
            @click="activeCategory = c.id"
          >
            {{ t.chips[c.id] }}<span class="chip-count">{{ countOf(c.id) }}</span>
          </button>
        </div>
        <div class="view-toggle" role="group" :aria-label="t.viewAria">
          <button
            type="button"
            :class="{ active: layout === 'grid' }"
            :title="t.gridTitle"
            :aria-label="t.gridTitle"
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
            :title="t.listTitle"
            :aria-label="t.listTitle"
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

    <!-- 项目墙：章节头（黄方点）+ 项目条目 -->
    <main class="container wall">
      <p class="sec-no">{{ t.secNo }}</p>
      <figure class="chart-frame">
        <figcaption class="chart-title">{{ t.chartTitle }}</figcaption>
        <transition name="fade" mode="out-in">
          <div :key="activeCategory + layout + lang" :class="layout === 'grid' ? 'grid' : 'list'">
            <ProjectCard v-for="p in filtered" :key="p.id" :project="p" :layout="layout" />
          </div>
        </transition>
        <p class="chart-src">{{ t.chartSrc }}</p>
        <p class="chart-foot">{{ t.chartFoot }}</p>
      </figure>
      <p v-if="filtered.length === 0" class="empty warn-note">{{ t.empty }}</p>
    </main>

    <!-- 页脚：研究札记 + 徽章图例 + 免责声明 -->
    <footer class="footer">
      <div class="container">
        <div class="note-box">
          <p class="note-label">{{ t.noteLabel }}</p>
          <p>
            {{ t.noteBefore }}<code class="mono-path">src/data/projects.js</code>{{ t.noteAfter }}
          </p>
        </div>
        <div class="footer-legend" :aria-label="t.legend.join(' / ')">
          <span class="legend-item"><span class="badge b1">EXT</span>{{ t.legend[0] }}</span>
          <span class="legend-item"><span class="badge b2">TOOL</span>{{ t.legend[1] }}</span>
          <span class="legend-item"><span class="badge b3">GAME</span>{{ t.legend[2] }}</span>
        </div>
        <div class="footer-inner eyebrow">
          <span>© 2026 PETREL2015</span>
          <DonationButton />
          <span>{{ t.footerMeta }}</span>
        </div>
        <p class="footer-disc">{{ t.disc }}</p>
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

/* 黄方点（与 .sec-no / favicon 同一语法；黄只做色块） */
.brand-square {
  width: 8px;
  height: 8px;
  background: var(--hl);
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.topbar-link:hover {
  color: var(--brand);
}

.lang-toggle,
.theme-toggle {
  height: 30px;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: transparent;
  color: var(--ink);
  font-size: 12px;
  transition: border-color 0.15s ease;
}

.lang-toggle {
  padding: 0 9px;
}

.theme-toggle {
  width: 30px;
  font-size: 14px;
}

.lang-toggle:hover,
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
  color: var(--brand);
}

.hero-lede {
  max-width: 620px;
  margin: 18px 0 0;
  font-size: 16.5px;
  color: var(--ink-md);
  line-height: 1.78;
}

.hero-stats {
  margin-top: 34px;
  max-width: 840px;
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

/* pill 胶囊：紫描边 + 悬停/激活反白（紫 = 交互识别） */
.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  font-family: var(--serif);
  font-size: 12.5px;
  font-weight: 700;
  color: var(--brand);
  background: var(--paper);
  border: 1.5px solid var(--brand);
  border-radius: 999px;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.chip:hover,
.chip.active {
  background: var(--brand);
  color: #fff;
}

.chip-count {
  font-family: var(--mono);
  font-size: 10.5px;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  opacity: 0.75;
}

/* 视图切换：分段式发丝线控件，激活为墨底（墨 = 参照，不与紫争当期） */
.view-toggle {
  display: flex;
  border: 1px solid var(--line);
  border-radius: 999px;
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

/* ---------- 项目墙：章节头 + 图表四件套容器 ---------- */
.wall {
  flex: 1;
  /* 纵向 flex 子项默认 min-width:auto，会被卡片内容撑出横向滚动 */
  min-width: 0;
  padding-top: 26px;
  padding-bottom: 56px;
}

.wall .sec-no {
  max-width: none;
  margin-bottom: 18px;
}

.chart-frame {
  margin: 6px 0 0;
}

.chart-title {
  font-weight: 700;
  font-size: 17.5px;
  letter-spacing: -0.01em;
  margin: 0 0 22px;
  padding-bottom: 12px;
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

/* 空分类 = 缺数据，走警示语义（红仅此处出现） */
.empty {
  margin: 40px auto 0;
  max-width: 420px;
  text-align: center;
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

/* ---------- 页脚：研究札记 ---------- */
.footer {
  border-top: 1px solid var(--line);
  padding: 36px 0 44px;
}

.footer .note-box {
  max-width: 840px;
}

.mono-path {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--brand);
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
