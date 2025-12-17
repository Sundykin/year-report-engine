import { ref, type Ref, computed } from 'vue'
import type { ProjectData, H5Element, CSSStyle } from '@year-report/core'
import { generateId } from '@year-report/core'

export interface ClipboardData {
  type: 'elements' | 'style'
  elements?: H5Element[]
  style?: CSSStyle
}

export function useClipboard(
  project: Ref<ProjectData>,
  activePageId: Ref<string>,
  selectedElementIds: Ref<string[]>,
  selectedElementId: Ref<string | null>
) {
  const clipboard = ref<ClipboardData | null>(null)
  const pasteOffset = ref(20)

  const activePage = computed(() => project.value.pages.find(p => p.id === activePageId.value)!)

  const selectedElements = computed(() =>
    activePage.value.elements.filter(e => selectedElementIds.value.includes(e.id))
  )

  const selectedElement = computed(() =>
    activePage.value.elements.find(e => e.id === selectedElementId.value)
  )

  // 复制元素
  const copyElements = () => {
    const elements = selectedElements.value
    if (elements.length === 0) return false

    clipboard.value = {
      type: 'elements',
      elements: JSON.parse(JSON.stringify(elements))
    }
    pasteOffset.value = 20
    return true
  }

  // 复制样式
  const copyStyle = () => {
    const el = selectedElement.value
    if (!el) return false

    clipboard.value = {
      type: 'style',
      style: JSON.parse(JSON.stringify(el.style))
    }
    return true
  }

  // 粘贴
  const paste = (targetPageId?: string) => {
    if (!clipboard.value) return []

    const pageId = targetPageId || activePageId.value
    const page = project.value.pages.find(p => p.id === pageId)
    if (!page) return []

    if (clipboard.value.type === 'elements' && clipboard.value.elements) {
      const newElements: H5Element[] = clipboard.value.elements.map(el => ({
        ...el,
        id: generateId(),
        x: el.x + pasteOffset.value,
        y: el.y + pasteOffset.value,
        zIndex: page.elements.length + 1,
        groupId: undefined // 粘贴时清除分组
      }))

      project.value = {
        ...project.value,
        pages: project.value.pages.map(p =>
          p.id === pageId
            ? { ...p, elements: [...p.elements, ...newElements] }
            : p
        )
      }

      pasteOffset.value += 20
      return newElements.map(e => e.id)
    }

    return []
  }

  // 粘贴样式
  const pasteStyle = () => {
    if (!clipboard.value || clipboard.value.type !== 'style' || !clipboard.value.style) return false

    const elements = selectedElements.value
    if (elements.length === 0) return false

    project.value = {
      ...project.value,
      pages: project.value.pages.map(p =>
        p.id === activePageId.value
          ? {
              ...p,
              elements: p.elements.map(e =>
                selectedElementIds.value.includes(e.id)
                  ? { ...e, style: { ...e.style, ...clipboard.value!.style } }
                  : e
              )
            }
          : p
      )
    }
    return true
  }

  // 剪切
  const cut = () => {
    if (!copyElements()) return false

    project.value = {
      ...project.value,
      pages: project.value.pages.map(p =>
        p.id === activePageId.value
          ? { ...p, elements: p.elements.filter(e => !selectedElementIds.value.includes(e.id)) }
          : p
      )
    }
    selectedElementIds.value = []
    return true
  }

  // 复制到其他页面
  const copyToPage = (targetPageId: string) => {
    const elements = selectedElements.value
    if (elements.length === 0) return []

    const page = project.value.pages.find(p => p.id === targetPageId)
    if (!page) return []

    const newElements: H5Element[] = elements.map(el => ({
      ...JSON.parse(JSON.stringify(el)),
      id: generateId(),
      zIndex: page.elements.length + 1,
      groupId: undefined
    }))

    project.value = {
      ...project.value,
      pages: project.value.pages.map(p =>
        p.id === targetPageId
          ? { ...p, elements: [...p.elements, ...newElements] }
          : p
      )
    }

    return newElements.map(e => e.id)
  }

  const hasClipboard = computed(() => clipboard.value !== null)
  const clipboardType = computed(() => clipboard.value?.type)

  return {
    clipboard,
    copyElements,
    copyStyle,
    paste,
    pasteStyle,
    cut,
    copyToPage,
    hasClipboard,
    clipboardType
  }
}
