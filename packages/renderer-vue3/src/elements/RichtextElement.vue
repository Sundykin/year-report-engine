<template>
  <div class="richtextElement" :style="contentStyle" v-html="resolvedContent">
  </div>
</template>

<script setup lang="ts">
import { computed, inject, type Ref } from 'vue'
import { resolveContent } from '@year-report/core'
import type { ElementComponentProps } from './types'

const props = withDefaults(defineProps<ElementComponentProps>(), {
  mode: 'render'
})

const dataVersion = inject<Ref<number>>('dataVersion', { value: 0 } as Ref<number>)

const resolvedContent = computed(() => {
  void dataVersion.value
  const content = props.element.content || ''
  if (props.mode === 'design' || !props.dataBindingManager) {
    return content
  }
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
.richtextElement {
  overflow: hidden;
}
</style>
