<template>
  <div class="listElement" :style="contentStyle">
    <slot>
      <div v-for="(item, i) in items" :key="i" class="listItem">
        {{ prefix(i) }}{{ item }}
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ElementComponentProps } from './types'

const props = withDefaults(defineProps<ElementComponentProps>(), {
  mode: 'render'
})

const items = computed(() => props.element.listItems || [])
const isOrdered = computed(() => props.element.listType === 'ordered')

const prefix = (i: number) => isOrdered.value ? `${i + 1}. ` : '• '

const contentStyle = computed(() => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'center',
  gap: '4px',
  ...props.element.style
}))
</script>

<style scoped>
.listElement { overflow: hidden; }
.listItem { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
