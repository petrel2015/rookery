<script setup>
import { ref, computed } from 'vue'
import { PROJECTS, CATEGORIES } from './data/projects.js'
import ProjectCard from './components/ProjectCard.vue'

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
    <!-- 顶栏 -->
    <header class="topbar">
      <div class="container topbar-inner">
        <span class="brand eyebrow">ROOKERY<span class="brand-dot"></span></span>
        <nav class="topbar-actions">
          <a class="topbar-link eyebrow" :href="GITHUB_PROFILE" target="_blank" rel="noopener">GITHUB ↗</a>
          <button class="theme-toggle" type="button" :title="dark ? '切换到亮色' : '切换到暗色'"
            :aria-label="dark ? '切换到亮色模式' : '切换到暗色模式'" @click="toggleDark">
            {{ dark ? '☀' : '☾' }}
          </button>
        </nav>
      </div>
    </header>

    <!-- 头部 -->
    <section class="hero container">
      <p class="eyebrow hero-eyebrow">ROOKERY / 海燕的聚居地 · 个人项目墙</p>
      <h1 class="hero-title">
        做点小东西<span class="hero-accent">。</span><br />
        <span class="hero-sub">工具要顺手，游戏要好玩，全部纯前端。每只海燕都是一件作品。</span>
      </h1>
      <p class="hero-meta eyebrow">
        {{ PROJECTS.length }} PROJECTS · ZERO BACKEND · BROWSER ONLY
      </p>
    </section>

    <!-- 工具条：分类筛选 + 视图切换 -->
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

    <!-- 项目墙 -->
    <main class="container wall">
      <transition name="fade" mode="out-in">
        <div :key="activeCategory + layout" :class="layout === 'grid' ? 'grid' : 'list'">
          <ProjectCard v-for="p in filtered" :key="p.id" :project="p" :layout="layout" />
        </div>
      </transition>
      <p v-if="filtered.length === 0" class="empty">该分类暂无项目。</p>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container footer-inner eyebrow">
        <span>© 2026 PETREL2015</span>
        <span>VUE 3 + VITE · 纯静态，可托管到 GITHUB PAGES</span>
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

/* ---------- 顶栏 ---------- */
.topbar {
  border-bottom: 1px solid var(--line);
  background: var(--bg);
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
  gap: 7px;
  color: var(--ink);
  font-size: 12px;
}

.brand-dot {
  width: 8px;
  height: 8px;
  background: var(--accent);
  border-radius: 50%;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.topbar-link:hover {
  color: var(--accent);
}

.theme-toggle {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  font-size: 14px;
  transition: border-color 0.15s ease;
}

.theme-toggle:hover {
  border-color: var(--ink);
}

/* ---------- 头部 ---------- */
.hero {
  padding: 64px 28px 40px;
}

.hero-eyebrow {
  margin: 0 0 14px;
}

.hero-title {
  margin: 0;
  font-size: clamp(30px, 5.2vw, 52px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.hero-accent {
  color: var(--accent);
}

.hero-sub {
  font-size: 0.52em;
  font-weight: 500;
  color: var(--ink-2);
  letter-spacing: 0;
}

.hero-meta {
  margin: 22px 0 0;
}

/* ---------- 工具条 ---------- */
.toolbar-wrap {
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  background: var(--bg);
  position: sticky;
  top: 52px;
  z-index: 9;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 10px;
  padding-bottom: 10px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 13px;
  font-size: 13px;
  font-weight: 600;
  background: var(--chip-bg);
  border: 1px solid var(--line);
  color: var(--ink-2);
  transition: all 0.15s ease;
}

.chip:hover {
  border-color: var(--ink-3);
  color: var(--ink);
}

.chip.active {
  background: var(--ink);
  border-color: var(--ink);
  color: var(--bg);
}

.chip-count {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 400;
  opacity: 0.65;
}

.view-toggle {
  display: flex;
  border: 1px solid var(--line);
}

.view-toggle button {
  width: 36px;
  height: 32px;
  display: grid;
  place-items: center;
  border: none;
  background: transparent;
  color: var(--ink-3);
  transition: all 0.15s ease;
}

.view-toggle button + button {
  border-left: 1px solid var(--line);
}

.view-toggle button.active {
  background: var(--ink);
  color: var(--bg);
}

/* ---------- 项目墙 ---------- */
.wall {
  flex: 1;
  padding-top: 28px;
  padding-bottom: 56px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 20px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty {
  text-align: center;
  color: var(--ink-3);
  padding: 60px 0;
}

/* 切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

/* ---------- 页脚 ---------- */
.footer {
  border-top: 1px solid var(--line);
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 20px;
  padding-bottom: 20px;
}

@media (max-width: 640px) {
  .hero {
    padding: 40px 18px 28px;
  }

  .toolbar-wrap {
    position: static;
  }
}
</style>
