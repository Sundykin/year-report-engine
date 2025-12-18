/**
 * 样式效果 Schema 配置
 * 适用于 text, richtext, image, video, shape, button 类型
 */

import type { FormSchema } from '../types'

// 解析阴影值
const parseShadow = (shadow: string | undefined, _isText: boolean) => {
  if (!shadow) return { x: 0, y: 0, blur: 0, spread: 0, color: '#000000' }
  const match = shadow.match(/(-?\d+)px\s+(-?\d+)px\s+(\d+)px\s*(\d+px)?\s*(#[0-9a-fA-F]{6}|rgba?\([^)]+\))?/)
  if (match) {
    return {
      x: parseInt(match[1]) || 0,
      y: parseInt(match[2]) || 0,
      blur: parseInt(match[3]) || 0,
      spread: parseInt(match[4]) || 0,
      color: match[5] || '#000000'
    }
  }
  return { x: 0, y: 0, blur: 0, spread: 0, color: '#000000' }
}

// 解析滤镜值
const parseFilter = (filter: string | undefined) => {
  if (!filter) return { blur: 0, brightness: 100, contrast: 100, saturate: 100, grayscale: 0 }
  return {
    blur: parseInt(filter.match(/blur\((\d+)px\)/)?.[1] || '0'),
    brightness: parseInt(filter.match(/brightness\((\d+)%\)/)?.[1] || '100'),
    contrast: parseInt(filter.match(/contrast\((\d+)%\)/)?.[1] || '100'),
    saturate: parseInt(filter.match(/saturate\((\d+)%\)/)?.[1] || '100'),
    grayscale: parseInt(filter.match(/grayscale\((\d+)%\)/)?.[1] || '0'),
  }
}

// 构建滤镜字符串
const buildFilter = (f: { blur: number; brightness: number; contrast: number; saturate: number; grayscale: number }) => {
  const parts: string[] = []
  if (f.blur > 0) parts.push(`blur(${f.blur}px)`)
  if (f.brightness !== 100) parts.push(`brightness(${f.brightness}%)`)
  if (f.contrast !== 100) parts.push(`contrast(${f.contrast}%)`)
  if (f.saturate !== 100) parts.push(`saturate(${f.saturate}%)`)
  if (f.grayscale > 0) parts.push(`grayscale(${f.grayscale}%)`)
  return parts.length > 0 ? parts.join(' ') : undefined
}

export const styleEffectsSchema: FormSchema[] = [
  // 描边
  {
    title: '描边',
    collapsible: true,
    defaultCollapsed: true,
    fields: [
      {
        field: 'style.borderWidth',
        label: '宽度',
        type: 'number',
        min: 0,
        grid: 1,
        valueGetter: (model: any) => parseInt(model.style?.borderWidth || '0'),
        valueSetter: (value: number, model: any) => {
          model.style.borderWidth = value + 'px'
          updateBorder(model)
        }
      },
      {
        field: 'style.borderStyle',
        label: '样式',
        type: 'select',
        grid: 1,
        options: [
          { label: '无', value: 'none' },
          { label: '实线', value: 'solid' },
          { label: '虚线', value: 'dashed' },
          { label: '点线', value: 'dotted' },
        ],
        onChange: (_: any, model: any) => updateBorder(model)
      },
      {
        field: 'style.borderColor',
        label: '颜色',
        type: 'color',
        grid: 1,
        onChange: (_: any, model: any) => updateBorder(model)
      },
    ]
  },
  // 阴影（通用）
  {
    title: '阴影',
    collapsible: true,
    defaultCollapsed: true,
    showWhen: (model: any) => !['text', 'richtext'].includes(model.type),
    fields: [
      {
        field: '_shadowX',
        label: 'X',
        type: 'number',
        grid: 1,
        valueGetter: (model: any) => parseShadow(model.style?.boxShadow, false).x,
        valueSetter: (value: number, model: any) => {
          const s = parseShadow(model.style?.boxShadow, false)
          s.x = value
          model.style.boxShadow = `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`
        }
      },
      {
        field: '_shadowY',
        label: 'Y',
        type: 'number',
        grid: 1,
        valueGetter: (model: any) => parseShadow(model.style?.boxShadow, false).y,
        valueSetter: (value: number, model: any) => {
          const s = parseShadow(model.style?.boxShadow, false)
          s.y = value
          model.style.boxShadow = `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`
        }
      },
      {
        field: '_shadowBlur',
        label: '模糊',
        type: 'number',
        min: 0,
        grid: 1,
        valueGetter: (model: any) => parseShadow(model.style?.boxShadow, false).blur,
        valueSetter: (value: number, model: any) => {
          const s = parseShadow(model.style?.boxShadow, false)
          s.blur = value
          model.style.boxShadow = `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`
        }
      },
      {
        field: '_shadowColor',
        label: '颜色',
        type: 'color',
        grid: 1,
        valueGetter: (model: any) => parseShadow(model.style?.boxShadow, false).color,
        valueSetter: (value: string, model: any) => {
          const s = parseShadow(model.style?.boxShadow, false)
          s.color = value
          model.style.boxShadow = `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`
        }
      },
      {
        field: '_shadowSpread',
        label: '扩展',
        type: 'number',
        valueGetter: (model: any) => parseShadow(model.style?.boxShadow, false).spread,
        valueSetter: (value: number, model: any) => {
          const s = parseShadow(model.style?.boxShadow, false)
          s.spread = value
          model.style.boxShadow = `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`
        }
      },
    ]
  },
  // 文字阴影
  {
    title: '文字阴影',
    collapsible: true,
    defaultCollapsed: true,
    showWhen: (model: any) => ['text', 'richtext'].includes(model.type),
    fields: [
      {
        field: '_textShadowX',
        label: 'X',
        type: 'number',
        grid: 1,
        valueGetter: (model: any) => parseShadow(model.style?.textShadow, true).x,
        valueSetter: (value: number, model: any) => {
          const s = parseShadow(model.style?.textShadow, true)
          s.x = value
          model.style.textShadow = `${s.x}px ${s.y}px ${s.blur}px ${s.color}`
        }
      },
      {
        field: '_textShadowY',
        label: 'Y',
        type: 'number',
        grid: 1,
        valueGetter: (model: any) => parseShadow(model.style?.textShadow, true).y,
        valueSetter: (value: number, model: any) => {
          const s = parseShadow(model.style?.textShadow, true)
          s.y = value
          model.style.textShadow = `${s.x}px ${s.y}px ${s.blur}px ${s.color}`
        }
      },
      {
        field: '_textShadowBlur',
        label: '模糊',
        type: 'number',
        min: 0,
        grid: 1,
        valueGetter: (model: any) => parseShadow(model.style?.textShadow, true).blur,
        valueSetter: (value: number, model: any) => {
          const s = parseShadow(model.style?.textShadow, true)
          s.blur = value
          model.style.textShadow = `${s.x}px ${s.y}px ${s.blur}px ${s.color}`
        }
      },
      {
        field: '_textShadowColor',
        label: '颜色',
        type: 'color',
        grid: 1,
        valueGetter: (model: any) => parseShadow(model.style?.textShadow, true).color,
        valueSetter: (value: string, model: any) => {
          const s = parseShadow(model.style?.textShadow, true)
          s.color = value
          model.style.textShadow = `${s.x}px ${s.y}px ${s.blur}px ${s.color}`
        }
      },
    ]
  },
  // 滤镜（图片/视频）
  {
    title: '滤镜',
    collapsible: true,
    defaultCollapsed: true,
    showWhen: (model: any) => ['image', 'video'].includes(model.type),
    fields: [
      {
        field: '_filterBlur',
        label: '模糊',
        type: 'range',
        min: 0,
        max: 20,
        props: { suffix: 'px' },
        valueGetter: (model: any) => parseFilter(model.style?.filter).blur,
        valueSetter: (value: number, model: any) => {
          const f = parseFilter(model.style?.filter)
          f.blur = value
          model.style.filter = buildFilter(f)
        }
      },
      {
        field: '_filterBrightness',
        label: '亮度',
        type: 'range',
        min: 0,
        max: 200,
        props: { suffix: '%' },
        valueGetter: (model: any) => parseFilter(model.style?.filter).brightness,
        valueSetter: (value: number, model: any) => {
          const f = parseFilter(model.style?.filter)
          f.brightness = value
          model.style.filter = buildFilter(f)
        }
      },
      {
        field: '_filterContrast',
        label: '对比度',
        type: 'range',
        min: 0,
        max: 200,
        props: { suffix: '%' },
        valueGetter: (model: any) => parseFilter(model.style?.filter).contrast,
        valueSetter: (value: number, model: any) => {
          const f = parseFilter(model.style?.filter)
          f.contrast = value
          model.style.filter = buildFilter(f)
        }
      },
      {
        field: '_filterSaturate',
        label: '饱和度',
        type: 'range',
        min: 0,
        max: 200,
        props: { suffix: '%' },
        valueGetter: (model: any) => parseFilter(model.style?.filter).saturate,
        valueSetter: (value: number, model: any) => {
          const f = parseFilter(model.style?.filter)
          f.saturate = value
          model.style.filter = buildFilter(f)
        }
      },
      {
        field: '_filterGrayscale',
        label: '灰度',
        type: 'range',
        min: 0,
        max: 100,
        props: { suffix: '%' },
        valueGetter: (model: any) => parseFilter(model.style?.filter).grayscale,
        valueSetter: (value: number, model: any) => {
          const f = parseFilter(model.style?.filter)
          f.grayscale = value
          model.style.filter = buildFilter(f)
        }
      },
    ]
  },
  // 翻转（图片/视频）
  {
    title: '翻转',
    collapsible: true,
    defaultCollapsed: true,
    showWhen: (model: any) => ['image', 'video'].includes(model.type),
    fields: [
      {
        field: '_flipX',
        label: '↔ 水平翻转',
        type: 'checkbox',
        valueGetter: (model: any) => model.style?.scaleX === -1,
        valueSetter: (value: boolean, model: any) => {
          model.style.scaleX = value ? -1 : undefined
        }
      },
      {
        field: '_flipY',
        label: '↕ 垂直翻转',
        type: 'checkbox',
        valueGetter: (model: any) => model.style?.scaleY === -1,
        valueSetter: (value: boolean, model: any) => {
          model.style.scaleY = value ? -1 : undefined
        }
      },
    ]
  },
  // 文字渐变
  {
    title: '渐变填充',
    collapsible: true,
    defaultCollapsed: true,
    showWhen: (model: any) => ['text', 'richtext'].includes(model.type),
    fields: [
      {
        field: '_hasGradient',
        label: '启用渐变',
        type: 'checkbox',
        valueGetter: (model: any) => !!model.style?.backgroundImage?.includes('linear-gradient'),
        valueSetter: (value: boolean, model: any) => {
          if (value) {
            model.style.backgroundImage = 'linear-gradient(to right, #ff0000, #0000ff)'
            model.style.backgroundClip = 'text'
            model.style.WebkitBackgroundClip = 'text'
            model.style.WebkitTextFillColor = 'transparent'
          } else {
            model.style.backgroundImage = undefined
            model.style.backgroundClip = undefined
            model.style.WebkitBackgroundClip = undefined
            model.style.WebkitTextFillColor = undefined
          }
        }
      },
      {
        field: '_textGradientStart',
        label: '起始色',
        type: 'color',
        grid: 1,
        showWhen: (model: any) => !!model.style?.backgroundImage?.includes('linear-gradient'),
        valueGetter: (model: any) => {
          const bg = model.style?.backgroundImage || ''
          const match = bg.match(/linear-gradient\([^,]+,\s*([^,]+),/)
          return match?.[1]?.trim() || '#ff0000'
        },
        valueSetter: (value: string, model: any) => {
          const bg = model.style?.backgroundImage || 'linear-gradient(to right, #ff0000, #0000ff)'
          const match = bg.match(/linear-gradient\(([^,]+),\s*[^,]+,\s*([^)]+)\)/)
          if (match) {
            model.style.backgroundImage = `linear-gradient(${match[1]}, ${value}, ${match[2]})`
          }
        }
      },
      {
        field: '_textGradientEnd',
        label: '结束色',
        type: 'color',
        grid: 1,
        showWhen: (model: any) => !!model.style?.backgroundImage?.includes('linear-gradient'),
        valueGetter: (model: any) => {
          const bg = model.style?.backgroundImage || ''
          const match = bg.match(/linear-gradient\([^,]+,\s*[^,]+,\s*([^)]+)\)/)
          return match?.[1]?.trim() || '#0000ff'
        },
        valueSetter: (value: string, model: any) => {
          const bg = model.style?.backgroundImage || 'linear-gradient(to right, #ff0000, #0000ff)'
          const match = bg.match(/linear-gradient\(([^,]+),\s*([^,]+),\s*[^)]+\)/)
          if (match) {
            model.style.backgroundImage = `linear-gradient(${match[1]}, ${match[2]}, ${value})`
          }
        }
      },
      {
        field: '_textGradientDirection',
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
        ],
        valueGetter: (model: any) => {
          const bg = model.style?.backgroundImage || ''
          const match = bg.match(/linear-gradient\(([^,]+),/)
          return match?.[1]?.trim() || 'to right'
        },
        valueSetter: (value: string, model: any) => {
          const bg = model.style?.backgroundImage || 'linear-gradient(to right, #ff0000, #0000ff)'
          const match = bg.match(/linear-gradient\([^,]+,\s*([^,]+),\s*([^)]+)\)/)
          if (match) {
            model.style.backgroundImage = `linear-gradient(${value}, ${match[1]}, ${match[2]})`
          }
        }
      },
    ]
  },
]

// 辅助函数：更新 border 组合属性
function updateBorder(model: any) {
  const w = model.style?.borderWidth || '0px'
  const s = model.style?.borderStyle || 'solid'
  const c = model.style?.borderColor || '#000'
  if (s !== 'none' && parseInt(w) > 0) {
    model.style.border = `${w} ${s} ${c}`
  } else {
    model.style.border = undefined
  }
}
