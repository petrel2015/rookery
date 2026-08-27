<script setup>
import { ref } from 'vue'
import DonationDialog from './DonationDialog.vue'
import { DONATION_TEXT } from '../data/donation.js'

const open = ref(false)
</script>

<template>
  <button
    class="donate-entry"
    type="button"
    aria-haspopup="dialog"
    @click="open = true"
  >
    {{ DONATION_TEXT.entry }}
  </button>
  <DonationDialog :open="open" @close="open = false" />
</template>

<style scoped>
/* Footer 入口：低干扰文字链接，弱于站内主要按钮（样式贴 .eyebrow） */
.donate-entry {
  padding: 0;
  border: none;
  background: transparent;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-3);
  transition: color 0.15s ease;
}

.donate-entry:hover {
  color: var(--accent);
}

@media (prefers-reduced-motion: reduce) {
  .donate-entry {
    transition: none;
  }
}
</style>
