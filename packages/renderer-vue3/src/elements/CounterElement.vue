<template>
  <div class="counterElement" :style="contentStyle">
    <slot>{{ element.counterPrefix }}{{ displayValue }}{{ element.counterSuffix }}</slot>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import type { ElementComponentProps } from './types'

const props = withDefaults(defineProps<ElementComponentProps>(), {
  mode: 'render'
})

const animatedValue = ref(0)

const targetValue = computed(() => props.element.counterValue || 0)
const decimals = computed(() => props.element.counterDecimals || 0)
const duration = computed(() => (props.element.counterDuration || 2) * 1000)

const displayValue = computed(() => {
  if (props.mode === 'design') {
    return targetValue.value.toFixed(decimals.value)
  }
  return animatedValue.value.toFixed(decimals.value)
})

const contentStyle = computed(() => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...props.element.style
}))

// 数字动画
const animateCounter = () => {
  if (props.mode === 'design') return
  const start = 0
  const end = targetValue.value
  const startTime = performance.now()

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration.value, 1)
    animatedValue.value = start + (end - start) * easeOutQuart(progress)
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  requestAnimationFrame(animate)
}

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

onMounted(() => {
  if (props.mode !== 'design') {
    animateCounter()
  }
})

watch(targetValue, () => {
  if (props.mode !== 'design') {
    animateCounter()
  }
})
</script>

<style scoped>
.counterElement { user-select: none; }
</style>
