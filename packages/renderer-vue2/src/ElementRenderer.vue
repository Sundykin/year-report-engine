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
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import type { H5Element } from '@year-report/core'
import { CANVAS_WIDTH, CANVAS_HEIGHT, DataSourceManager, AnimateCssScheduler } from '@year-report/core'
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([BarChart, LineChart, PieChart, GridComponent, TooltipComponent, CanvasRenderer])

export default Vue.extend({
  name: 'ElementRenderer',

  inject: {
    dataManager: {
      default: null
    },
    dataVersion: {
      default: 0
    },
    pageSchedulers: {
      default: () => new Map()
    }
  },

  props: {
    element: {
      type: Object as () => H5Element,
      required: true
    },
    pageIndex: {
      type: Number,
      required: true
    },
    isActive: {
      type: Boolean,
      required: true
    },
    offsetX: {
      type: Number,
      default: 0
    },
    offsetY: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      chartInstance: null as echarts.ECharts | null,
      resolvedContent: '',
      resolvedHtml: '',
      resolvedRichText: '',
      resolvedChartData: [] as any[]
    }
  },

  computed: {
    // 计算元素是否在可视区域内（用于裁剪）
    isInVisibleArea(): boolean {
      const el = this.element
      // 完全在可视区域外的元素不渲染
      return !(
        el.x + el.width < 0 ||
        el.x > CANVAS_WIDTH ||
        el.y + el.height < 0 ||
        el.y > CANVAS_HEIGHT
      )
    },

    elementStyle(): any {
      // 元素完全在可视区域外则隐藏
      if (!this.isInVisibleArea) {
        return { display: 'none' }
      }

      const style: any = {
        position: 'absolute',
        left: `${this.element.x + this.offsetX}px`,
        top: `${this.element.y + this.offsetY}px`,
        width: `${this.element.width}px`,
        height: `${this.element.height}px`,
        zIndex: this.element.zIndex || 1
      }

      if (this.element.rotation) {
        style.transform = `rotate(${this.element.rotation}deg)`
        style.transformOrigin = 'center center'
      }

      return style
    },

    contentStyle(): any {
      return {
        width: '100%',
        height: '100%',
        ...this.element.style
      }
    }
  },

  watch: {
    // 监听数据版本变化，更新解析的内容
    dataVersion: {
      handler() {
        this.resolveContent()
      },
      immediate: true
    },
    // 监听图表数据和类型变化
    'element.chartType': {
      handler() {
        this.updateChart()
      }
    },
    resolvedChartData: {
      handler() {
        this.updateChart()
      },
      deep: true
    },
    // 监听动画配置变化
    'element.animations': {
      handler() {
        this.registerAnimations()
      },
      deep: true
    },
    'element.animation': {
      handler() {
        this.registerAnimations()
      },
      deep: true
    }
  },

  mounted() {
    this.resolveContent()
    this.registerAnimations()

    if (this.element.type === 'chart' && this.$refs.chartRef) {
      this.chartInstance = echarts.init(this.$refs.chartRef as HTMLDivElement)
      this.updateChart()
    }
  },

  beforeDestroy() {
    if (this.chartInstance) {
      this.chartInstance.dispose()
    }
  },

  methods: {
    // 解析内容
    resolveContent() {
      const dataManager = this.dataManager as DataSourceManager | null

      // 解析文本内容
      if (this.element.content) {
        if (dataManager) {
          this.resolvedContent = dataManager.resolve(this.element.content)
          this.resolvedRichText = dataManager.resolve(this.element.content)
        } else {
          this.resolvedContent = this.element.content
          this.resolvedRichText = this.element.content
        }
      }

      // 解析渲染函数
      if (this.element.renderFunction) {
        if (!dataManager || !this.element.dataBinding?.sourceIds?.length) {
          this.resolvedHtml = '<div>请配置数据源</div>'
        } else {
          const sourceIds = this.element.dataBinding.sourceIds
          const dataSources = sourceIds.map(id => dataManager.getData(id)).filter(v => v !== undefined)

          if (!dataSources.length) {
            this.resolvedHtml = '<div>数据源未找到</div>'
          } else {
            try {
              const paramNames = dataSources.map((_, i) => `ds${i + 1}`).join(', ')
              const renderFn = new Function(paramNames, `return (${this.element.renderFunction})(${paramNames})`)
              const result = renderFn(...dataSources)
              this.resolvedHtml = typeof result === 'string' ? result : '<div>渲染函数必须返回字符串</div>'
            } catch (e: any) {
              console.error('渲染函数执行失败:', e)
              this.resolvedHtml = `<div style="color: red;">渲染错误: ${e.message}</div>`
            }
          }
        }
      }

      // 解析图表数据
      if (this.element.chartData) {
        if (!dataManager || !this.element.dataBinding?.sourceIds?.length) {
          this.resolvedChartData = this.element.chartData
        } else {
          const sourceIds = this.element.dataBinding.sourceIds
          const dataSources = sourceIds.map(id => dataManager.getData(id)).filter(v => v !== undefined)

          if (!dataSources.length) {
            this.resolvedChartData = this.element.chartData
          } else if (this.element.dataBinding.transform) {
            try {
              const paramNames = dataSources.map((_, i) => `ds${i + 1}`).join(', ')
              const transformFn = new Function(paramNames, `return (${this.element.dataBinding.transform})(${paramNames})`)
              const result = transformFn(...dataSources)
              this.resolvedChartData = Array.isArray(result) ? result : this.element.chartData
            } catch (e) {
              console.error('图表转换函数执行失败:', e)
              this.resolvedChartData = this.element.chartData
            }
          } else {
            this.resolvedChartData = this.element.chartData
          }
        }
      }
    },

    // 获取所有动画配置
    getAnimations(): any[] {
      if (this.element.animations?.length) return this.element.animations
      if (this.element.animation) return [this.element.animation]
      return []
    },

    // 注册动画到编排器
    registerAnimations() {
      if (!this.$refs.elementRef || !this.pageSchedulers) return

      const elementRef = this.$refs.elementRef as HTMLDivElement
      let scheduler = this.pageSchedulers.get(this.pageIndex)
      if (!scheduler) {
        scheduler = new AnimateCssScheduler()
        this.pageSchedulers.set(this.pageIndex, scheduler)
      }

      // 先移除旧的动画注册
      scheduler.unregisterElement(this.element.id)

      // 如果有动画则重新注册
      const animations = this.getAnimations()
      if (animations.length > 0) {
        scheduler.registerElement(
          this.element.id,
          elementRef,
          animations,
          { x: this.element.x, y: this.element.y }
        )
      }
    },

    // 更新图表
    updateChart() {
      if (!this.chartInstance || !this.resolvedChartData.length) return

      const chartData = this.resolvedChartData
      const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

      if (this.element.chartType === 'bar') {
        this.chartInstance.setOption({
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
      } else if (this.element.chartType === 'line') {
        this.chartInstance.setOption({
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
      } else if (this.element.chartType === 'pie') {
        this.chartInstance.setOption({
          series: [{
            type: 'pie',
            data: chartData.map((d: any, i: number) => ({
              name: d.name,
              value: d.value,
              itemStyle: { color: COLORS[i % COLORS.length] }
            })),
            radius: '80%'
          }]
        })
      }
    }
  }
})
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

.richtext-content ::v-deep p,
.richtext-content ::v-deep li {
  white-space: pre-wrap;
}

.richtext-content ::v-deep blockquote {
  border-left: 8px solid #d0e5f2;
  padding: 10px 10px;
  margin: 10px 0;
  background-color: #f1f1f1;
}

.richtext-content ::v-deep code {
  font-family: monospace;
  background-color: #eee;
  padding: 3px;
  border-radius: 3px;
}

.richtext-content ::v-deep pre > code {
  display: block;
  padding: 10px;
}

.richtext-content ::v-deep table {
  border-collapse: collapse;
}

.richtext-content ::v-deep td,
.richtext-content ::v-deep th {
  border: 1px solid #ccc;
  min-width: 50px;
  height: 20px;
  padding: 5px;
}

.richtext-content ::v-deep th {
  background-color: #f1f1f1;
}

.richtext-content ::v-deep ul,
.richtext-content ::v-deep ol {
  padding-left: 20px;
}

.richtext-content ::v-deep input[type="checkbox"] {
  margin-right: 5px;
}
</style>
