// 常量定义
import type { AnimationType, AnimationTrigger } from './types'

// 画布默认尺寸
export const CANVAS_WIDTH = 375
export const CANVAS_HEIGHT = 667
export const CANVAS_EXTEND_WIDTH = 200  // 左右各100
export const CANVAS_EXTEND_HEIGHT = 200 // 上下各100

export const DEFAULT_CHART_DATA = [
  { name: '1月', value: 400 },
  { name: '2月', value: 300 },
  { name: '3月', value: 600 },
  { name: '4月', value: 200 },
]

// 动画分组
export const ANIMATION_GROUPS: {
  title: string
  items: { value: AnimationType; label: string }[]
}[] = [
  {
    title: '入场动画',
    items: [
      { value: 'none', label: '无动画' },
      { value: 'fadeIn', label: '淡入' },
      { value: 'fadeInUp', label: '向上淡入' },
      { value: 'fadeInDown', label: '向下淡入' },
      { value: 'fadeInLeft', label: '向左淡入' },
      { value: 'fadeInRight', label: '向右淡入' },
      { value: 'slideInUp', label: '向上滑入' },
      { value: 'slideInDown', label: '向下滑入' },
      { value: 'slideInLeft', label: '向左滑入' },
      { value: 'slideInRight', label: '向右滑入' },
      { value: 'zoomIn', label: '放大进入' },
      { value: 'zoomInUp', label: '向上放大' },
      { value: 'zoomInDown', label: '向下放大' },
      { value: 'bounceIn', label: '弹入' },
      { value: 'bounceInUp', label: '向上弹入' },
      { value: 'bounceInDown', label: '向下弹入' },
      { value: 'flipInX', label: 'X轴翻转' },
      { value: 'flipInY', label: 'Y轴翻转' },
      { value: 'rotateIn', label: '旋转进入' },
    ]
  },
  {
    title: '强调动画',
    items: [
      { value: 'bounce', label: '弹跳' },
      { value: 'flash', label: '闪烁' },
      { value: 'pulse', label: '脉冲' },
      { value: 'rubberBand', label: '橡皮筋' },
      { value: 'shake', label: '抖动' },
      { value: 'swing', label: '摇摆' },
      { value: 'tada', label: 'Tada' },
      { value: 'wobble', label: '摇晃' },
      { value: 'jello', label: '果冻' },
      { value: 'heartBeat', label: '心跳' },
    ]
  },
  {
    title: '退出动画',
    items: [
      { value: 'fadeOut', label: '淡出' },
      { value: 'fadeOutUp', label: '向上淡出' },
      { value: 'fadeOutDown', label: '向下淡出' },
      { value: 'slideOutUp', label: '向上滑出' },
      { value: 'slideOutDown', label: '向下滑出' },
      { value: 'zoomOut', label: '缩小退出' },
      { value: 'bounceOut', label: '弹出' },
    ]
  },
  {
    title: '高级动画',
    items: [
      { value: 'custom', label: '自定义关键帧' },
    ]
  }
]

// 动画触发时机
export const ANIMATION_TRIGGERS: { value: AnimationTrigger; label: string }[] = [
  { value: 'onEnter', label: '页面进入时' },
  { value: 'afterPrevious', label: '上一动画结束后' },
  { value: 'withPrevious', label: '与上一动画同时' },
  { value: 'onClick', label: '点击触发' },
  { value: 'onDelay', label: '延迟触发' },
]

// 缓动函数
export const EASING_FUNCTIONS = [
  { value: 'linear', label: '线性' },
  { value: 'ease', label: '缓动' },
  { value: 'ease-in', label: '缓入' },
  { value: 'ease-out', label: '缓出' },
  { value: 'ease-in-out', label: '缓入缓出' },
  { value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', label: '弹性' },
]

// 图表类型
export const CHART_TYPES: { value: string; label: string }[] = [
  { value: 'bar', label: '柱状图' },
  { value: 'line', label: '折线图' },
  { value: 'pie', label: '饼图' },
]
