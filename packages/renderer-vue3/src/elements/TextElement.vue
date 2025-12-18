<template>
  <div class="textElement" :style="contentStyle">
    <slot>{{ resolvedContent }}</slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ElementComponentProps } from './types'

const props = withDefaults(defineProps<ElementComponentProps>(), {
  mode: 'render'
})

const resolvedContent = computed(() => {
  const content = props.element.content || ''
  if (props.mode === 'design' || !props.dataBindingManager) {
    return content
  }
  return props.dataBindingManager.resolve(content)
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
