<template>
  <div class="chartElement">
    <div v-if="mode !== 'design' && element.chartData" ref="chartRef" class="chartContainer" />
    <div v-else class="chartPlaceholder">
      <slot>📊 图表</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import type { ElementComponentProps } from './types'

echarts.use([CanvasRenderer, BarChart, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent])

const props = withDefaults(defineProps<ElementComponentProps>(), {
  mode: 'render'
})

const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const chartOption = computed(() => {
  const el = props.element
  if (!el.chartData) return null

  const baseOption = {
    tooltip: { trigger: 'item' as const },
    grid: { left: '10%', right: '10%', top: '10%', bottom: '10%' }
  }

  switch (el.chartType) {
    case 'bar':
      return {
        ...baseOption,
        xAxis: { type: 'category' as const, data: el.chartData.map(d => d.name) },
        yAxis: { type: 'value' as const },
        series: [{ type: 'bar', data: el.chartData.map(d => d.value) }]
      }
    case 'line':
      return {
        ...baseOption,
        xAxis: { type: 'category' as const, data: el.chartData.map(d => d.name) },
        yAxis: { type: 'value' as const },
        series: [{ type: 'line', data: el.chartData.map(d => d.value), smooth: true }]
      }
    case 'pie':
      return {
        ...baseOption,
        series: [{ type: 'pie', radius: '60%', data: el.chartData }]
      }
    default:
      return null
  }
})

const initChart = () => {
  if (!chartRef.value || props.mode === 'design') return
  chartInstance = echarts.init(chartRef.value)
  if (chartOption.value) {
    chartInstance.setOption(chartOption.value)
  }
}

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  chartInstance?.dispose()
})

watch(chartOption, (opt) => {
  if (chartInstance && opt) {
    chartInstance.setOption(opt)
  }
}, { deep: true })

watch(() => props.mode, (mode) => {
  if (mode !== 'design' && !chartInstance) {
    setTimeout(initChart, 0)
  }
})
</script>

<style scoped>
.chartElement { width: 100%; height: 100%; }
.chartContainer { width: 100%; height: 100%; }
.chartPlaceholder {
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
