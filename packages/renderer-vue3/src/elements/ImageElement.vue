<template>
  <img class="imageElement" :src="element.src" :style="contentStyle" alt="" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ElementComponentProps } from './types'

const props = withDefaults(defineProps<ElementComponentProps>(), {
  mode: 'render'
})

// 蒙版 clip-path 预设
const maskPaths: Record<string, string> = {
  circle: 'circle(50% at 50% 50%)',
  ellipse: 'ellipse(50% 40% at 50% 50%)',
  triangle: 'polygon(50% 0%, 0% 100%, 100% 100%)',
  diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  pentagon: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
  hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  star: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  heart: 'path("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")'
}

// 生成滤镜样式
const filterStyle = computed(() => {
  const filters = props.element.imageFilters
  if (!filters?.enabled) return ''

  const parts: string[] = []
  if (filters.grayscale) parts.push(`grayscale(${filters.grayscale}%)`)
  if (filters.blur) parts.push(`blur(${filters.blur}px)`)
  if (filters.brightness !== undefined && filters.brightness !== 100) {
    parts.push(`brightness(${filters.brightness}%)`)
  }
  if (filters.contrast !== undefined && filters.contrast !== 100) {
    parts.push(`contrast(${filters.contrast}%)`)
  }
  if (filters.saturate !== undefined && filters.saturate !== 100) {
    parts.push(`saturate(${filters.saturate}%)`)
  }

  return parts.length > 0 ? parts.join(' ') : ''
})

// 生成蒙版样式
const maskStyle = computed(() => {
  const mask = props.element.imageMask
  if (!mask?.enabled || !mask.type) return ''

  if (mask.type === 'custom' && mask.customPath) {
    return mask.customPath
  }
  return maskPaths[mask.type] || ''
})

// 生成翻转样式
const flipTransform = computed(() => {
  const flip = props.element.imageFlip
  if (!flip) return ''

  const scaleX = flip.horizontal ? -1 : 1
  const scaleY = flip.vertical ? -1 : 1

  if (scaleX === 1 && scaleY === 1) return ''
  return `scale(${scaleX}, ${scaleY})`
})

const contentStyle = computed(() => {
  const style: Record<string, any> = {
    width: '100%',
    height: '100%',
    objectFit: props.element.style?.objectFit || 'cover',
    ...props.element.style
  }

  // 滤镜
  if (filterStyle.value) {
    style.filter = filterStyle.value
  }

  // 蒙版
  if (maskStyle.value) {
    style.clipPath = maskStyle.value
  }

  // 翻转
  if (flipTransform.value) {
    style.transform = flipTransform.value
  }

  return style
})
</script>

<style scoped>
.imageElement {
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}
</style>
