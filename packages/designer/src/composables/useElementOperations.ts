import { type Ref } from 'vue'
import type { ProjectData, H5Element, ElementType } from '@year-report/core'
import { generateId, DEFAULT_CHART_DATA } from '@year-report/core'

const CANVAS_WIDTH = 375
const CANVAS_HEIGHT = 667

export function useElementOperations(
  project: Ref<ProjectData>,
  activePageId: Ref<string>,
  selectedElementId: Ref<string | null>
) {
  const addElement = (type: ElementType) => {
    const isText = type === 'text' || type === 'richtext'
    const activePage = project.value.pages.find(p => p.id === activePageId.value)!

    const newElement: H5Element = {
      id: generateId(),
      type,
      x: CANVAS_WIDTH / 2 - (isText ? 100 : 50),
      y: CANVAS_HEIGHT / 2 - (isText ? 20 : 50),
      width: isText ? 200 : 100,
      height: isText ? 40 : 100,
      zIndex: activePage.elements.length + 1,
      style: {
        color: '#ffffff',
        fontSize: '16px',
        backgroundColor: type === 'shape' ? '#3b82f6' : 'transparent',
      },
      content: type === 'text' ? '双击编辑' : type === 'richtext' ? '<p>双击编辑富文本</p>' : undefined,
      src: type === 'image' ? 'https://picsum.photos/200/200' : type === 'video' ? '' : undefined,
      chartType: 'bar',
      shapeType: type === 'shape' ? 'rectangle' : undefined,
      chartData: DEFAULT_CHART_DATA,
      animations: [{ id: generateId(), type: 'fadeIn', duration: 1, delay: 0, trigger: 'onEnter', order: 0 }]
    }

    project.value = {
      ...project.value,
      pages: project.value.pages.map(p =>
        p.id === activePageId.value ? { ...p, elements: [...p.elements, newElement] } : p
      )
    }

    selectedElementId.value = newElement.id
  }

  const updateElement = (id: string, updates: Partial<H5Element>) => {
    project.value = {
      ...project.value,
      pages: project.value.pages.map(p =>
        p.id === activePageId.value
          ? { ...p, elements: p.elements.map(e => e.id === id ? { ...e, ...updates } : e) }
          : p
      )
    }
  }

  const deleteElement = () => {
    if (!selectedElementId.value) return
    project.value = {
      ...project.value,
      pages: project.value.pages.map(p =>
        p.id === activePageId.value
          ? { ...p, elements: p.elements.filter(e => e.id !== selectedElementId.value) }
          : p
      )
    }
    selectedElementId.value = null
  }

  return {
    addElement,
    updateElement,
    deleteElement
  }
}
