<template>
  <div class="iconElement" :style="iconStyle">
    <slot>{{ iconChar }}</slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getIconChar } from '@year-report/core'
import type { ElementComponentProps } from './types'

const props = withDefaults(defineProps<ElementComponentProps>(), {
  mode: 'render'
})

const iconChar = computed(() => getIconChar(props.element.iconName))

const iconStyle = computed(() => ({
  color: props.element.iconColor || '#3b82f6',
  fontSize: `${Math.min(props.element.width, props.element.height)}px`,
  lineHeight: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%'
}))
</script>

<style scoped>
.iconElement {
  user-select: none;
}
</style>
