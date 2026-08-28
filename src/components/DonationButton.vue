<script setup>
import { ref, computed } from 'vue'
import DonationDialog from './DonationDialog.vue'
import { DONATION_TEXT } from '../data/donation.js'
import { lang, EN_DONATION } from '../i18n.js'

// 中文规范文案来自数据文件（契约测试逐字锁定）；英文为运行时叠加
const text = computed(() => (lang.value === 'en' ? EN_DONATION : DONATION_TEXT))
const open = ref(false)
</script>

<template>
  <button
    class="donate-entry"
    type="button"
    aria-haspopup="dialog"
    @click="open = true"
  >
    {{ text.entry }}
  </button>
  <DonationDialog :open="open" @close="open = false" />
</template>

<style scoped>
/* Footer 入口：低干扰文字链接，弱于站内主要按钮（样式贴 .eyebrow） */
.donate-entry {
  padding: 0;
  border: none;
  background: transparent;
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-lo);
  transition: color 0.15s ease;
}

.donate-entry:hover {
  color: var(--brand);
}

@media (prefers-reduced-motion: reduce) {
  .donate-entry {
    transition: none;
  }
}
</style>
