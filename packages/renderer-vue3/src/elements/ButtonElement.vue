<template>
  <button class="buttonElement" :style="buttonStyle" @click="handleClick">
    <slot>{{ element.content || '按钮' }}</slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ElementComponentProps } from './types'

const props = withDefaults(defineProps<ElementComponentProps>(), {
  mode: 'render'
})

const emit = defineEmits<{
  action: [action: any]
}>()

const buttonStyle = computed(() => ({
  width: '100%',
  height: '100%',
  border: 'none',
  cursor: props.mode === 'design' ? 'default' : 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...props.element.style
}))

const handleClick = () => {
  if (props.mode === 'design') return
  if (props.element.buttonAction) {
    emit('action', props.element.buttonAction)
  }
}
</script>

<style scoped>
.buttonElement {
  outline: none;
  user-select: none;
}
</style>
