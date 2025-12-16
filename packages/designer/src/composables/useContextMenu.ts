import { type Ref, ref, computed } from 'vue'
import type { ProjectData, H5Element } from '@year-report/core'
import { generateId } from '@year-report/core'

export function useContextMenu(
  project: Ref<ProjectData>,
  activePageId: Ref<string>,
  selectedElementId: Ref<string | null>,
  updateElement: (id: string, updates: Partial<H5Element>) => void
) {
  const contextMenu = ref<{ x: number; y: number; id: string } | null>(null)

  const activePage = computed(() => project.value.pages.find(p => p.id === activePageId.value)!)
  const contextElement = computed(() => {
    if (!contextMenu.value) return null
    return activePage.value.elements.find(e => e.id === contextMenu.value!.id)
  })

  const handleContextMenu = (e: MouseEvent, id: string) => {
    selectedElementId.value = id
    contextMenu.value = { x: e.clientX, y: e.clientY, id }
  }

  const handleCopy = () => {
    if (!contextMenu.value) return
    const el = activePage.value.elements.find(e => e.id === contextMenu.value!.id)
    if (!el) return
    const newEl = { ...el, id: generateId(), x: el.x + 20, y: el.y + 20 }
    project.value = {
      ...project.value,
      pages: project.value.pages.map(p =>
        p.id === activePageId.value ? { ...p, elements: [...p.elements, newEl] } : p
      )
    }
    contextMenu.value = null
    selectedElementId.value = newEl.id
  }

  const handleDelete = () => {
    if (!contextMenu.value) return
    project.value = {
      ...project.value,
      pages: project.value.pages.map(p =>
        p.id === activePageId.value ? { ...p, elements: p.elements.filter(e => e.id !== contextMenu.value!.id) } : p
      )
    }
    contextMenu.value = null
    selectedElementId.value = null
  }

  const handleZIndex = (delta: number) => {
    if (!contextMenu.value) return
    const el = activePage.value.elements.find(e => e.id === contextMenu.value!.id)
    if (!el) return
    const newZIndex = Math.max(1, (el.zIndex ?? 1) + delta)
    updateElement(contextMenu.value.id, { zIndex: newZIndex })
    contextMenu.value = null
  }

  const handleBringToFront = () => {
    if (!contextMenu.value) return
    const maxZ = Math.max(...activePage.value.elements.map(e => e.zIndex ?? 1))
    updateElement(contextMenu.value.id, { zIndex: maxZ + 1 })
    contextMenu.value = null
  }

  const handleSendToBack = () => {
    if (!contextMenu.value) return
    const targetId = contextMenu.value.id
    const minZ = Math.min(...activePage.value.elements.map(e => e.zIndex ?? 1))

    if (minZ <= 1) {
      activePage.value.elements.forEach(el => {
        if (el.id !== targetId && (el.zIndex ?? 1) <= 1) {
          el.zIndex = (el.zIndex ?? 1) + 1
        }
      })
    }

    updateElement(targetId, { zIndex: minZ <= 1 ? 1 : minZ - 1 })
    contextMenu.value = null
  }

  // 切换锁定状态
  const handleToggleLock = () => {
    if (!contextMenu.value) return
    const el = activePage.value.elements.find(e => e.id === contextMenu.value!.id)
    if (!el) return
    updateElement(contextMenu.value.id, { locked: !el.locked })
    contextMenu.value = null
  }

  return {
    contextMenu,
    contextElement,
    handleContextMenu,
    handleCopy,
    handleDelete,
    handleZIndex,
    handleBringToFront,
    handleSendToBack,
    handleToggleLock
  }
}
