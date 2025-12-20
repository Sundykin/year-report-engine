/**
 * 事件配置 Schema
 */

import type { FormSchema } from '../types'
import { EVENT_TRIGGERS, ACTION_TYPES } from '@year-report/core'

/**
 * 创建事件配置 Schema
 * @param pages 页面列表（用于切换页面动作）
 * @param elements 元素列表（用于触发动画/切换显示）
 */
export function createEventSchema(
  pages: { id: string; name: string }[],
  elements: { id: string; name: string }[]
): FormSchema[] {
  return [
    {
      title: '⚡ 交互事件',
      collapsible: true,
      defaultCollapsed: true,
      fields: [
        {
          field: 'events',
          label: '事件配置',
          type: 'event-list',
          props: {
            triggers: EVENT_TRIGGERS,
            actionTypes: ACTION_TYPES,
            pages,
            elements
          }
        }
      ]
    }
  ]
}
