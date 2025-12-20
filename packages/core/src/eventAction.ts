/**
 * 事件处理工具函数
 */

import type { EventAction, ElementEvent } from './types'

/**
 * 执行事件动作
 * @param action 动作配置
 * @param context 执行上下文
 */
export function executeAction(
  action: EventAction,
  context: {
    goToPage?: (pageId: string) => void
    triggerAnimation?: (elementId: string, animationName?: string) => void
    toggleElement?: (elementId: string) => void
  }
): void {
  switch (action.type) {
    case 'navigate':
      if (action.url) {
        if (action.openInNew) {
          window.open(action.url, '_blank')
        } else {
          window.location.href = action.url
        }
      }
      break

    case 'page':
      if (action.pageId && context.goToPage) {
        context.goToPage(action.pageId)
      }
      break

    case 'call':
      if (action.value) {
        window.location.href = `tel:${action.value}`
      }
      break

    case 'email':
      if (action.value) {
        window.location.href = `mailto:${action.value}`
      }
      break

    case 'animation':
      if (action.targetElementId && context.triggerAnimation) {
        context.triggerAnimation(action.targetElementId, action.animationName)
      }
      break

    case 'toggle':
      if (action.toggleElementId && context.toggleElement) {
        context.toggleElement(action.toggleElementId)
      }
      break

    case 'custom':
      if (action.customCode) {
        try {
          // 使用 Function 执行自定义代码，传入上下文
          const fn = new Function('context', action.customCode)
          fn(context)
        } catch (e) {
          console.error('执行自定义代码出错:', e)
        }
      }
      break
  }
}

/**
 * 执行事件的所有动作
 */
export function executeEventActions(
  event: ElementEvent,
  context: Parameters<typeof executeAction>[1]
): void {
  for (const action of event.actions) {
    executeAction(action, context)
  }
}

/**
 * 事件触发类型显示名称
 */
export const EVENT_TRIGGERS: { value: ElementEvent['trigger']; label: string }[] = [
  { value: 'click', label: '点击' },
  { value: 'doubleClick', label: '双击' },
  { value: 'longPress', label: '长按' },
  { value: 'hover', label: '悬停' },
]

/**
 * 动作类型显示名称
 */
export const ACTION_TYPES: { value: EventAction['type']; label: string }[] = [
  { value: 'navigate', label: '跳转链接' },
  { value: 'page', label: '切换页面' },
  { value: 'call', label: '拨打电话' },
  { value: 'email', label: '发送邮件' },
  { value: 'animation', label: '触发动画' },
  { value: 'toggle', label: '切换显示' },
  { value: 'custom', label: '自定义代码' },
]
