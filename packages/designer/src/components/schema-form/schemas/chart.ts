/**
 * 图表组件 Schema 配置
 */

import type { FormSchema } from '../types'

export const chartSchema: FormSchema[] = [
  {
    title: '📊 图表',
    fields: [
      {
        field: 'chartType',
        label: '图表类型',
        type: 'select',
        options: [
          { label: '柱状图', value: 'bar' },
          { label: '折线图', value: 'line' },
          { label: '饼图', value: 'pie' },
        ]
      },
    ]
  }
]

/**
 * 创建带数据源的图表 Schema
 * @param dataSources 数据源列表
 */
export function createChartSchema(dataSources: { id: string; name: string }[]): FormSchema[] {
  return [
    {
      title: '📊 图表',
      fields: [
        {
          field: 'chartType',
          label: '图表类型',
          type: 'select',
          options: [
            { label: '柱状图', value: 'bar' },
            { label: '折线图', value: 'line' },
            { label: '饼图', value: 'pie' },
          ]
        },
        {
          field: 'dataBinding.sourceIds',
          label: '数据源',
          type: 'multi-select',
          options: dataSources.map(ds => ({ label: ds.name, value: ds.id })),
          props: { size: 4 }
        },
        {
          field: 'dataBinding.transform',
          label: '转换函数',
          type: 'code-editor',
          showWhen: (model: any) => model.dataBinding?.sourceIds?.length > 0,
          props: { height: '100px' }
        },
      ]
    }
  ]
}
