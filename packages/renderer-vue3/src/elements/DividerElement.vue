<template>
  <div class="dividerElement" :style="dividerStyle">
    <span v-if="element.dividerText" class="dividerText">{{ element.dividerText }}</span>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ElementComponentProps } from './types'

const props = withDefaults(defineProps<ElementComponentProps>(), {
  mode: 'render'
})

const dividerStyle = computed(() => ({
  width: '100%',
  height: '100%',
  backgroundColor: props.element.style?.backgroundColor || '#404040',
  borderStyle: props.element.dividerStyle || 'solid',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}))
</script>

<style scoped>
.dividerElement { position: relative; }
.dividerText {
  position: absolute;
  background: inherit;
  padding: 0 8px;
  font-size: 12px;
  color: #737373;
}
</style>
