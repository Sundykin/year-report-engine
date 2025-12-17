import { type Ref, computed } from 'vue'
import type { ProjectData, H5Element } from '@year-report/core'

export type AlignType = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
export type DistributeType = 'horizontal' | 'vertical'

export function useAlignment(
  project: Ref<ProjectData>,
  activePageId: Ref<string>,
  selectedElementIds: Ref<string[]>,
  canvasWidth: number,
  canvasHeight: number,
  selectedGroupId?: Ref<string | null>
) {
  const activePage = computed(() => project.value.pages.find(p => p.id === activePageId.value)!)

  // 获取选中的元素（包括分组内元素）
  const selectedElements = computed(() => {
    if (selectedGroupId?.value) {
      return activePage.value.elements.filter(e => e.groupId === selectedGroupId.value)
    }
    return activePage.value.elements.filter(e => selectedElementIds.value.includes(e.id))
  })

  const updateElements = (updates: { id: string; changes: Partial<H5Element> }[]) => {
    project.value = {
      ...project.value,
      pages: project.value.pages.map(p =>
        p.id === activePageId.value
          ? {
              ...p,
              elements: p.elements.map(e => {
                const update = updates.find(u => u.id === e.id)
                return update ? { ...e, ...update.changes } : e
              })
            }
          : p
      )
    }
  }

  // 对齐到画布（单个元素或分组整体）
  const alignToCanvas = (type: AlignType) => {
    const elements = selectedElements.value
    if (elements.length === 0) return

    // 计算整体边界
    const bounds = {
      left: Math.min(...elements.map(e => e.x)),
      right: Math.max(...elements.map(e => e.x + e.width)),
      top: Math.min(...elements.map(e => e.y)),
      bottom: Math.max(...elements.map(e => e.y + e.height))
    }
    const groupWidth = bounds.right - bounds.left
    const groupHeight = bounds.bottom - bounds.top

    // 计算目标位置
    let targetX = bounds.left, targetY = bounds.top
    switch (type) {
      case 'left': targetX = 0; break
      case 'center': targetX = (canvasWidth - groupWidth) / 2; break
      case 'right': targetX = canvasWidth - groupWidth; break
      case 'top': targetY = 0; break
      case 'middle': targetY = (canvasHeight - groupHeight) / 2; break
      case 'bottom': targetY = canvasHeight - groupHeight; break
    }

    // 计算偏移量
    const deltaX = ['left', 'center', 'right'].includes(type) ? targetX - bounds.left : 0
    const deltaY = ['top', 'middle', 'bottom'].includes(type) ? targetY - bounds.top : 0

    const updates = elements.map(el => ({
      id: el.id,
      changes: { x: el.x + deltaX, y: el.y + deltaY }
    }))

    updateElements(updates)
  }

  // 多选元素相互对齐
  const alignElements = (type: AlignType) => {
    const elements = selectedElements.value
    // 分组选中时，整体对齐到画布
    if (selectedGroupId?.value || elements.length < 2) {
      alignToCanvas(type)
      return
    }

    // 计算边界
    const bounds = {
      left: Math.min(...elements.map(e => e.x)),
      right: Math.max(...elements.map(e => e.x + e.width)),
      top: Math.min(...elements.map(e => e.y)),
      bottom: Math.max(...elements.map(e => e.y + e.height))
    }
    const centerX = (bounds.left + bounds.right) / 2
    const centerY = (bounds.top + bounds.bottom) / 2

    const updates = elements.map(el => {
      let changes: Partial<H5Element> = {}
      switch (type) {
        case 'left': changes.x = bounds.left; break
        case 'center': changes.x = centerX - el.width / 2; break
        case 'right': changes.x = bounds.right - el.width; break
        case 'top': changes.y = bounds.top; break
        case 'middle': changes.y = centerY - el.height / 2; break
        case 'bottom': changes.y = bounds.bottom - el.height; break
      }
      return { id: el.id, changes }
    })

    updateElements(updates)
  }

  // 等间距分布
  const distributeElements = (type: DistributeType) => {
    const elements = selectedElements.value
    if (elements.length < 3) return

    const sorted = [...elements].sort((a, b) =>
      type === 'horizontal' ? a.x - b.x : a.y - b.y
    )

    if (type === 'horizontal') {
      const totalWidth = sorted.reduce((sum, e) => sum + e.width, 0)
      const left = sorted[0].x
      const right = sorted[sorted.length - 1].x + sorted[sorted.length - 1].width
      const gap = (right - left - totalWidth) / (sorted.length - 1)

      let currentX = left
      const updates = sorted.map(el => {
        const changes = { x: currentX }
        currentX += el.width + gap
        return { id: el.id, changes }
      })
      updateElements(updates)
    } else {
      const totalHeight = sorted.reduce((sum, e) => sum + e.height, 0)
      const top = sorted[0].y
      const bottom = sorted[sorted.length - 1].y + sorted[sorted.length - 1].height
      const gap = (bottom - top - totalHeight) / (sorted.length - 1)

      let currentY = top
      const updates = sorted.map(el => {
        const changes = { y: currentY }
        currentY += el.height + gap
        return { id: el.id, changes }
      })
      updateElements(updates)
    }
  }

  return {
    alignElements,
    alignToCanvas,
    distributeElements
  }
}
