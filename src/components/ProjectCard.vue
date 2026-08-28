<script setup>
import { computed } from 'vue'

const props = defineProps({
  project: { type: Object, required: true },
  layout: { type: String, default: 'grid' }, // 'grid' | 'list'
})

// 封面点击的主链接：优先在线体验，否则 GitHub
const primaryLink = computed(() => props.project.demo || props.project.github)

const initials = computed(() => {
  const p = props.project
  // 中文名取首字，英文名取首字母
  const zh = p.name.match(/[\u4e00-\u9fff]/)
  if (zh) return zh[0]
  return p.name.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || 'P'
})

// 分类徽章（tax 四色避开紫黄红，与页脚图例同源：玄青=扩展 金褐=工具 靛蓝=游戏）
const BADGES = {
  ext: { cls: 'b1', label: 'EXT' },
  tool: { cls: 'b2', label: 'TOOL' },
  game: { cls: 'b3', label: 'GAME' },
}
const badge = computed(() => BADGES[props.project.category] || null)
</script>

<template>
  <article class="card" :class="`layout-${layout}`">
    <!-- 封面 -->
    <a
      class="cover"
      :class="{ 'is-contain': project.coverFit === 'contain', 'is-empty': !project.cover }"
      :href="primaryLink"
      target="_blank"
      rel="noopener"
      :aria-label="project.name"
    >
      <img v-if="project.cover" :src="project.cover" :alt="project.name + ' 界面截图'" loading="lazy" />
      <span v-else class="cover-fallback" aria-hidden="true">
        <span class="fallback-initials">{{ initials }}</span>
        <span class="fallback-dot"></span>
      </span>
      <span v-if="project.demo" class="cover-badge eyebrow">{{ project.demoLabel || '在线体验' }}</span>
    </a>

    <!-- 内容 -->
    <div class="body">
      <div class="body-head">
        <a class="title" :href="primaryLink" target="_blank" rel="noopener">
          {{ project.name }}<span class="title-arrow" aria-hidden="true">↗</span>
        </a>
        <span class="head-meta">
          <span v-if="badge" class="badge" :class="badge.cls">{{ badge.label }}</span>
          <span v-if="project.year" class="year">{{ project.year }}</span>
        </span>
      </div>

      <p class="tagline">{{ project.tagline }}</p>
      <p class="desc">{{ project.desc }}</p>

      <div class="foot">
        <ul class="tags" aria-label="标签">
          <li v-for="t in project.tags" :key="t">{{ t }}</li>
        </ul>
        <div class="links">
          <a class="link-btn github" :href="project.github" target="_blank" rel="noopener">
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
                fill="currentColor"
              />
            </svg>
            GitHub
          </a>
          <a v-if="project.demo" class="link-btn demo" :href="project.demo" target="_blank" rel="noopener">
            {{ project.demoLabel || '在线体验' }} ↗
          </a>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
/* ---------- 卡片：发丝线框、零投影、零位移（hover 唯一彩色焦点） ---------- */
.card {
  display: flex;
  background: var(--paper);
  border: 1px solid var(--line);
  overflow: hidden;
  transition: border-color 0.15s ease;
}

.card:hover {
  border-color: var(--brand-tint);
}

/* ---------- 封面 ---------- */
.cover {
  position: relative;
  display: block;
  flex-shrink: 0;
  background: var(--paper-hi);
  border-bottom: 1px solid var(--line);
  overflow: hidden;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card:hover .cover img {
  transform: scale(1.02);
}

.cover.is-contain img {
  object-fit: contain;
  padding: 14%;
}

.cover-badge {
  position: absolute;
  left: 10px;
  bottom: 10px;
  padding: 3px 8px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 3px;
  color: var(--brand);
}

/* 无截图时的占位封面：坐标纸 + 首字母 + 黄方点（黄只做色块） */
.cover-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
  background-image: linear-gradient(var(--line-lo) 1px, transparent 1px),
    linear-gradient(90deg, var(--line-lo) 1px, transparent 1px);
  background-size: 22px 22px;
}

.fallback-initials {
  font-family: var(--mono);
  font-size: 44px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--ink);
}

.fallback-dot {
  position: absolute;
  right: 16px;
  bottom: 14px;
  width: 8px;
  height: 8px;
  background: var(--hl);
}

/* ---------- 内容 ---------- */
.body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 7px;
  padding: 18px 20px 16px;
}

.body-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.title {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--ink);
}

.title-arrow {
  display: inline-block;
  margin-left: 4px;
  color: var(--ink-lo);
  font-weight: 400;
  transition: transform 0.15s ease, color 0.15s ease;
}

.card:hover .title-arrow {
  transform: translate(2px, -2px);
  color: var(--brand);
}

.head-meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.year {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-lo);
  font-variant-numeric: tabular-nums;
}

.tagline {
  margin: 0;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ink);
}

.desc {
  margin: 0;
  font-size: 13.5px;
  color: var(--ink-md);
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ---------- 底部：标签 + 链接 ---------- */
.foot {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap; /* 窄屏下标签与链接按钮换行，不撑破卡片 */
  gap: 12px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--line-lo);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.tags li {
  font-family: var(--mono);
  font-size: 10.5px;
  letter-spacing: 0.08em;
  padding: 2px 7px;
  border: 1px solid var(--line);
  border-radius: 3px;
  color: var(--ink-md);
  white-space: nowrap;
}

.links {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* 链接按钮 → pill 胶囊：紫描边悬停反白；demo = 紫实心（当期语义） */
.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--serif);
  font-size: 12px;
  font-weight: 700;
  padding: 5px 13px;
  border: 1.5px solid var(--brand);
  border-radius: 999px;
  color: var(--brand);
  background: var(--paper);
  white-space: nowrap;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.link-btn:hover {
  background: var(--brand);
  color: #fff;
}

.link-btn.demo {
  background: var(--brand);
  color: #fff;
}

.link-btn.demo:hover {
  background: var(--brand-deep);
  border-color: var(--brand-deep);
}

/* ---------- 网格布局：上图下文 ---------- */
.layout-grid {
  flex-direction: column;
}

.layout-grid .cover {
  aspect-ratio: 16 / 10;
  width: 100%;
}

/* ---------- 列表布局：左图右文，行间发丝线合并 ---------- */
.layout-list {
  flex-direction: row;
  align-items: stretch;
}

.layout-list + .layout-list {
  margin-top: -1px;
}

.layout-list .cover {
  width: 320px;
  aspect-ratio: 16 / 10;
  align-self: center;
  margin: 14px;
  border: 1px solid var(--line);
}

.layout-list .desc {
  -webkit-line-clamp: 2;
}

.layout-list .body {
  padding: 16px 20px;
}

@media (max-width: 680px) {
  .layout-list {
    flex-direction: column;
  }

  .layout-list + .layout-list {
    margin-top: 0;
  }

  .layout-list .cover {
    width: auto;
    margin: 0;
    border: none;
    border-bottom: 1px solid var(--line);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cover img,
  .title-arrow,
  .card {
    transition: none;
  }
}
</style>
