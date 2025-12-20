<template>
  <div
    v-if="shouldShow"
    ref="elementRef"
    :data-element-id="element.id"
    :class="['elementRenderer', { hasHoverStyle: hasHoverEffect }]"
    :style="computedStyle"
    @click="handleClick"
    @dblclick="handleDoubleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
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
import { computed, ref, onMounted, onUnmounted, watch, inject, type Ref, type Component } from 'vue'
import type { H5Element, DataSourceManager, AnimationConfig } from '@year-report/core'
import { CANVAS_WIDTH, CANVAS_HEIGHT, AnimateCssScheduler, evaluateShowCondition, executeEventActions } from '@year-report/core'
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
const dataVersion = inject<Ref<number>>('dataVersion', ref(0))
const dataManager = inject<DataSourceManager | null>('dataManager', null)

// 状态管理
const isHovered = ref(false)
const isPressed = ref(false)

// 滚动观察器
let scrollObserver: IntersectionObserver | null = null
const triggeredScrollAnimations = new Set<string>()

// 获取当前页跳转函数（由 YearReportRenderer 提供）
const goToPage = inject<(pageId: string) => void>('goToPage', () => {})

const elementComponent = computed<Component | undefined>(() => {
  return getElementComponent(props.element.type)
})

// 条件渲染判断
const shouldShow = computed(() => {
  // 设计模式下始终显示
  if (props.mode === 'design') return true
  // 没有配置条件则显示
  if (!props.element.showCondition) return true

  // 获取数据缓存
  const manager = props.dataBindingManager || dataManager
  if (!manager) return true

  // 触发响应式（虽然 dataVersion 没直接用，但访问它可以触发重新计算）
  void dataVersion.value

  return evaluateShowCondition(props.element.showCondition, manager.getDataCache())
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

// 是否有悬停效果
const hasHoverEffect = computed(() => {
  return props.mode !== 'design' && props.element.hoverStyle?.enabled
})

// 计算最终样式（包含悬停/激活状态）
const computedStyle = computed(() => {
  const baseStyle = elementStyle.value

  // 设计模式不应用交互状态
  if (props.mode === 'design') return baseStyle

  const hover = props.element.hoverStyle
  const active = props.element.activeStyle

  // 添加过渡效果
  if (hover?.enabled) {
    baseStyle.transition = `all ${hover.transition || 200}ms ease`
  }

  // 应用激活状态样式（优先级高于悬停）
  if (isPressed.value && active?.enabled) {
    return applyStateStyle(baseStyle, active)
  }

  // 应用悬停状态样式
  if (isHovered.value && hover?.enabled) {
    return applyStateStyle(baseStyle, hover)
  }

  return baseStyle
})

// 应用状态样式
function applyStateStyle(base: any, stateStyle: any): any {
  const result = { ...base }
  const transforms: string[] = []

  // 保留原有旋转
  if (props.element.rotation) {
    transforms.push(`rotate(${props.element.rotation}deg)`)
  }

  // 缩放
  if (stateStyle.scale !== undefined && stateStyle.scale !== 1) {
    transforms.push(`scale(${stateStyle.scale})`)
  }

  // 位移
  if (stateStyle.translateX || stateStyle.translateY) {
    transforms.push(`translate(${stateStyle.translateX || 0}px, ${stateStyle.translateY || 0}px)`)
  }

  // 额外旋转
  if (stateStyle.rotate) {
    transforms.push(`rotate(${stateStyle.rotate}deg)`)
  }

  if (transforms.length) {
    result.transform = transforms.join(' ')
    result.transformOrigin = 'center center'
  }

  // 透明度
  if (stateStyle.opacity !== undefined) {
    result.opacity = stateStyle.opacity
  }

  // 背景色
  if (stateStyle.backgroundColor) {
    result.backgroundColor = stateStyle.backgroundColor
  }

  // 边框色
  if (stateStyle.borderColor) {
    result.borderColor = stateStyle.borderColor
  }

  // 阴影
  if (stateStyle.boxShadow) {
    result.boxShadow = stateStyle.boxShadow
  }

  return result
}

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

// 获取滚动触发的动画
const getScrollAnimations = (): AnimationConfig[] => {
  return getAnimations().filter(anim => anim.trigger === 'onScroll')
}

// 播放滚动触发动画
const playScrollAnimation = (animation: AnimationConfig) => {
  if (!elementRef.value) return
  const animId = animation.id || `${props.element.id}-${animation.type}`

  // 检查是否只触发一次
  if (animation.scrollConfig?.once && triggeredScrollAnimations.has(animId)) {
    return
  }

  const el = elementRef.value
  const animClass = `animate__${animation.type}`

  // 设置动画属性
  el.style.setProperty('--animate-duration', `${animation.duration}s`)
  if (animation.delay > 0) {
    el.style.setProperty('--animate-delay', `${animation.delay}s`)
  }

  // 添加动画类
  el.classList.add('animate__animated', animClass)

  // 动画结束后移除类
  el.addEventListener('animationend', () => {
    el.classList.remove('animate__animated', animClass)
  }, { once: true })

  triggeredScrollAnimations.add(animId)
}

// 设置滚动观察器
const setupScrollObserver = () => {
  if (props.mode === 'design') return
  if (!elementRef.value) return

  const scrollAnimations = getScrollAnimations()
  if (scrollAnimations.length === 0) return

  // 获取配置（使用第一个滚动动画的配置作为观察器配置）
  const config = scrollAnimations[0].scrollConfig

  scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 元素进入视口，播放所有滚动动画
          scrollAnimations.forEach(anim => playScrollAnimation(anim))
        }
      })
    },
    {
      threshold: config?.threshold || 0.1,
      rootMargin: config?.rootMargin || '0px'
    }
  )

  scrollObserver.observe(elementRef.value)
}

// 清理滚动观察器
const cleanupScrollObserver = () => {
  if (scrollObserver) {
    scrollObserver.disconnect()
    scrollObserver = null
  }
}

onMounted(() => {
  if (props.mode !== 'design') {
    registerAnimations()
    setupScrollObserver()
  }
})

onUnmounted(() => {
  cleanupScrollObserver()
})

watch(() => [props.element.animations, props.element.animation], () => {
  if (props.mode !== 'design') {
    registerAnimations()
    // 重新设置滚动观察器
    cleanupScrollObserver()
    setupScrollObserver()
  }
}, { deep: true })

// 事件处理
const executeEvents = (trigger: 'click' | 'doubleClick' | 'longPress' | 'hover') => {
  if (props.mode === 'design') return
  if (!props.element.events?.length) return

  const matchedEvents = props.element.events.filter(e => e.trigger === trigger)
  matchedEvents.forEach(event => {
    executeEventActions(event, {
      goToPage,
      triggerAnimation: (elementId: string, animationName?: string) => {
        const el = document.querySelector(`[data-element-id="${elementId}"]`) as HTMLElement | null
        if (el && animationName) {
          el.classList.add('animate__animated', `animate__${animationName}`)
          el.addEventListener('animationend', () => {
            el.classList.remove('animate__animated', `animate__${animationName}`)
          }, { once: true })
        }
      },
      toggleElement: (elementId: string) => {
        const el = document.querySelector(`[data-element-id="${elementId}"]`) as HTMLElement | null
        if (el) {
          el.style.display = el.style.display === 'none' ? '' : 'none'
        }
      }
    })
  })
}

const handleClick = () => executeEvents('click')
const handleDoubleClick = () => executeEvents('doubleClick')

// 悬停状态处理
const handleMouseEnter = () => {
  isHovered.value = true
  executeEvents('hover')
}
const handleMouseLeave = () => {
  isHovered.value = false
  isPressed.value = false
}

// 激活状态处理
const handleMouseDown = () => {
  isPressed.value = true
}
const handleMouseUp = () => {
  isPressed.value = false
}
</script>

<style scoped>
.elementRenderer.hasHoverStyle {
  cursor: pointer;
}
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
