import { computed, type Ref, type ComputedRef } from 'vue'
import type { ProjectData, H5Element } from '@year-report/core'

// 分组边界信息
export interface GroupBounds {
  groupId: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  elements: H5Element[]
}

// 计算分组边界（考虑元素旋转）
function calcRotatedBounds(el: H5Element): { minX: number; minY: number; maxX: number; maxY: number } {
  const cx = el.x + el.width / 2
  const cy = el.y + el.height / 2
  const rotation = (el.rotation || 0) * Math.PI / 180

  // 四个角点相对中心的位置
  const corners = [
    { x: -el.width / 2, y: -el.height / 2 },
    { x: el.width / 2, y: -el.height / 2 },
    { x: el.width / 2, y: el.height / 2 },
    { x: -el.width / 2, y: el.height / 2 }
  ]

  // 旋转后的角点
  const rotated = corners.map(c => ({
    x: cx + c.x * Math.cos(rotation) - c.y * Math.sin(rotation),
    y: cy + c.x * Math.sin(rotation) + c.y * Math.cos(rotation)
  }))

  return {
    minX: Math.min(...rotated.map(p => p.x)),
    minY: Math.min(...rotated.map(p => p.y)),
    maxX: Math.max(...rotated.map(p => p.x)),
    maxY: Math.max(...rotated.map(p => p.y))
  }
}

export function useGroupOperations(
  project: ComputedRef<ProjectData> | Ref<ProjectData>,
  activePageId: Ref<string>,
  selectedElementId: Ref<string | null>,
  updateElement: (id: string, updates: Partial<H5Element>) => void
) {
  const activePage = computed(() => project.value.pages.find(p => p.id === activePageId.value)!)
  const selectedElement = computed(() => activePage.value.elements.find(e => e.id === selectedElementId.value))

  // 计算所有分组的边界
  const groupBounds = computed<GroupBounds[]>(() => {
    const groups = new Map<string, H5Element[]>()

    activePage.value.elements.forEach(el => {
      if (el.groupId) {
        if (!groups.has(el.groupId)) {
          groups.set(el.groupId, [])
        }
        groups.get(el.groupId)!.push(el)
      }
    })

    const bounds: GroupBounds[] = []
    groups.forEach((elements, groupId) => {
      if (elements.length < 2) return // 分组至少需要2个元素

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

      elements.forEach(el => {
        const elBounds = calcRotatedBounds(el)
        minX = Math.min(minX, elBounds.minX)
        minY = Math.min(minY, elBounds.minY)
        maxX = Math.max(maxX, elBounds.maxX)
        maxY = Math.max(maxY, elBounds.maxY)
      })

      bounds.push({
        groupId,
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        rotation: 0, // 分组旋转角度由外部管理
        elements
      })
    })

    return bounds
  })

  // 创建分组
  const createGroup = (elementIds: string[]) => {
    if (elementIds.length < 2) return null

    const groupId = `group_${Date.now()}`
    const idSet = new Set(elementIds)

    // 一次性更新所有元素的 groupId
    const currentPage = activePage.value
    const updatedElements = currentPage.elements.map(el =>
      idSet.has(el.id) ? { ...el, groupId } : el
    )

    // 直接修改 project
    project.value = {
      ...project.value,
      pages: project.value.pages.map(p =>
        p.id === activePageId.value ? { ...p, elements: updatedElements } : p
      )
    }

    console.log('[createGroup] updated elements:', updatedElements.filter(e => idSet.has(e.id)).map(e => ({ id: e.id, groupId: e.groupId })))
    return groupId
  }

  // 解除分组
  const ungroup = (groupId: string) => {
    const currentPage = activePage.value
    const updatedElements = currentPage.elements.map(el =>
      el.groupId === groupId ? { ...el, groupId: undefined } : el
    )

    project.value = {
      ...project.value,
      pages: project.value.pages.map(p =>
        p.id === activePageId.value ? { ...p, elements: updatedElements } : p
      )
    }
  }

  // 解除当前选中元素的分组
  const ungroupSelected = () => {
    if (selectedElement.value?.groupId) {
      ungroup(selectedElement.value.groupId)
    }
  }

  // 获取元素所在分组的所有元素
  const getGroupElements = (elementId: string): H5Element[] => {
    const el = activePage.value.elements.find(e => e.id === elementId)
    if (!el?.groupId) return [el!].filter(Boolean)

    return activePage.value.elements.filter(e => e.groupId === el.groupId)
  }

  // 移动分组（同时移动所有组内元素）
  const moveGroup = (groupId: string, deltaX: number, deltaY: number) => {
    activePage.value.elements.forEach(el => {
      if (el.groupId === groupId) {
        updateElement(el.id, {
          x: el.x + deltaX,
          y: el.y + deltaY
        })
      }
    })
  }

  // 缩放分组（以锚点为中心缩放所有组内元素，支持旋转状态）
  const resizeGroup = (groupId: string, scaleX: number, scaleY: number, anchorX: number, anchorY: number, groupRotation = 0) => {
    const rad = groupRotation * Math.PI / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)

    activePage.value.elements.forEach(el => {
      if (el.groupId === groupId) {
        // 计算元素中心相对于锚点的位置
        const cx = el.x + el.width / 2
        const cy = el.y + el.height / 2
        const relX = cx - anchorX
        const relY = cy - anchorY

        // 转换到本地坐标系
        const localRelX = relX * cos + relY * sin
        const localRelY = -relX * sin + relY * cos

        // 在本地坐标系中缩放
        const scaledLocalX = localRelX * scaleX
        const scaledLocalY = localRelY * scaleY

        // 转换回世界坐标系
        const newRelX = scaledLocalX * cos - scaledLocalY * sin
        const newRelY = scaledLocalX * sin + scaledLocalY * cos

        const newCx = anchorX + newRelX
        const newCy = anchorY + newRelY
        const newWidth = el.width * scaleX
        const newHeight = el.height * scaleY

        updateElement(el.id, {
          x: newCx - newWidth / 2,
          y: newCy - newHeight / 2,
          width: newWidth,
          height: newHeight
        })
      }
    })
  }

  // 旋转分组（以分组中心为轴旋转所有组内元素）
  const rotateGroup = (groupId: string, angle: number) => {
    const group = groupBounds.value.find(g => g.groupId === groupId)
    if (!group) return

    const centerX = group.x + group.width / 2
    const centerY = group.y + group.height / 2
    const rad = angle * Math.PI / 180

    activePage.value.elements.forEach(el => {
      if (el.groupId === groupId) {
        // 计算元素中心相对于分组中心的位置
        const cx = el.x + el.width / 2
        const cy = el.y + el.height / 2
        const relX = cx - centerX
        const relY = cy - centerY

        // 旋转后的新位置
        const newCx = centerX + relX * Math.cos(rad) - relY * Math.sin(rad)
        const newCy = centerY + relX * Math.sin(rad) + relY * Math.cos(rad)

        updateElement(el.id, {
          x: newCx - el.width / 2,
          y: newCy - el.height / 2,
          rotation: (el.rotation || 0) + angle
        })
      }
    })
  }

  // 检查元素是否在分组中
  const isElementInGroup = (elementId: string): boolean => {
    const el = activePage.value.elements.find(e => e.id === elementId)
    return !!el?.groupId
  }

  // 获取元素的分组ID
  const getElementGroupId = (elementId: string): string | undefined => {
    const el = activePage.value.elements.find(e => e.id === elementId)
    return el?.groupId
  }

  return {
    groupBounds,
    createGroup,
    ungroup,
    ungroupSelected,
    getGroupElements,
    moveGroup,
    resizeGroup,
    rotateGroup,
    isElementInGroup,
    getElementGroupId
  }
}
