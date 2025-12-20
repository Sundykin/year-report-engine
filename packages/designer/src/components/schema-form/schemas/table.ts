/**
 * 表格组件 Schema 配置
 */

import type { FormSchema } from '../types'

export const tableSchema: FormSchema[] = [
  {
    title: '📊 表格配置',
    fields: [
      {
        field: 'tableColumns',
        label: '列配置',
        type: 'code-editor',
        props: {
          height: '100px',
          placeholder: '[{ "key": "name", "title": "姓名" }, { "key": "age", "title": "年龄" }]'
        },
        valueGetter: (model: any) => JSON.stringify(model.tableColumns || [], null, 2),
        valueSetter: (value: string, model: any) => {
          try {
            model.tableColumns = JSON.parse(value)
          } catch (e) {
            // 忽略解析错误
          }
        }
      },
      {
        field: 'tableData',
        label: '表格数据',
        type: 'code-editor',
        props: {
          height: '120px',
          placeholder: '[{ "name": "张三", "age": 25 }]'
        },
        valueGetter: (model: any) => JSON.stringify(model.tableData || [], null, 2),
        valueSetter: (value: string, model: any) => {
          try {
            model.tableData = JSON.parse(value)
          } catch (e) {
            // 忽略解析错误
          }
        }
      },
    ]
  },
  {
    title: '🎨 表格样式',
    collapsible: true,
    fields: [
      {
        field: 'tableStriped',
        label: '斑马纹',
        type: 'checkbox',
        grid: 1
      },
      {
        field: 'tableBordered',
        label: '显示边框',
        type: 'checkbox',
        grid: 1
      },
      {
        field: 'tableHeaderBg',
        label: '表头背景',
        type: 'color',
        grid: 1
      },
      {
        field: 'tableHeaderColor',
        label: '表头文字',
        type: 'color',
        grid: 1
      },
    ]
  }
]
