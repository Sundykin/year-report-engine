// 渲染器版本
export const RENDERER_VERSION = '1.0.0'

// 默认动画配置
export const DEFAULT_ANIMATION_CONFIG = {
  duration: 1,
  delay: 0,
  easing: 'ease'
}

// 支持的图表类型
export const CHART_TYPES = [
  'bar',
  'line',
  'pie'
] as const

// 支持的形状类型
export const SHAPE_TYPES = [
  'rectangle',
  'circle',
  'triangle',
  'parallelogram',
  'diamond',
  'star',
  'hexagon'
] as const

// 默认图表颜色
export const DEFAULT_CHART_COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8'
]