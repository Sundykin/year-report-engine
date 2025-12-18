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
