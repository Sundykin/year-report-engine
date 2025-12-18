<template>
  <div
    ref="elementRef"
    :style="elementStyle"
  >
    <component
      :is="elementComponent"
      v-if="elementComponent"
      :element="element"
      :mode="mode"
      :data-binding-manager="dataBindingManager"
    >
      <slot />
    </component>
    <div v-else class="unknownElement">
      未知组件: {{ element.type }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, inject, type Ref, type Component } from 'vue'
import type { H5Element, DataSourceManager } from '@year-report/core'
import { CANVAS_WIDTH, CANVAS_HEIGHT, AnimateCssScheduler } from '@year-report/core'
import { getElementComponent } from './index'
import type { RenderMode } from './types'

const props = withDefaults(defineProps<{
  element: H5Element
  mode?: RenderMode
  dataBindingManager?: DataSourceManager | null
  pageIndex?: number
  isActive?: boolean
  offsetX?: number
  offsetY?: number
}>(), {
  mode: 'render',
  dataBindingManager: null,
  pageIndex: 0,
  isActive: false,
  offsetX: 0,
  offsetY: 0
})

const elementRef = ref<HTMLDivElement | null>(null)
const pageSchedulers = inject<Ref<Map<number, AnimateCssScheduler>>>('pageSchedulers', ref(new Map()))

const elementComponent = computed<Component | undefined>(() => {
  return getElementComponent(props.element.type)
})

// 计算元素是否在可视区域内
const isInVisibleArea = computed(() => {
  if (props.mode === 'design') return true
  const el = props.element
  return !(
    el.x + el.width < 0 ||
    el.x > CANVAS_WIDTH ||
    el.y + el.height < 0 ||
    el.y > CANVAS_HEIGHT
  )
})

const elementStyle = computed(() => {
  // design 模式下由 ElementWrapper 处理定位
  if (props.mode === 'design') {
    return { width: '100%', height: '100%' }
  }

  if (!isInVisibleArea.value) {
    return { display: 'none' }
  }

  const style: any = {
    position: 'absolute',
    left: `${props.element.x + props.offsetX}px`,
    top: `${props.element.y + props.offsetY}px`,
    width: `${props.element.width}px`,
    height: `${props.element.height}px`,
    zIndex: props.element.zIndex || 1
  }

  if (props.element.rotation) {
    style.transform = `rotate(${props.element.rotation}deg)`
    style.transformOrigin = 'center center'
  }

  return style
})

// 动画注册（仅在 render/preview 模式）
const getAnimations = () => {
  if (props.element.animations?.length) return props.element.animations
  if (props.element.animation) return [props.element.animation]
  return []
}

const registerAnimations = () => {
  if (props.mode === 'design') return
  if (!elementRef.value || !pageSchedulers?.value) return

  let scheduler = pageSchedulers.value.get(props.pageIndex)
  if (!scheduler) {
    scheduler = new AnimateCssScheduler()
    pageSchedulers.value.set(props.pageIndex, scheduler)
  }

  scheduler.unregisterElement(props.element.id)

  const animations = getAnimations()
  if (animations.length > 0) {
    scheduler.registerElement(
      props.element.id,
      elementRef.value,
      animations,
      { x: props.element.x, y: props.element.y }
    )
  }
}

onMounted(() => {
  if (props.mode !== 'design') {
    registerAnimations()
  }
})

watch(() => [props.element.animations, props.element.animation], () => {
  if (props.mode !== 'design') {
    registerAnimations()
  }
}, { deep: true })
</script>

<style scoped>
.unknownElement {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 0, 0, 0.1);
  border: 1px dashed #f00;
  color: #f00;
  font-size: 12px;
}
</style>
