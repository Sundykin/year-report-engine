<template>
  <div class="countdownElement" :style="contentStyle">
    <slot>{{ displayText }}</slot>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { ElementComponentProps } from './types'

const props = withDefaults(defineProps<ElementComponentProps>(), {
  mode: 'render'
})

const now = ref(Date.now())
let timer: number | null = null

const targetTime = computed(() => {
  if (!props.element.countdownTarget) return Date.now()
  return new Date(props.element.countdownTarget).getTime()
})

const remaining = computed(() => Math.max(0, targetTime.value - now.value))

const displayText = computed(() => {
  const format = props.element.countdownFormat || 'dhms'
  const total = Math.floor(remaining.value / 1000)
  const d = Math.floor(total / 86400)
  const h = Math.floor((total % 86400) / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60

  const pad = (n: number) => n.toString().padStart(2, '0')

  switch (format) {
    case 'dhms': return `${d}天 ${pad(h)}:${pad(m)}:${pad(s)}`
    case 'hms': return `${pad(h)}:${pad(m)}:${pad(s)}`
    case 'ms': return `${pad(m)}:${pad(s)}`
    case 's': return `${total}秒`
    default: return `${d}天 ${pad(h)}:${pad(m)}:${pad(s)}`
  }
})

const contentStyle = computed(() => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...props.element.style
}))

onMounted(() => {
  if (props.mode !== 'design') {
    timer = window.setInterval(() => {
      now.value = Date.now()
    }, 1000)
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.countdownElement { user-select: none; }
</style>
