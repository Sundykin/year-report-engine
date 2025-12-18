<template>
  <div class="tagElement" :style="tagStyle">
    <slot>{{ resolvedText }}</slot>
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

const resolvedText = computed(() => {
  void dataVersion.value
  const text = props.element.tagText || '标签'
  if (props.mode === 'design' || !props.dataBindingManager) {
    return text
  }
  return resolveContent(
    props.element,
    text,
    props.dataBindingManager.getDataSources(),
    props.dataBindingManager.getDataCache()
  )
})

const tagStyle = computed(() => {
  const isSolid = props.element.tagVariant === 'solid'
  const color = props.element.tagColor || '#3b82f6'
  return {
    backgroundColor: isSolid ? color : 'transparent',
    color: isSolid ? '#fff' : color,
    border: props.element.tagVariant === 'outline' ? `1px solid ${color}` : 'none',
    borderRadius: props.element.style?.borderRadius || '4px',
    fontSize: props.element.style?.fontSize || '12px',
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%'
  }
})
</script>

<style scoped>
.tagElement { user-select: none; }
</style>
