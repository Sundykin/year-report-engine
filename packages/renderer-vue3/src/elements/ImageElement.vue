<template>
  <img class="imageElement" :src="element.src" :style="contentStyle" alt="" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ElementComponentProps } from './types'

const props = withDefaults(defineProps<ElementComponentProps>(), {
  mode: 'render'
})

const contentStyle = computed(() => ({
  width: '100%',
  height: '100%',
  objectFit: props.element.style?.objectFit || 'cover',
  ...props.element.style
}))
</script>

<style scoped>
.imageElement {
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}
</style>
