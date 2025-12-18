<template>
  <div class="shapeElement" :class="shapeClass" :style="shapeStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ElementComponentProps } from './types'

const props = withDefaults(defineProps<ElementComponentProps>(), {
  mode: 'render'
})

const shapeClass = computed(() => `shape-${props.element.shapeType || 'rectangle'}`)

const shapeStyle = computed(() => ({
  width: '100%',
  height: '100%',
  ...props.element.style
}))
</script>

<style scoped>
.shapeElement {
  box-sizing: border-box;
}
.shape-rectangle { }
.shape-circle { border-radius: 50%; }
.shape-triangle { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
.shape-star { clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); }
.shape-pentagon { clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%); }
.shape-hexagon { clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); }
</style>
