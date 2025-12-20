/**
 * 条件渲染 Schema 配置
 */

import type { FormSchema } from '../types'
import { CONDITION_OPERATORS } from '@year-report/core'

/**
 * 创建条件渲染 Schema
 * @param dataSources 数据源列表
 */
export function createConditionSchema(dataSources: { id: string; name: string }[]): FormSchema[] {
  if (dataSources.length === 0) {
    return []
  }

  return [
    {
      title: '👁️ 显示条件',
      collapsible: true,
      defaultCollapsed: true,
      fields: [
        {
          field: 'showCondition.enabled',
          label: '启用条件渲染',
          type: 'checkbox',
          grid: 2
        },
        {
          field: 'showCondition.logic',
          label: '条件逻辑',
          type: 'select',
          options: [
            { label: '全部满足 (AND)', value: 'and' },
            { label: '任一满足 (OR)', value: 'or' }
          ],
          grid: 2,
          showWhen: (model: any) => model.showCondition?.enabled
        },
        {
          field: 'showCondition.rules',
          label: '条件规则',
          type: 'condition-rules',
          showWhen: (model: any) => model.showCondition?.enabled,
          props: {
            dataSources,
            operators: CONDITION_OPERATORS
          }
        }
      ]
    }
  ]
}
