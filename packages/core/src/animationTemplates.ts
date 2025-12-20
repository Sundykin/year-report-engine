/**
 * 动画模板库
 * 预设常用动画效果组合
 */
import type { AnimationConfig } from './types'

export interface AnimationTemplate {
  id: string
  name: string
  category: string
  description: string
  preview?: string  // 预览图URL
  animations: Partial<AnimationConfig>[]
}

export interface AnimationTemplateCategory {
  id: string
  name: string
  icon: string
}

// 模板分类
export const ANIMATION_TEMPLATE_CATEGORIES: AnimationTemplateCategory[] = [
  { id: 'entrance', name: '入场动画', icon: '🚀' },
  { id: 'emphasis', name: '强调动画', icon: '✨' },
  { id: 'exit', name: '退场动画', icon: '👋' },
  { id: 'scroll', name: '滚动动画', icon: '📜' },
  { id: 'loop', name: '循环动画', icon: '🔄' },
  { id: 'sequence', name: '组合序列', icon: '🎬' }
]

// 预设动画模板
export const ANIMATION_TEMPLATES: AnimationTemplate[] = [
  // 入场动画
  {
    id: 'fade-slide-up',
    name: '淡入上滑',
    category: 'entrance',
    description: '从下方淡入滑出，柔和自然',
    animations: [
      { type: 'fadeInUp', duration: 0.6, delay: 0, trigger: 'onEnter', easing: 'ease-out' }
    ]
  },
  {
    id: 'zoom-bounce',
    name: '弹性缩放',
    category: 'entrance',
    description: '带弹性的缩放入场',
    animations: [
      { type: 'zoomIn', duration: 0.5, delay: 0, trigger: 'onEnter', easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }
    ]
  },
  {
    id: 'slide-left-stagger',
    name: '左侧滑入',
    category: 'entrance',
    description: '从左侧滑入',
    animations: [
      { type: 'slideInLeft', duration: 0.5, delay: 0, trigger: 'onEnter', easing: 'ease-out' }
    ]
  },
  {
    id: 'flip-entrance',
    name: '翻转入场',
    category: 'entrance',
    description: '3D翻转效果入场',
    animations: [
      { type: 'flipInX', duration: 0.8, delay: 0, trigger: 'onEnter', easing: 'ease-out' }
    ]
  },
  {
    id: 'rotate-entrance',
    name: '旋转入场',
    category: 'entrance',
    description: '旋转淡入',
    animations: [
      { type: 'rotateIn', duration: 0.6, delay: 0, trigger: 'onEnter', easing: 'ease-out' }
    ]
  },

  // 强调动画
  {
    id: 'pulse-attention',
    name: '脉冲闪烁',
    category: 'emphasis',
    description: '吸引注意力的脉冲效果',
    animations: [
      { type: 'pulse', duration: 1, delay: 0, trigger: 'onEnter', iterationCount: 3, easing: 'ease-in-out' }
    ]
  },
  {
    id: 'shake-alert',
    name: '摇晃提醒',
    category: 'emphasis',
    description: '左右摇晃提醒效果',
    animations: [
      { type: 'shake', duration: 0.8, delay: 0, trigger: 'onEnter', easing: 'ease-in-out' }
    ]
  },
  {
    id: 'bounce-highlight',
    name: '弹跳高亮',
    category: 'emphasis',
    description: '上下弹跳吸引注意',
    animations: [
      { type: 'bounce', duration: 1, delay: 0, trigger: 'onEnter', iterationCount: 2, easing: 'ease' }
    ]
  },
  {
    id: 'rubber-band',
    name: '橡皮筋',
    category: 'emphasis',
    description: '弹性伸缩效果',
    animations: [
      { type: 'rubberBand', duration: 1, delay: 0, trigger: 'onEnter', easing: 'ease-out' }
    ]
  },
  {
    id: 'heartbeat',
    name: '心跳',
    category: 'emphasis',
    description: '心跳般的缩放效果',
    animations: [
      { type: 'heartBeat', duration: 1.3, delay: 0, trigger: 'onEnter', iterationCount: 2, easing: 'ease-in-out' }
    ]
  },

  // 退场动画
  {
    id: 'fade-out-down',
    name: '下滑淡出',
    category: 'exit',
    description: '向下滑动并淡出',
    animations: [
      { type: 'fadeOutDown', duration: 0.5, delay: 0, trigger: 'onExit', easing: 'ease-in' }
    ]
  },
  {
    id: 'zoom-out',
    name: '缩小消失',
    category: 'exit',
    description: '缩小并淡出',
    animations: [
      { type: 'zoomOut', duration: 0.4, delay: 0, trigger: 'onExit', easing: 'ease-in' }
    ]
  },
  {
    id: 'slide-out-down',
    name: '下方滑出',
    category: 'exit',
    description: '向下滑出屏幕',
    animations: [
      { type: 'slideOutDown', duration: 0.4, delay: 0, trigger: 'onExit', easing: 'ease-in' }
    ]
  },

  // 滚动触发动画
  {
    id: 'scroll-fade-in',
    name: '滚动淡入',
    category: 'scroll',
    description: '滚动到可视区域时淡入',
    animations: [
      {
        type: 'fadeIn',
        duration: 0.6,
        delay: 0,
        trigger: 'onScroll',
        easing: 'ease-out',
        scrollConfig: { threshold: 0.2, once: true }
      }
    ]
  },
  {
    id: 'scroll-slide-up',
    name: '滚动上滑',
    category: 'scroll',
    description: '滚动时从下方滑入',
    animations: [
      {
        type: 'fadeInUp',
        duration: 0.6,
        delay: 0,
        trigger: 'onScroll',
        easing: 'ease-out',
        scrollConfig: { threshold: 0.1, once: true }
      }
    ]
  },
  {
    id: 'scroll-zoom',
    name: '滚动缩放',
    category: 'scroll',
    description: '滚动时缩放入场',
    animations: [
      {
        type: 'zoomIn',
        duration: 0.5,
        delay: 0,
        trigger: 'onScroll',
        easing: 'ease-out',
        scrollConfig: { threshold: 0.3, once: true }
      }
    ]
  },

  // 循环动画
  {
    id: 'infinite-pulse',
    name: '持续脉冲',
    category: 'loop',
    description: '无限循环的脉冲效果',
    animations: [
      { type: 'pulse', duration: 2, delay: 0, trigger: 'onEnter', iterationCount: 'infinite', easing: 'ease-in-out' }
    ]
  },
  {
    id: 'infinite-float',
    name: '漂浮效果',
    category: 'loop',
    description: '上下漂浮的动画',
    animations: [
      { type: 'bounce', duration: 2, delay: 0, trigger: 'onEnter', iterationCount: 'infinite', easing: 'ease-in-out' }
    ]
  },
  {
    id: 'infinite-swing',
    name: '摆动效果',
    category: 'loop',
    description: '左右摆动的动画',
    animations: [
      { type: 'swing', duration: 1.5, delay: 0, trigger: 'onEnter', iterationCount: 'infinite', easing: 'ease-in-out' }
    ]
  },

  // 组合序列
  {
    id: 'attention-sequence',
    name: '注意力序列',
    category: 'sequence',
    description: '入场后强调的组合动画',
    animations: [
      { type: 'fadeInUp', duration: 0.5, delay: 0, trigger: 'onEnter', easing: 'ease-out' },
      { type: 'pulse', duration: 0.5, delay: 0.6, trigger: 'afterPrevious', iterationCount: 2, easing: 'ease-in-out' }
    ]
  },
  {
    id: 'bounce-entrance',
    name: '弹跳入场',
    category: 'sequence',
    description: '弹入后稳定的组合',
    animations: [
      { type: 'bounceIn', duration: 0.6, delay: 0, trigger: 'onEnter', easing: 'ease-out' },
      { type: 'rubberBand', duration: 0.4, delay: 0.1, trigger: 'afterPrevious', easing: 'ease-out' }
    ]
  },
  {
    id: 'dramatic-entrance',
    name: '戏剧入场',
    category: 'sequence',
    description: '翻转后心跳强调',
    animations: [
      { type: 'flipInY', duration: 0.8, delay: 0, trigger: 'onEnter', easing: 'ease-out' },
      { type: 'heartBeat', duration: 1, delay: 0.2, trigger: 'afterPrevious', easing: 'ease-in-out' }
    ]
  }
]

// 根据分类获取模板
export function getTemplatesByCategory(categoryId: string): AnimationTemplate[] {
  return ANIMATION_TEMPLATES.filter(t => t.category === categoryId)
}

// 应用模板到元素
export function applyTemplate(template: AnimationTemplate): AnimationConfig[] {
  return template.animations.map((anim, index) => ({
    id: `${template.id}-${index}-${Date.now()}`,
    type: anim.type || 'fadeIn',
    duration: anim.duration || 1,
    delay: anim.delay || 0,
    trigger: anim.trigger || 'onEnter',
    easing: anim.easing || 'ease',
    order: index,
    iterationCount: anim.iterationCount,
    scrollConfig: anim.scrollConfig
  })) as AnimationConfig[]
}
