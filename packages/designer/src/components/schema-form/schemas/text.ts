/**
 * 文本组件 Schema 配置
 * 注意：此组件需要外部传入 dataSources 和事件处理
 */

import type { FormSchema } from '../types'

export const textSchema: FormSchema[] = [
  {
    title: '✏️ 文本',
    fields: [
      {
        field: '_renderMode',
        label: '渲染模式',
        type: 'button-group',
        options: [
          { label: '文本内容', value: 'content' },
          { label: '渲染函数', value: 'function' },
        ],
        valueGetter: (model: any) => model.renderFunction ? 'function' : 'content',
        valueSetter: (value: string, model: any) => {
          if (value === 'content') {
            delete model.renderFunction
          } else if (!model.renderFunction) {
            model.renderFunction = '(data) => `${data}`'
          }
        }
      },
      {
        field: 'content',
        label: '内容',
        type: 'textarea',
        showWhen: (model: any) => !model.renderFunction
      },
      // 数据源和渲染函数字段需要在使用时动态注入
      // 因为它们依赖外部的 dataSources 数据
      {
        field: 'style.color',
        label: '颜色',
        type: 'color',
        grid: 1
      },
      {
        field: 'style.fontSize',
        label: '字号',
        type: 'number',
        grid: 1,
        valueGetter: (model: any) => parseInt(model.style?.fontSize || '16'),
        valueSetter: (value: number, model: any) => {
          model.style.fontSize = value + 'px'
        }
      },
    ]
  }
]

/**
 * 创建带数据源的文本 Schema
 * @param dataSources 数据源列表
 */
export function createTextSchema(dataSources: { id: string; name: string }[]): FormSchema[] {
  return [
    {
      title: '✏️ 文本',
      fields: [
        {
          field: '_renderMode',
          label: '渲染模式',
          type: 'button-group',
          options: [
            { label: '文本内容', value: 'content' },
            { label: '渲染函数', value: 'function' },
          ],
          valueGetter: (model: any) => model.renderFunction ? 'function' : 'content',
          valueSetter: (value: string, model: any) => {
            if (value === 'content') {
              delete model.renderFunction
            } else if (!model.renderFunction) {
              model.renderFunction = '(data) => `${data}`'
            }
          }
        },
        {
          field: 'content',
          label: '内容',
          type: 'textarea',
          showWhen: (model: any) => !model.renderFunction
        },
        {
          field: 'dataBinding.sourceIds',
          label: '数据源',
          type: 'multi-select',
          options: dataSources.map(ds => ({ label: ds.name, value: ds.id })),
          showWhen: (model: any) => !!model.renderFunction,
          props: { size: 4 }
        },
        {
          field: 'renderFunction',
          label: '渲染函数',
          type: 'code-editor',
          showWhen: (model: any) => !!model.renderFunction,
          props: { height: '100px' }
        },
        {
          field: 'style.color',
          label: '颜色',
          type: 'color',
          grid: 1
        },
        {
          field: 'style.fontSize',
          label: '字号',
          type: 'number',
          grid: 1,
          valueGetter: (model: any) => parseInt(model.style?.fontSize || '16'),
          valueSetter: (value: number, model: any) => {
            model.style.fontSize = value + 'px'
          }
        },
      ]
    }
  ]
}
