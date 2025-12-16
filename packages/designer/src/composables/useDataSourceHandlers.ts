import { type Ref } from 'vue'
import type { H5Element } from '@year-report/core'

export function useDataSourceHandlers(selectedElement: Ref<H5Element | undefined>) {
  const updateChartDataSources = (event: Event) => {
    if (!selectedElement.value) return
    const select = event.target as HTMLSelectElement
    const selectedIds = Array.from(select.selectedOptions).map(opt => opt.value)

    if (!selectedElement.value.dataBinding) {
      selectedElement.value.dataBinding = { sourceIds: [], transform: '' }
    }
    selectedElement.value.dataBinding.sourceIds = selectedIds
  }

  const updateTextDataSources = (event: Event) => {
    if (!selectedElement.value) return
    const select = event.target as HTMLSelectElement
    const selectedIds = Array.from(select.selectedOptions).map(opt => opt.value)

    if (!selectedElement.value.dataBinding) {
      selectedElement.value.dataBinding = { sourceIds: [] }
    }
    selectedElement.value.dataBinding.sourceIds = selectedIds
  }

  const initRenderFunction = () => {
    if (!selectedElement.value) return
    selectedElement.value.renderFunction = '(ds1, ds2) => {\n  // ds1, ds2 为绑定的数据源\n  return `<div>${ds1.name}</div>`\n}'
    if (!selectedElement.value.dataBinding) {
      selectedElement.value.dataBinding = { sourceIds: [] }
    }
  }

  return {
    updateChartDataSources,
    updateTextDataSources,
    initRenderFunction
  }
}
