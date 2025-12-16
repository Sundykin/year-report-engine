<template>
  <div ref="wrapperRef" class="scrollWrapper">
    <div class="scrollContent">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import BScroll from '@better-scroll/core'
import ScrollBar from '@better-scroll/scroll-bar'

BScroll.use(ScrollBar)

interface Props {
  scrollX?: boolean
  scrollY?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  scrollX: false,
  scrollY: true
})

const wrapperRef = ref<HTMLDivElement | null>(null)
let bscroll: BScroll | null = null

onMounted(() => {
  if (!wrapperRef.value) return

  bscroll = new BScroll(wrapperRef.value, {
    scrollX: props.scrollX,
    scrollY: props.scrollY,
    scrollbar: {
      fade: false,
      interactive: true
    },
    mouseWheel: true,
    disableMouse: false,
    disableTouch: false
  })
})

onUnmounted(() => {
  bscroll?.destroy()
})

// 刷新滚动
const refresh = () => {
  bscroll?.refresh()
}

defineExpose({ refresh })
</script>

<style scoped>
.scrollWrapper {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.scrollContent {
  min-height: 100%;
}

/* BetterScroll 滚动条样式 */
:deep(.bscroll-indicator) {
  background: rgba(255, 255, 255, 0.2) !important;
  border-radius: 4px !important;
}

:deep(.bscroll-vertical-scrollbar) {
  width: 6px !important;
  right: 2px !important;
}

:deep(.bscroll-horizontal-scrollbar) {
  height: 6px !important;
  bottom: 2px !important;
}
</style>
