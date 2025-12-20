/**
 * 循环渲染 Schema
 */
import type { FormSchema, FormGroupSchema, FormFieldSchema } from '../types'
import type { DataSource } from '@year-report/core'

export function createLoopSchema(dataSources: DataSource[]): FormSchema[] {
  // 没有数据源时不显示循环配置
  if (!dataSources.length) return []

  const sourceOptions = dataSources.map(ds => ({
    label: ds.name,
    value: ds.id
  }))

  const fields: FormFieldSchema[] = [
    {
      type: 'checkbox',
      field: 'loopConfig.enabled',
      label: '启用循环'
    },
    {
      type: 'select',
      field: 'loopConfig.sourceId',
      label: '数据源',
      options: sourceOptions,
      showWhen: { field: 'loopConfig.enabled', condition: 'truthy' }
    },
    {
      type: 'text',
      field: 'loopConfig.dataPath',
      label: '数据路径',
      placeholder: '如 list 或 data.items',
      showWhen: { field: 'loopConfig.enabled', condition: 'truthy' }
    },
    {
      type: 'button-group',
      field: 'loopConfig.direction',
      label: '排列方向',
      options: [
        { label: '水平', value: 'horizontal' },
        { label: '垂直', value: 'vertical' },
        { label: '网格', value: 'grid' }
      ],
      showWhen: { field: 'loopConfig.enabled', condition: 'truthy' }
    },
    {
      type: 'number',
      field: 'loopConfig.gap',
      label: '间距',
      min: 0,
      max: 100,
      step: 1,
      showWhen: { field: 'loopConfig.enabled', condition: 'truthy' }
    },
    {
      type: 'number',
      field: 'loopConfig.columns',
      label: '列数',
      min: 1,
      max: 10,
      step: 1,
      showWhen: { field: 'loopConfig.direction', condition: 'eq', value: 'grid' }
    },
    {
      type: 'number',
      field: 'loopConfig.maxCount',
      label: '最大数量',
      min: 0,
      max: 100,
      step: 1,
      placeholder: '0 表示不限制',
      showWhen: { field: 'loopConfig.enabled', condition: 'truthy' }
    },
    {
      type: 'text',
      field: 'loopConfig.emptyText',
      label: '空数据提示',
      placeholder: '暂无数据',
      showWhen: { field: 'loopConfig.enabled', condition: 'truthy' }
    },
    {
      type: 'text',
      field: 'loopConfig.itemKey',
      label: '唯一键字段',
      placeholder: '如 id',
      showWhen: { field: 'loopConfig.enabled', condition: 'truthy' }
    }
  ]

  const group: FormGroupSchema = {
    title: '🔄 循环渲染',
    collapsible: true,
    defaultCollapsed: true,
    fields
  }

  return [group]
}
