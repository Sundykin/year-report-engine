/**
 * 循环渲染工具
 */
import type { H5Element } from './types'
import { getNestedValue } from './dataBinding'

export interface LoopItem {
  data: any           // 当前项数据
  index: number       // 索引
  key: string         // 唯一标识
  element: H5Element  // 克隆的元素（位置已调整）
}

export interface LoopResult {
  items: LoopItem[]
  isEmpty: boolean
  totalWidth: number   // 总占用宽度
  totalHeight: number  // 总占用高度
}

/**
 * 计算循环渲染结果
 */
export function evaluateLoop(
  element: H5Element,
  dataCache: Map<string, any>
): LoopResult | null {
  const config = element.loopConfig
  if (!config?.enabled) return null

  // 获取数据源数据
  const sourceData = dataCache.get(config.sourceId)
  if (!sourceData) {
    return { items: [], isEmpty: true, totalWidth: 0, totalHeight: 0 }
  }

  // 获取数组数据
  let arrayData = config.dataPath
    ? getNestedValue(sourceData, config.dataPath)
    : sourceData

  if (!Array.isArray(arrayData)) {
    return { items: [], isEmpty: true, totalWidth: 0, totalHeight: 0 }
  }

  // 限制最大数量
  if (config.maxCount && config.maxCount > 0) {
    arrayData = arrayData.slice(0, config.maxCount)
  }

  if (arrayData.length === 0) {
    return { items: [], isEmpty: true, totalWidth: 0, totalHeight: 0 }
  }

  const items: LoopItem[] = []
  const { width, height } = element
  const gap = config.gap || 0
  const columns = config.columns || 1

  arrayData.forEach((data: any, index: number) => {
    // 计算位置偏移
    let offsetX = 0
    let offsetY = 0

    switch (config.direction) {
      case 'horizontal':
        offsetX = index * (width + gap)
        break
      case 'vertical':
        offsetY = index * (height + gap)
        break
      case 'grid':
        const col = index % columns
        const row = Math.floor(index / columns)
        offsetX = col * (width + gap)
        offsetY = row * (height + gap)
        break
    }

    // 生成唯一 key
    const key = config.itemKey && data[config.itemKey]
      ? String(data[config.itemKey])
      : `${element.id}-loop-${index}`

    // 克隆元素并调整位置
    const clonedElement: H5Element = {
      ...element,
      id: `${element.id}-loop-${index}`,
      x: element.x + offsetX,
      y: element.y + offsetY,
      // 移除循环配置避免递归
      loopConfig: undefined
    }

    items.push({ data, index, key, element: clonedElement })
  })

  // 计算总占用尺寸
  let totalWidth = width
  let totalHeight = height

  switch (config.direction) {
    case 'horizontal':
      totalWidth = arrayData.length * width + (arrayData.length - 1) * gap
      break
    case 'vertical':
      totalHeight = arrayData.length * height + (arrayData.length - 1) * gap
      break
    case 'grid':
      const rows = Math.ceil(arrayData.length / columns)
      totalWidth = columns * width + (columns - 1) * gap
      totalHeight = rows * height + (rows - 1) * gap
      break
  }

  return { items, isEmpty: false, totalWidth, totalHeight }
}

/**
 * 替换内容中的循环变量
 * 支持 {{$item.xxx}} 和 {{$index}} 语法
 */
export function replaceLoopVariables(
  content: string,
  item: any,
  index: number
): string {
  if (!content) return content

  // 替换 $index
  let result = content.replace(/\{\{\s*\$index\s*\}\}/g, String(index))

  // 替换 $item.xxx
  result = result.replace(/\{\{\s*\$item\.([^}]+)\s*\}\}/g, (_, path) => {
    const value = getNestedValue(item, path.trim())
    return value !== undefined ? String(value) : ''
  })

  // 替换 $item（整个对象）
  result = result.replace(/\{\{\s*\$item\s*\}\}/g, () => {
    return typeof item === 'object' ? JSON.stringify(item) : String(item)
  })

  return result
}
