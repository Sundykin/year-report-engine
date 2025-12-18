<template>
  <div class="videoElement">
    <video
      v-if="mode !== 'design' && element.src"
      :src="element.src"
      :style="videoStyle"
      autoplay
      loop
      muted
      playsinline
    />
    <div v-else class="videoPlaceholder">
      <slot>🎬 视频</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ElementComponentProps } from './types'

const props = withDefaults(defineProps<ElementComponentProps>(), {
  mode: 'render'
})

const videoStyle = computed(() => ({
  width: '100%',
  height: '100%',
  objectFit: props.element.style?.objectFit || 'cover'
}))
</script>

<style scoped>
.videoElement {
  width: 100%;
  height: 100%;
}
.videoPlaceholder {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #404040;
  font-size: 12px;
  color: #737373;
}
</style>
