/**
 * 列表组件 Schema 配置
 */

import type { FormSchema } from '../types'

export const listSchema: FormSchema[] = [
  {
    title: '📋 列表',
    fields: [
      {
        field: 'listType',
        label: '列表类型',
        type: 'select',
        options: [
          { label: '无序列表', value: 'unordered' },
          { label: '有序列表', value: 'ordered' },
          { label: '清单', value: 'checklist' },
        ]
      },
      {
        field: 'listIconColor',
        label: '图标颜色',
        type: 'color',
        showWhen: { field: 'listType', condition: 'eq', value: 'checklist' }
      },
      {
        field: 'listItems',
        label: '列表项 (每行一项)',
        type: 'textarea',
        placeholder: '项目1\n项目2\n项目3',
        props: { rows: 5 },
        // 自定义 getter/setter 处理数组与字符串转换
        valueGetter: (model: any) => (model.listItems || []).join('\n'),
        valueSetter: (value: string, model: any) => {
          model.listItems = value.split('\n').filter((s: string) => s.trim())
        }
      },
    ]
  }
]
