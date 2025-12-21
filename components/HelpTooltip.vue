<template>
  <div 
    class="help-tooltip-wrapper" 
    ref="wrapperRef"
  >
    <button
      ref="triggerRef"
      type="button"
      class="help-icon-btn"
      @click.stop="toggle"
      :aria-label="'ヘルプ: ' + (title || props.title || 'ヘルプ')"
    >
      <svg
        class="help-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2.5"
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01"
        />
      </svg>
    </button>

    <div
      v-if="isVisible"
      ref="tooltipRef"
      class="help-tooltip"
      :class="`help-tooltip-${placement}`"
      @click.stop
    >
      <div class="help-tooltip-header">
        <div class="help-tooltip-title-section">
          <svg class="help-tooltip-info-icon" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#3b82f6"/>
            <text x="12" y="17" text-anchor="middle" fill="white" font-size="14" font-weight="600" font-family="Arial, sans-serif" style="text-transform: lowercase;">i</text>
          </svg>
          <h3 v-if="title || props.title" class="help-tooltip-title">{{ title || props.title }}</h3>
        </div>
        <button class="help-tooltip-close" @click="hide" aria-label="閉じる">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="help-tooltip-content">
        <p class="help-tooltip-text">{{ text }}</p>
        <div v-if="features && features.length > 0" class="help-tooltip-features">
          <h4 class="help-tooltip-features-title">できること</h4>
          <ul class="help-tooltip-features-list">
            <li v-for="(feature, index) in features" :key="index" class="help-tooltip-feature-item">
              {{ feature }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch, nextTick } from 'vue'
import { useTooltip } from '~/composables/useTooltip'

interface Props {
  title?: string
  text: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  features?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'top'
})

const triggerRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)

const { isVisible, show, hide, toggle } = useTooltip(triggerRef, tooltipRef, {
  placement: props.placement,
  offset: 8
})

// クリックのみで表示するため、マウスイベントは削除

// クリック外を検知して閉じる
const handleClickOutside = (event: MouseEvent) => {
  if (!isVisible.value) return
  
  const target = event.target as Node
  // ツールチップ内またはトリガーボタンをクリックした場合は閉じない
  if (wrapperRef.value && !wrapperRef.value.contains(target)) {
    hide()
  }
}

// ツールチップが表示されている時のみイベントリスナーを追加
const watchVisibility = () => {
  if (isVisible.value) {
    // 次のティックでイベントリスナーを追加（クリックイベントの伝播を防ぐため）
    nextTick(() => {
      document.addEventListener('click', handleClickOutside, true)
    })
  } else {
    document.removeEventListener('click', handleClickOutside, true)
  }
}

// isVisibleの変化を監視
watch(isVisible, watchVisibility)

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
})
</script>

<style scoped>
.help-tooltip-wrapper {
  display: inline-flex;
  align-items: center;
  position: relative;
}

.help-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  margin-left: 4px;
  background: #3b82f6;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: white;
  transition: opacity 0.2s, background 0.2s;
  flex-shrink: 0;
  opacity: 0;
  pointer-events: auto;
}

.help-icon-btn:hover {
  background: #2563eb;
}

.help-icon {
  width: 14px;
  height: 14px;
}

.help-tooltip {
  position: fixed;
  z-index: 1000;
  max-width: 360px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  overflow: hidden;
}

.help-tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
}

.help-tooltip-title-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.help-tooltip-info-icon {
  width: 20px;
  height: 20px;
  color: #3b82f6;
  flex-shrink: 0;
}

.help-tooltip-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.help-tooltip-close {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.help-tooltip-close:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.help-tooltip-content {
  position: relative;
  z-index: 1;
  padding: 16px 20px;
}

.help-tooltip-text {
  margin: 0 0 16px 0;
  font-size: 14px;
  line-height: 1.6;
  color: #4b5563;
}

.help-tooltip-features {
  margin-top: 16px;
}

.help-tooltip-features-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.help-tooltip-features-list {
  margin: 0;
  padding-left: 20px;
  list-style: disc;
}

.help-tooltip-feature-item {
  margin: 0 0 8px 0;
  font-size: 13px;
  line-height: 1.5;
  color: #4b5563;
}

.help-tooltip-feature-item:last-child {
  margin-bottom: 0;
}


/* モバイル対応 */
@media (max-width: 768px) {
  .help-tooltip {
    max-width: calc(100vw - 32px);
  }
}
</style>

