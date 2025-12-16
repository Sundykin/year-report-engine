import type { H5Element } from '@year-report/core'

/**
 * 计算分组边界
 */
export interface GroupBounds {
  groupId: string
  x: number
  y: number
  width: number
  height: number
  elements: H5Element[]
}

export function calcGroupBounds(elements: H5Element[]): GroupBounds[] {
  const groups = new Map<string, H5Element[]>()
  elements.forEach(el => {
    if (el.groupId) {
      if (!groups.has(el.groupId)) groups.set(el.groupId, [])
      groups.get(el.groupId)!.push(el)
    }
  })

  const bounds: GroupBounds[] = []
  groups.forEach((elements, groupId) => {
    if (elements.length < 2) return
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    elements.forEach(el => {
      minX = Math.min(minX, el.x)
      minY = Math.min(minY, el.y)
      maxX = Math.max(maxX, el.x + el.width)
      maxY = Math.max(maxY, el.y + el.height)
    })
    bounds.push({ groupId, x: minX, y: minY, width: maxX - minX, height: maxY - minY, elements })
  })
  return bounds
}

/**
 * 获取未分组的元素
 */
export function getUngroupedElements(elements: H5Element[]): H5Element[] {
  return elements.filter(el => !el.groupId)
}

/**
 * 解析数据绑定表达式
 */
export function resolveDataBinding(
  content: string,
  data: Record<string, any>
): string {
  if (!content || !data) return content

  return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match
  })
}