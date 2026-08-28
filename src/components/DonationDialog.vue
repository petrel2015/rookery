<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { DONATION_CONFIG, DONATION_TEXT } from '../data/donation.js'
import { lang, EN_DONATION } from '../i18n.js'
import { drawQrToCanvas } from '../utils/qrDraw.js'

const props = defineProps({
  open: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

// 中文规范文案来自数据文件（契约测试逐字锁定）；英文为运行时叠加
const text = computed(() => (lang.value === 'en' ? EN_DONATION : DONATION_TEXT))
// 渠道名：中文在 DONATION_CONFIG，英文在叠加层
const channelName = (id) =>
  lang.value === 'en'
    ? id === 'alipay'
      ? EN_DONATION.nameAlipay
      : EN_DONATION.nameWechat
    : DONATION_CONFIG[id].name
const qrLabel = computed(() =>
  lang.value === 'en'
    ? channel.value === 'alipay'
      ? EN_DONATION.qrAlipay
      : EN_DONATION.qrWechat
    : DONATION_CONFIG[channel.value].name + '收款二维码'
)

const channel = ref('alipay')
const qrCanvas = ref(null)
const tabAlipay = ref(null)
const tabWechat = ref(null)
const qrFailed = ref(false)
let attemptedOpen = false // 每次弹窗会话内至多尝试一次手机端支付宝跳转
let lastFocused = null

const isMobileUA = () => /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

// 显式更新而非 computed：UA 非响应式输入，弹窗每次会话都需重算提示
const hint = ref(DONATION_TEXT.scanAlipay)
function updateHint() {
  if (qrFailed.value) hint.value = text.value.qrError
  else if (channel.value === 'alipay' && isMobileUA()) hint.value = text.value.mobileFallback
  else hint.value = channel.value === 'alipay' ? text.value.scanAlipay : text.value.scanWechat
}

function renderQr() {
  qrFailed.value = false
  drawQrToCanvas(qrCanvas.value, DONATION_CONFIG[channel.value].qrContent)
    .catch(() => {
      qrFailed.value = true
    })
    .finally(updateHint)
}

// 手机端支付宝：直接打开官方收款 https 链接，由支付宝页面/浏览器自行处理 App 唤起；
// 不构造自定义 URL scheme；弹窗内二维码始终可见，天然兜底，不会进死胡同
function attemptAlipayOpen() {
  if (attemptedOpen || !isMobileUA()) return
  attemptedOpen = true
  window.open(DONATION_CONFIG.alipay.qrContent, '_blank', 'noopener')
}

function focusTab(id) {
  const el = id === 'alipay' ? tabAlipay.value : tabWechat.value
  if (el) el.focus()
}

function switchTo(id) {
  if (channel.value === id) return
  channel.value = id
  updateHint()
  renderQr()
  if (id === 'alipay') attemptAlipayOpen()
  focusTab(id)
}

function requestClose() {
  emit('close')
}

function onOverlayClick(e) {
  if (e.target === e.currentTarget) requestClose()
}

function onKeydown(e) {
  if (e.key === 'Escape' && props.open) requestClose()
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      channel.value = 'alipay'
      attemptedOpen = false
      qrFailed.value = false
      updateHint()
      lastFocused = document.activeElement
      await nextTick()
      renderQr()
      attemptAlipayOpen()
      focusTab('alipay')
    } else if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus()
    }
  }
)

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <transition name="donate">
    <div v-if="open" class="donation-overlay" @click="onOverlayClick">
      <div class="donation-dialog" role="dialog" aria-modal="true" :aria-label="text.title">
        <button class="donation-close" type="button" :aria-label="text.close" @click="requestClose">
          ✕
        </button>
        <h3 class="donation-title">{{ text.title }}</h3>
        <p class="donation-subtitle">{{ text.subtitle }}</p>
        <div class="donation-tabs">
          <button
            ref="tabAlipay"
            class="donation-tab"
            :class="{ active: channel === 'alipay' }"
            type="button"
            :aria-pressed="channel === 'alipay'"
            @click="switchTo('alipay')"
          >
            {{ channelName('alipay') }}
          </button>
          <button
            ref="tabWechat"
            class="donation-tab"
            :class="{ active: channel === 'wechat' }"
            type="button"
            :aria-pressed="channel === 'wechat'"
            @click="switchTo('wechat')"
          >
            {{ channelName('wechat') }}
          </button>
        </div>
        <div class="donation-qr-card">
          <canvas
            ref="qrCanvas"
            class="donation-qr"
            :aria-label="qrLabel"
          ></canvas>
        </div>
        <p class="donation-hint" data-donation-hint>{{ hint }}</p>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* 遮罩：紫黑墨罩层 */
.donation-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(36, 31, 53, 0.55);
}

/* 弹窗：白纸底 + 墨描边 + 唯一浅投影，衬线标题。
   显式重置 font/transform：组件渲染在 .footer-inner.eyebrow 内，
   等宽+全大写会继承进来（中文不可见、英文现形） */
.donation-dialog {
  position: relative;
  width: min(360px, calc(100vw - 48px));
  padding: 26px 24px 22px;
  text-align: center;
  background: var(--paper);
  border: 1px solid var(--ink);
  border-radius: 8px;
  box-shadow: var(--shadow);
  font-family: var(--serif);
  text-transform: none;
  letter-spacing: normal;
}

.donation-close {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  font-size: 14px;
  line-height: 1;
  color: var(--ink-lo);
  transition: color 0.15s ease;
}

.donation-close:hover {
  color: var(--brand);
}

.donation-title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.donation-subtitle {
  margin: 0 0 18px;
  font-size: 13px;
  color: var(--ink-md);
}

/* 支付方式切换：分段式描边控件，激活实心紫（弹窗内唯一彩色焦点） */
.donation-tabs {
  display: inline-flex;
  margin-bottom: 18px;
  border: 1.5px solid var(--ink);
  border-radius: 6px;
  overflow: hidden;
}

.donation-tab {
  padding: 8px 18px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--ink);
  background: var(--paper);
  transition: all 0.15s ease;
}

.donation-tab + .donation-tab {
  border-left: 1.5px solid var(--ink);
}

.donation-tab.active {
  background: var(--brand);
  color: #fff;
}

/* 二维码：浅色码卡 + 深色码，暗色模式下也保证扫码成功率 */
.donation-qr-card {
  display: inline-block;
  padding: 8px;
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 4px;
}

.donation-qr {
  display: block;
  max-width: 100%;
}

.donation-hint {
  margin: 14px 0 0;
  font-size: 12.5px;
  color: var(--ink-md);
}

/* 弹窗过渡（贴站点 fade 惯例） */
.donate-enter-active,
.donate-leave-active {
  transition: opacity 0.16s ease;
}

.donate-enter-active .donation-dialog,
.donate-leave-active .donation-dialog {
  transition: transform 0.16s ease;
}

.donate-enter-from,
.donate-leave-to {
  opacity: 0;
}

.donate-enter-from .donation-dialog,
.donate-leave-to .donation-dialog {
  transform: translateY(6px);
}

/* 手机：留白更小，触控目标充足，无横向滚动 */
@media (max-width: 640px) {
  .donation-overlay {
    padding: 16px;
  }

  .donation-dialog {
    width: min(360px, calc(100vw - 32px));
    padding: 24px 16px 20px;
  }

  .donation-tab {
    padding: 11px 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .donate-enter-active,
  .donate-leave-active,
  .donate-enter-active .donation-dialog,
  .donate-leave-active .donation-dialog,
  .donation-close,
  .donation-tab {
    transition: none;
  }
}
</style>
