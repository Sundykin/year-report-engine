import { type Ref } from 'vue'
import type { ProjectData, H5Page } from '@year-report/core'
import { generateId } from '@year-report/core'

export function usePageOperations(
  project: Ref<ProjectData>,
  activePageId: Ref<string>
) {
  const addPage = () => {
    const newPage: H5Page = {
      id: generateId(),
      backgroundType: 'color',
      backgroundColor: '#1a1a1a',
      elements: []
    }
    project.value = { ...project.value, pages: [...project.value.pages, newPage] }
    activePageId.value = newPage.id
  }

  const deletePage = (id: string) => {
    if (project.value.pages.length <= 1) return
    const newPages = project.value.pages.filter(p => p.id !== id)
    project.value = { ...project.value, pages: newPages }
    if (activePageId.value === id) activePageId.value = newPages[0].id
  }

  const updatePage = (id: string, updates: Partial<H5Page>) => {
    project.value = {
      ...project.value,
      pages: project.value.pages.map(p => p.id === id ? { ...p, ...updates } : p)
    }
  }

  return {
    addPage,
    deletePage,
    updatePage
  }
}
