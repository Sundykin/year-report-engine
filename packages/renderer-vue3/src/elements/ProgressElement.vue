<template>
  <div class="progressElement">
    <!-- 线性进度条 -->
    <div v-if="element.progressType === 'line' || !element.progressType" class="progressLine">
      <div class="progressTrack" :style="trackStyle">
        <div class="progressBar" :style="barStyle" />
      </div>
    </div>
    <!-- 圆形进度条 -->
    <svg v-else-if="element.progressType === 'circle'" viewBox="0 0 100 100" class="progressCircle">
      <circle cx="50" cy="50" r="45" fill="none" :stroke="trackColor" stroke-width="8" />
      <circle cx="50" cy="50" r="45" fill="none" :stroke="barColor" stroke-width="8"
        :stroke-dasharray="`${progressValue * 2.83} 283`" stroke-linecap="round" transform="rotate(-90 50 50)" />
      <text x="50" y="55" text-anchor="middle" :fill="element.style?.color || '#fff'" font-size="20">{{ Math.round(progressValue) }}%</text>
    </svg>
    <!-- 半圆进度条 -->
    <svg v-else-if="element.progressType === 'semicircle'" viewBox="0 0 100 60" class="progressSemicircle">
      <path d="M 5 55 A 45 45 0 0 1 95 55" fill="none" :stroke="trackColor" stroke-width="8" stroke-linecap="round" />
      <path d="M 5 55 A 45 45 0 0 1 95 55" fill="none" :stroke="barColor" stroke-width="8"
        :stroke-dasharray="`${progressValue * 1.41} 141`" stroke-linecap="round" />
    </svg>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ElementComponentProps } from './types'

const props = withDefaults(defineProps<ElementComponentProps>(), {
  mode: 'render'
})

const progressValue = computed(() => props.element.progressValue || 0)
const trackColor = computed(() => props.element.style?.backgroundColor || '#262626')
const barColor = computed(() => props.element.progressColor || '#3b82f6')

const trackStyle = computed(() => ({
  backgroundColor: trackColor.value,
  borderRadius: props.element.style?.borderRadius
}))

const barStyle = computed(() => ({
  width: `${progressValue.value}%`,
  backgroundColor: barColor.value,
  borderRadius: props.element.style?.borderRadius
}))
</script>

<style scoped>
.progressElement { width: 100%; height: 100%; display: flex; align-items: center; }
.progressLine { width: 100%; height: 100%; }
.progressTrack { width: 100%; height: 100%; position: relative; overflow: hidden; }
.progressBar { height: 100%; transition: width 0.3s; }
.progressCircle, .progressSemicircle { width: 100%; height: 100%; }
</style>
