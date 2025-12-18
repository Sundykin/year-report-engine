/**
 * 形状组件 Schema 配置
 */

import type { FormSchema } from '../types'

export const shapeSchema: FormSchema[] = [
  {
    title: '🔷 形状',
    fields: [
      {
        field: 'shapeType',
        label: '形状类型',
        type: 'select',
        options: [
          { label: '基础形状', value: '', disabled: true },
          { label: '矩形', value: 'rectangle' },
          { label: '圆形', value: 'circle' },
          { label: '三角形', value: 'triangle' },
          { label: '菱形', value: 'diamond' },
          { label: '五边形', value: 'pentagon' },
          { label: '六边形', value: 'hexagon' },
          { label: '八边形', value: 'octagon' },
          { label: '五角星', value: 'star' },
          { label: '爱心', value: 'heart' },
          { label: '十字', value: 'cross' },
          { label: '箭头', value: '', disabled: true },
          { label: '右箭头', value: 'arrow' },
          { label: '左箭头', value: 'arrowLeft' },
          { label: '上箭头', value: 'arrowUp' },
          { label: '下箭头', value: 'arrowDown' },
          { label: '对话框', value: '', disabled: true },
          { label: '对话框(下)', value: 'bubble' },
          { label: '对话框(左)', value: 'bubbleLeft' },
          { label: '标注', value: '', disabled: true },
          { label: '徽章', value: 'badge' },
          { label: '丝带', value: 'ribbon' },
          { label: '平行四边形', value: 'parallelogram' },
        ]
      },
      {
        field: '_fillType',
        label: '填充类型',
        type: 'button-group',
        options: [
          { label: '纯色', value: 'solid' },
          { label: '渐变', value: 'gradient' },
        ],
        // 虚拟字段，根据 backgroundImage 判断
        valueGetter: (model: any) => {
          return model.style?.backgroundImage?.includes('linear-gradient') ? 'gradient' : 'solid'
        },
        valueSetter: (value: string, model: any) => {
          if (value === 'solid') {
            model.style.backgroundImage = undefined
            if (!model.style.backgroundColor) {
              model.style.backgroundColor = '#3b82f6'
            }
          } else {
            // 设置默认渐变
            model.style.backgroundImage = 'linear-gradient(to right, #3b82f6, #8b5cf6)'
            model.style.backgroundColor = undefined
          }
        }
      },
      {
        field: 'style.backgroundColor',
        label: '背景颜色',
        type: 'color',
        showWhen: (model: any) => !model.style?.backgroundImage?.includes('linear-gradient')
      },
      {
        field: '_gradientStart',
        label: '起始色',
        type: 'color',
        grid: 1,
        showWhen: (model: any) => !!model.style?.backgroundImage?.includes('linear-gradient'),
        valueGetter: (model: any) => {
          const bg = model.style?.backgroundImage || ''
          const match = bg.match(/linear-gradient\([^,]+,\s*([^,]+),/)
          return match?.[1]?.trim() || '#3b82f6'
        },
        valueSetter: (value: string, model: any) => {
          const bg = model.style?.backgroundImage || 'linear-gradient(to right, #3b82f6, #8b5cf6)'
          const match = bg.match(/linear-gradient\(([^,]+),\s*[^,]+,\s*([^)]+)\)/)
          if (match) {
            model.style.backgroundImage = `linear-gradient(${match[1]}, ${value}, ${match[2]})`
          }
        }
      },
      {
        field: '_gradientEnd',
        label: '结束色',
        type: 'color',
        grid: 1,
        showWhen: (model: any) => !!model.style?.backgroundImage?.includes('linear-gradient'),
        valueGetter: (model: any) => {
          const bg = model.style?.backgroundImage || ''
          const match = bg.match(/linear-gradient\([^,]+,\s*[^,]+,\s*([^)]+)\)/)
          return match?.[1]?.trim() || '#8b5cf6'
        },
        valueSetter: (value: string, model: any) => {
          const bg = model.style?.backgroundImage || 'linear-gradient(to right, #3b82f6, #8b5cf6)'
          const match = bg.match(/linear-gradient\(([^,]+),\s*([^,]+),\s*[^)]+\)/)
          if (match) {
            model.style.backgroundImage = `linear-gradient(${match[1]}, ${match[2]}, ${value})`
          }
        }
      },
      {
        field: '_gradientDirection',
        label: '方向',
        type: 'select',
        showWhen: (model: any) => !!model.style?.backgroundImage?.includes('linear-gradient'),
        options: [
          { label: '从左到右', value: 'to right' },
          { label: '从右到左', value: 'to left' },
          { label: '从上到下', value: 'to bottom' },
          { label: '从下到上', value: 'to top' },
          { label: '左上到右下', value: 'to bottom right' },
          { label: '右上到左下', value: 'to bottom left' },
          { label: '对角线', value: '135deg' },
        ],
        valueGetter: (model: any) => {
          const bg = model.style?.backgroundImage || ''
          const match = bg.match(/linear-gradient\(([^,]+),/)
          return match?.[1]?.trim() || 'to right'
        },
        valueSetter: (value: string, model: any) => {
          const bg = model.style?.backgroundImage || 'linear-gradient(to right, #3b82f6, #8b5cf6)'
          const match = bg.match(/linear-gradient\([^,]+,\s*([^,]+),\s*([^)]+)\)/)
          if (match) {
            model.style.backgroundImage = `linear-gradient(${value}, ${match[1]}, ${match[2]})`
          }
        }
      },
    ]
  }
]
