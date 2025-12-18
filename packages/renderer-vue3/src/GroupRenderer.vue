<template>
  <div class="groupWrapper" :style="wrapperStyle">
    <ElementRenderer
      v-for="el in elements"
      :key="el.id"
      :element="el"
      :page-index="pageIndex"
      :is-active="isActive"
      :offset-x="-bounds.x"
      :offset-y="-bounds.y"
      mode="render"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { H5Element } from '@year-report/core'
import { ElementRenderer } from './elements'

interface GroupBounds {
  x: number
  y: number
  width: number
  height: number
}

interface Props {
  elements: H5Element[]
  bounds: GroupBounds
  rotation: number
  pageIndex: number
  isActive: boolean
}

const props = defineProps<Props>()

const wrapperStyle = computed(() => ({
  position: 'absolute' as const,
  left: `${props.bounds.x}px`,
  top: `${props.bounds.y}px`,
  width: `${props.bounds.width}px`,
  height: `${props.bounds.height}px`,
  transform: props.rotation ? `rotate(${props.rotation}deg)` : undefined,
  transformOrigin: 'center center'
}))
</script>

<style scoped>
.groupWrapper {
  pointer-events: none;
}
</style>
