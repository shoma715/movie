import { ref, onMounted, onUnmounted, nextTick, type Ref } from 'vue'
import { computePosition, autoUpdate, offset, shift, flip } from '@floating-ui/dom'

export interface TooltipOptions {
  placement?: 'top' | 'bottom' | 'left' | 'right'
  offset?: number
}

export function useTooltip(
  triggerRef: Ref<HTMLElement | null>,
  tooltipRef: Ref<HTMLElement | null>,
  options: TooltipOptions = {}
) {
  const isVisible = ref(false)
  const { placement = 'top', offset: offsetValue = 8 } = options

  let cleanup: (() => void) | null = null

  const updatePosition = async () => {
    if (!triggerRef.value || !tooltipRef.value) return

    try {
      const { x, y } = await computePosition(triggerRef.value, tooltipRef.value, {
        placement,
        middleware: [
          offset(offsetValue),
          shift({ padding: 8 }),
          flip()
        ]
      })

      tooltipRef.value.style.left = `${x}px`
      tooltipRef.value.style.top = `${y}px`
    } catch (error) {
      console.error('Error updating tooltip position:', error)
    }
  }

  const show = async () => {
    if (!triggerRef.value) return
    isVisible.value = true
    
    // DOMが更新されるまで待つ
    await nextTick()
    
    if (!tooltipRef.value) return
    
    // 位置を計算して更新
    await updatePosition()
    
    // 自動更新を開始
    cleanup = autoUpdate(triggerRef.value, tooltipRef.value, updatePosition)
  }

  const hide = () => {
    isVisible.value = false
    if (cleanup) {
      cleanup()
      cleanup = null
    }
  }

  const toggle = async () => {
    if (isVisible.value) {
      hide()
    } else {
      await show()
    }
  }

  onUnmounted(() => {
    if (cleanup) {
      cleanup()
    }
  })

  return {
    isVisible,
    show,
    hide,
    toggle
  }
}


