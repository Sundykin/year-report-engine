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
  const getElementDefaults = (type: ElementType): Partial<H5Element> => {
    const defaults: Record<string, Partial<H5Element>> = {
      text: { width: 200, height: 40, content: '双击编辑', style: { color: '#ffffff', fontSize: '16px' } },
      richtext: { width: 200, height: 40, content: '<p>双击编辑富文本</p>', style: { color: '#ffffff', fontSize: '16px' } },
      image: { width: 100, height: 100, src: 'https://picsum.photos/200/200' },
      shape: { width: 100, height: 100, shapeType: 'rectangle', style: { backgroundColor: '#3b82f6' } },
      video: { width: 200, height: 150, src: '' },
      chart: { width: 200, height: 200, chartType: 'bar', chartData: DEFAULT_CHART_DATA },
      button: {
        width: 120, height: 40, content: '按钮',
        buttonStyle: 'solid',
        buttonAction: { type: 'none' },
        style: { backgroundColor: '#3b82f6', color: '#ffffff', fontSize: '14px', borderRadius: '4px' }
      },
      icon: { width: 40, height: 40, iconName: 'star', iconColor: '#3b82f6' },
      divider: { width: 200, height: 2, dividerStyle: 'solid', style: { backgroundColor: '#404040' } },
      progress: {
        width: 200, height: 20, progressType: 'line', progressValue: 60, progressColor: '#3b82f6',
        style: { backgroundColor: '#262626', borderRadius: '10px' }
      },
      counter: {
        width: 120, height: 60, counterValue: 1000, counterPrefix: '', counterSuffix: '',
        counterDecimals: 0, counterDuration: 2,
        style: { color: '#ffffff', fontSize: '32px', fontWeight: 'bold' }
      }
    }
    return defaults[type] || { width: 100, height: 100 }
  }

  const addElement = (type: ElementType) => {
    const activePage = project.value.pages.find(p => p.id === activePageId.value)!
    const defaults = getElementDefaults(type)

    const newElement: H5Element = {
      id: generateId(),
      type,
      x: CANVAS_WIDTH / 2 - (defaults.width || 100) / 2,
      y: CANVAS_HEIGHT / 2 - (defaults.height || 100) / 2,
      width: defaults.width || 100,
      height: defaults.height || 100,
      zIndex: activePage.elements.length + 1,
      style: { color: '#ffffff', fontSize: '16px', backgroundColor: 'transparent', ...defaults.style },
      ...defaults,
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
