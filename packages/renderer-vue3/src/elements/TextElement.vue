<template>
  <div class="textElement" :style="contentStyle">
    <slot>{{ resolvedContent }}</slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { resolveContent } from '@year-report/core'
import type { ElementComponentProps } from './types'

const props = withDefaults(defineProps<ElementComponentProps>(), {
  mode: 'render'
})

const resolvedContent = computed(() => {
  const content = props.element.content || ''
  if (props.mode === 'design' || !props.dataBindingManager) {
    return content
  }
  // 支持渲染函数和插值语法
  const sources = props.dataBindingManager.getDataSources()
  const cache = props.dataBindingManager.getDataCache()
  console.log('[TextElement] 插值解析:', { content, sources, cache: Object.fromEntries(cache) })
  const result = resolveContent(props.element, content, sources, cache)
  console.log('[TextElement] 解析结果:', result)
  return result
})

const contentStyle = computed(() => ({
  width: '100%',
  height: '100%',
  ...props.element.style
}))
</script>

<style scoped>
.textElement {
  white-space: pre-wrap;
  word-break: break-word;
  overflow: hidden;
}
</style>
