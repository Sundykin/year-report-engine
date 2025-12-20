<template>
  <div class="textElement" :style="contentStyle">
    <slot>{{ resolvedContent }}</slot>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, type Ref } from 'vue'
import { resolveContent } from '@year-report/core'
import type { ElementComponentProps } from './types'

const props = withDefaults(defineProps<ElementComponentProps>(), {
  mode: 'render'
})

// 注入数据版本号，用于触发重新计算
const dataVersion = inject<Ref<number>>('dataVersion', { value: 0 } as Ref<number>)

const resolvedContent = computed(() => {
  // 依赖 dataVersion 触发重新计算
  void dataVersion.value

  const content = props.element.content || ''
  if (props.mode === 'design' || !props.dataBindingManager) {
    return content
  }
  // 支持渲染函数和插值语法
  return resolveContent(
    props.element,
    content,
    props.dataBindingManager.getDataSources(),
    props.dataBindingManager.getDataCache()
  )
})

// 生成文字描边样式
const textStrokeStyle = computed(() => {
  const stroke = props.element.textStroke
  if (!stroke?.enabled) return {}
  return {
    WebkitTextStroke: `${stroke.width || 1}px ${stroke.color || '#000'}`,
  }
})

// 生成文字阴影样式
const textShadowStyle = computed(() => {
  const shadow = props.element.textShadow
  if (!shadow?.enabled) return {}
  const x = shadow.offsetX ?? 2
  const y = shadow.offsetY ?? 2
  const blur = shadow.blur ?? 4
  const color = shadow.color || 'rgba(0,0,0,0.5)'
  return {
    textShadow: `${x}px ${y}px ${blur}px ${color}`
  }
})

// 生成渐变填充样式
const textGradientStyle = computed(() => {
  const gradient = props.element.textGradient
  if (!gradient?.enabled) return {}

  const colors = gradient.colors?.length >= 2
    ? gradient.colors.join(', ')
    : '#ff6b6b, #4ecdc4'

  let gradientValue: string
  if (gradient.type === 'radial') {
    gradientValue = `radial-gradient(circle, ${colors})`
  } else {
    const direction = gradient.direction || 'to right'
    gradientValue = `linear-gradient(${direction}, ${colors})`
  }

  return {
    background: gradientValue,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent'
  }
})

const contentStyle = computed(() => {
  const baseStyle: Record<string, any> = {
    width: '100%',
    height: '100%',
    ...props.element.style
  }

  // 合并文字效果样式
  return {
    ...baseStyle,
    ...textStrokeStyle.value,
    ...textShadowStyle.value,
    ...textGradientStyle.value
  }
})
</script>

<style scoped>
.textElement {
  white-space: pre-wrap;
  word-break: break-word;
  overflow: hidden;
}
</style>
