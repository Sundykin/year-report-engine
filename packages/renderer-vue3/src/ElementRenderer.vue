<template>
  <div
    ref="elementRef"
    :style="elementStyle"
  >
    <!-- 文本 -->
    <div
      v-if="element.type === 'text'"
      :style="contentStyle"
      style="display: flex; align-items: center; justify-content: center; white-space: pre-wrap; line-height: 1.2;"
    >
      <div v-if="element.renderFunction" v-html="resolvedHtml" style="width: 100%; height: 100%;" />
      <template v-else>{{ resolvedContent }}</template>
    </div>

    <!-- 图片 -->
    <img
      v-else-if="element.type === 'image'"
      :src="element.src"
      alt="asset"
      :style="contentStyle"
      style="object-fit: cover;"
      draggable="false"
    />

    <!-- 形状 -->
    <div v-else-if="element.type === 'shape'" :style="contentStyle" :class="`shape-${element.shapeType || 'rectangle'}`" />

    <!-- 视频 -->
    <video
      v-else-if="element.type === 'video'"
      :src="element.src"
      :style="contentStyle"
      style="object-fit: cover;"
      autoplay
      loop
      muted
      playsinline
    />

    <!-- 富文本 -->
    <div
      v-else-if="element.type === 'richtext'"
      v-html="resolvedRichText"
      :style="contentStyle"
      class="richtext-content"
      style="overflow: auto;"
    />

    <!-- 图表 -->
    <div v-else-if="element.type === 'chart'" ref="chartRef" :style="contentStyle" />

    <!-- 按钮 -->
    <button
      v-else-if="element.type === 'button'"
      :style="buttonStyle"
      @click="handleButtonClick"
    >
      <span v-if="element.buttonIcon" class="buttonIcon">{{ element.buttonIcon }}</span>
      {{ element.content || '按钮' }}
    </button>

    <!-- 图标 -->
    <div v-else-if="element.type === 'icon'" :style="iconStyle" class="iconElement">
      {{ getIconChar(element.iconName) }}
    </div>

    <!-- 分割线 -->
    <div v-else-if="element.type === 'divider'" :style="dividerStyle" class="dividerElement">
      <span v-if="element.dividerText" class="dividerText">{{ element.dividerText }}</span>
    </div>

    <!-- 进度条 -->
    <div v-else-if="element.type === 'progress'" :style="contentStyle" class="progressElement">
      <div v-if="element.progressType === 'line'" class="progressLine">
        <div class="progressTrack" :style="{ backgroundColor: element.style?.backgroundColor || '#262626', borderRadius: element.style?.borderRadius }">
          <div class="progressBar" :style="{ width: `${element.progressValue || 0}%`, backgroundColor: element.progressColor || '#3b82f6', borderRadius: element.style?.borderRadius }" />
        </div>
      </div>
      <svg v-else-if="element.progressType === 'circle'" viewBox="0 0 100 100" class="progressCircle">
        <circle cx="50" cy="50" r="45" fill="none" :stroke="element.style?.backgroundColor || '#262626'" stroke-width="8" />
        <circle cx="50" cy="50" r="45" fill="none" :stroke="element.progressColor || '#3b82f6'" stroke-width="8"
          :stroke-dasharray="`${(element.progressValue || 0) * 2.83} 283`" stroke-linecap="round" transform="rotate(-90 50 50)" />
        <text x="50" y="55" text-anchor="middle" :fill="element.style?.color || '#fff'" font-size="20">{{ element.progressValue || 0 }}%</text>
      </svg>
    </div>

    <!-- 计数器 -->
    <div v-else-if="element.type === 'counter'" :style="contentStyle" class="counterElement">
      {{ element.counterPrefix }}{{ animatedCounter }}{{ element.counterSuffix }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, inject, type Ref } from 'vue'
import type { H5Element } from '@year-report/core'
import { CANVAS_WIDTH, CANVAS_HEIGHT, DataSourceManager, AnimateCssScheduler } from '@year-report/core'
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([BarChart, LineChart, PieChart, GridComponent, TooltipComponent, CanvasRenderer])

interface Props {
  element: H5Element
  pageIndex: number
  isActive: boolean
  offsetX?: number
  offsetY?: number
}

const props = withDefaults(defineProps<Props>(), {
  offsetX: 0,
  offsetY: 0
})

// 注入数据源管理器和动画编排器
const dataManager = inject<DataSourceManager>('dataManager')
const dataVersion = inject<Ref<number>>('dataVersion')
const pageSchedulers = inject<Ref<Map<number, AnimateCssScheduler>>>('pageSchedulers')

const elementRef = ref<HTMLDivElement | null>(null)
const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

// 解析文本内容中的数据绑定
const resolvedContent = computed(() => {
  if (!props.element.content) return ''
  if (!dataManager) return props.element.content
  const _ = dataVersion?.value
  return dataManager.resolve(props.element.content)
})

// 解析渲染函数生成的HTML
const resolvedHtml = computed(() => {
  if (!props.element.renderFunction) return ''
  if (!dataManager || !props.element.dataBinding?.sourceIds?.length) {
    return '<div>请配置数据源</div>'
  }

  const _ = dataVersion?.value
  const sourceIds = props.element.dataBinding.sourceIds
  const dataSources = sourceIds.map(id => dataManager.getData(id)).filter(v => v !== undefined)

  if (!dataSources.length) return '<div>数据源未找到</div>'

  try {
    const paramNames = dataSources.map((_, i) => `ds${i + 1}`).join(', ')
    const renderFn = new Function(paramNames, `return (${props.element.renderFunction})(${paramNames})`)
    const result = renderFn(...dataSources)
    return typeof result === 'string' ? result : '<div>渲染函数必须返回字符串</div>'
  } catch (e) {
    console.error('渲染函数执行失败:', e)
    return `<div style="color: red;">渲染错误: ${e.message}</div>`
  }
})

// 解析富文本中的插值语法
const resolvedRichText = computed(() => {
  if (!props.element.content) return ''
  if (!dataManager) return props.element.content
  const _ = dataVersion?.value
  return dataManager.resolve(props.element.content)
})

// 获取所有动画配置
const getAnimations = () => {
  if (props.element.animations?.length) return props.element.animations
  if (props.element.animation) return [props.element.animation]
  return []
}

// 注册/更新动画到编排器
const registerAnimations = () => {
  if (!elementRef.value || !pageSchedulers?.value) return

  let scheduler = pageSchedulers.value.get(props.pageIndex)
  if (!scheduler) {
    scheduler = new AnimateCssScheduler()
    pageSchedulers.value.set(props.pageIndex, scheduler)
  }

  // 先移除旧的动画注册
  scheduler.unregisterElement(props.element.id)

  // 如果有动画则重新注册
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
  registerAnimations()
})

// 监听动画配置变化
watch(() => [props.element.animations, props.element.animation], () => {
  registerAnimations()
}, { deep: true })

// 计算元素是否在可视区域内（用于裁剪）
const isInVisibleArea = computed(() => {
  const el = props.element
  // 完全在可视区域外的元素不渲染
  return !(
    el.x + el.width < 0 ||
    el.x > CANVAS_WIDTH ||
    el.y + el.height < 0 ||
    el.y > CANVAS_HEIGHT
  )
})

const elementStyle = computed(() => {
  // 元素完全在可视区域外则隐藏
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

const contentStyle = computed(() => ({
  width: '100%',
  height: '100%',
  ...props.element.style
}))

// 按钮样式
const buttonStyle = computed(() => {
  const base: any = {
    width: '100%',
    height: '100%',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    ...props.element.style
  }
  if (props.element.buttonStyle === 'outline') {
    base.backgroundColor = 'transparent'
    base.border = `2px solid ${props.element.style?.backgroundColor || '#3b82f6'}`
    base.color = props.element.style?.backgroundColor || '#3b82f6'
  } else if (props.element.buttonStyle === 'text') {
    base.backgroundColor = 'transparent'
    base.color = props.element.style?.backgroundColor || '#3b82f6'
  }
  return base
})

// 图标样式
const iconStyle = computed(() => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: `${Math.min(props.element.width, props.element.height) * 0.8}px`,
  color: props.element.iconColor || '#3b82f6'
}))

// 分割线样式
const dividerStyle = computed(() => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative' as const,
  '&::before': {
    content: '""',
    flex: 1,
    height: '1px',
    backgroundColor: props.element.style?.backgroundColor || '#404040',
    borderStyle: props.element.dividerStyle || 'solid'
  }
}))

// 图标字符映射
const getIconChar = (name?: string) => {
  const icons: Record<string, string> = {
    star: '⭐', heart: '❤️', check: '✓', close: '✕', arrow: '→',
    home: '🏠', user: '👤', settings: '⚙️', search: '🔍', mail: '✉️'
  }
  return icons[name || 'star'] || '⭐'
}

// 按钮点击处理
const handleButtonClick = () => {
  const action = props.element.buttonAction
  if (!action || action.type === 'none') return

  switch (action.type) {
    case 'link':
      if (action.value) window.open(action.value, '_blank')
      break
    case 'phone':
      if (action.value) window.location.href = `tel:${action.value}`
      break
    case 'email':
      if (action.value) window.location.href = `mailto:${action.value}`
      break
  }
}

// 计数器动画
const animatedCounter = ref(0)
const animateCounter = () => {
  if (props.element.type !== 'counter') return
  const target = props.element.counterValue || 0
  const duration = (props.element.counterDuration || 2) * 1000
  const decimals = props.element.counterDecimals || 0
  const start = performance.now()

  const animate = (now: number) => {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
    animatedCounter.value = Number((target * eased).toFixed(decimals))
    if (progress < 1) requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
}

watch(() => props.isActive, (active) => {
  if (active && props.element.type === 'counter') {
    animatedCounter.value = 0
    animateCounter()
  }
}, { immediate: true })

// 解析图表数据（支持数据绑定和转换函数）
const resolvedChartData = computed(() => {
  if (!props.element.chartData) return []
  if (!dataManager || !props.element.dataBinding?.sourceIds?.length) {
    return props.element.chartData
  }

  const _ = dataVersion?.value
  const sourceIds = props.element.dataBinding.sourceIds
  const dataSources = sourceIds.map(id => dataManager.getData(id)).filter(v => v !== undefined)

  if (!dataSources.length) return props.element.chartData

  // 如果有转换函数，执行转换
  if (props.element.dataBinding.transform) {
    try {
      const paramNames = dataSources.map((_, i) => `ds${i + 1}`).join(', ')
      const transformFn = new Function(paramNames, `return (${props.element.dataBinding.transform})(${paramNames})`)
      const result = transformFn(...dataSources)
      return Array.isArray(result) ? result : props.element.chartData
    } catch (e) {
      console.error('图表转换函数执行失败:', e)
      return props.element.chartData
    }
  }

  return props.element.chartData
})

// 初始化图表
onMounted(() => {
  if (props.element.type === 'chart' && chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    updateChart()
  }
})

watch(() => [props.element.chartType, resolvedChartData.value], () => {
  if (chartInstance) {
    updateChart()
  }
}, { deep: true })

const updateChart = () => {
  if (!chartInstance) return
  const chartData = resolvedChartData.value
  if (!chartData || !chartData.length) return

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  if (props.element.chartType === 'bar') {
    chartInstance.setOption({
      grid: { left: 30, right: 10, top: 10, bottom: 30 },
      xAxis: {
        type: 'category',
        data: chartData.map(d => d.name),
        axisLine: { lineStyle: { color: '#888' } },
        axisLabel: { fontSize: 10 }
      },
      yAxis: { type: 'value', show: false },
      series: [{
        type: 'bar',
        data: chartData.map(d => d.value),
        itemStyle: {
          color: '#8884d8',
          borderRadius: [4, 4, 0, 0]
        }
      }]
    })
  } else if (props.element.chartType === 'line') {
    chartInstance.setOption({
      grid: { left: 30, right: 10, top: 10, bottom: 30 },
      xAxis: {
        type: 'category',
        data: chartData.map(d => d.name),
        axisLine: { lineStyle: { color: '#888' } },
        axisLabel: { fontSize: 10 }
      },
      yAxis: { type: 'value', show: false },
      series: [{
        type: 'line',
        data: chartData.map(d => d.value),
        smooth: true,
        lineStyle: { color: '#8884d8', width: 3 },
        showSymbol: false
      }]
    })
  } else if (props.element.chartType === 'pie') {
    chartInstance.setOption({
      series: [{
        type: 'pie',
        data: chartData.map((d, i) => ({
          name: d.name,
          value: d.value,
          itemStyle: { color: COLORS[i % COLORS.length] }
        })),
        radius: '80%'
      }]
    })
  }
}
</script>

<style scoped>
.shape-rectangle { border-radius: 0; }
.shape-circle { border-radius: 50%; }
.shape-triangle {
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}
.shape-parallelogram { transform: skewX(-20deg); }
.shape-diamond { transform: rotate(45deg); border-radius: 8%; }
.shape-star {
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}
.shape-hexagon {
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}

.richtext-content :deep(p),
.richtext-content :deep(li) {
  white-space: pre-wrap;
}

.richtext-content :deep(blockquote) {
  border-left: 8px solid #d0e5f2;
  padding: 10px 10px;
  margin: 10px 0;
  background-color: #f1f1f1;
}

.richtext-content :deep(code) {
  font-family: monospace;
  background-color: #eee;
  padding: 3px;
  border-radius: 3px;
}

.richtext-content :deep(pre>code) {
  display: block;
  padding: 10px;
}

.richtext-content :deep(table) {
  border-collapse: collapse;
}

.richtext-content :deep(td),
.richtext-content :deep(th) {
  border: 1px solid #ccc;
  min-width: 50px;
  height: 20px;
  padding: 5px;
}

.richtext-content :deep(th) {
  background-color: #f1f1f1;
}

.richtext-content :deep(ul),
.richtext-content :deep(ol) {
  padding-left: 20px;
}

.richtext-content :deep(input[type="checkbox"]) {
  margin-right: 5px;
}

/* 按钮 */
.buttonIcon { margin-right: 4px; }

/* 图标 */
.iconElement { user-select: none; }

/* 分割线 */
.dividerElement::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background: currentColor;
}
.dividerText {
  position: relative;
  z-index: 1;
  padding: 0 10px;
  background: inherit;
  font-size: 12px;
  color: #888;
}

/* 进度条 */
.progressLine { width: 100%; height: 100%; }
.progressTrack { width: 100%; height: 100%; overflow: hidden; }
.progressBar { height: 100%; transition: width 0.3s ease; }
.progressCircle { width: 100%; height: 100%; }

/* 计数器 */
.counterElement {
  display: flex;
  align-items: center;
  justify-content: center;
  font-variant-numeric: tabular-nums;
}
</style>
