/**
 * 文本组件 Schema 配置
 * 注意：此组件需要外部传入 dataSources 和事件处理
 */

import type { FormSchema } from '../types'

// 文本增强 Schema（描边、阴影、渐变）
const textEffectsSchema: FormSchema[] = [
  {
    title: '🎨 文字效果',
    collapsible: true,
    defaultCollapsed: true,
    fields: [
      // 文字描边
      {
        field: 'textStroke.enabled',
        label: '文字描边',
        type: 'checkbox',
        grid: 2
      },
      {
        field: 'textStroke.width',
        label: '宽度',
        type: 'number',
        min: 1,
        max: 10,
        step: 1,
        grid: 1,
        showWhen: (model: any) => model.textStroke?.enabled
      },
      {
        field: 'textStroke.color',
        label: '颜色',
        type: 'color',
        grid: 1,
        showWhen: (model: any) => model.textStroke?.enabled
      },
      // 文字阴影
      {
        field: 'textShadow.enabled',
        label: '文字阴影',
        type: 'checkbox',
        grid: 2
      },
      {
        field: 'textShadow.offsetX',
        label: 'X偏移',
        type: 'number',
        min: -20,
        max: 20,
        step: 1,
        grid: 1,
        showWhen: (model: any) => model.textShadow?.enabled
      },
      {
        field: 'textShadow.offsetY',
        label: 'Y偏移',
        type: 'number',
        min: -20,
        max: 20,
        step: 1,
        grid: 1,
        showWhen: (model: any) => model.textShadow?.enabled
      },
      {
        field: 'textShadow.blur',
        label: '模糊',
        type: 'number',
        min: 0,
        max: 30,
        step: 1,
        grid: 1,
        showWhen: (model: any) => model.textShadow?.enabled
      },
      {
        field: 'textShadow.color',
        label: '颜色',
        type: 'color',
        grid: 1,
        showWhen: (model: any) => model.textShadow?.enabled
      },
      // 渐变填充
      {
        field: 'textGradient.enabled',
        label: '渐变填充',
        type: 'checkbox',
        grid: 2
      },
      {
        field: 'textGradient.type',
        label: '类型',
        type: 'select',
        options: [
          { label: '线性', value: 'linear' },
          { label: '径向', value: 'radial' }
        ],
        grid: 2,
        showWhen: (model: any) => model.textGradient?.enabled
      },
      {
        field: 'textGradient.direction',
        label: '方向',
        type: 'select',
        options: [
          { label: '→ 向右', value: 'to right' },
          { label: '← 向左', value: 'to left' },
          { label: '↓ 向下', value: 'to bottom' },
          { label: '↑ 向上', value: 'to top' },
          { label: '↘ 右下', value: 'to bottom right' },
          { label: '↙ 左下', value: 'to bottom left' },
          { label: '↗ 右上', value: 'to top right' },
          { label: '↖ 左上', value: 'to top left' },
        ],
        grid: 2,
        showWhen: (model: any) => model.textGradient?.enabled && model.textGradient?.type === 'linear'
      },
      {
        field: 'textGradient.colors[0]',
        label: '起始色',
        type: 'color',
        grid: 1,
        showWhen: (model: any) => model.textGradient?.enabled
      },
      {
        field: 'textGradient.colors[1]',
        label: '结束色',
        type: 'color',
        grid: 1,
        showWhen: (model: any) => model.textGradient?.enabled
      },
    ]
  }
]

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
        grid: 1,
        showWhen: (model: any) => !model.textGradient?.enabled
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
  },
  ...textEffectsSchema
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
          grid: 1,
          showWhen: (model: any) => !model.textGradient?.enabled
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
    },
    ...textEffectsSchema
  ]
}
