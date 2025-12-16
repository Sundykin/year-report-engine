import { type Ref, onMounted, onUnmounted } from 'vue'
import type { H5Element } from '@year-report/core'

export function useKeyboardEvents(
  selectedElement: Ref<H5Element | undefined>,
  updateElement: (id: string, updates: Partial<H5Element>) => void,
  deleteElement: () => void
) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!selectedElement.value) return
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return

    const step = e.shiftKey ? 10 : 1
    let { x, y } = selectedElement.value

    switch (e.key) {
      case 'ArrowUp': y -= step; e.preventDefault(); break
      case 'ArrowDown': y += step; e.preventDefault(); break
      case 'ArrowLeft': x -= step; e.preventDefault(); break
      case 'ArrowRight': x += step; e.preventDefault(); break
      case 'Delete':
      case 'Backspace':
        const target = document.activeElement
        const isEditing = target?.tagName === 'INPUT' ||
                         target?.tagName === 'TEXTAREA' ||
                         target?.isContentEditable ||
                         target?.closest('.cm-editor') ||
                         target?.closest('.w-e-text-container')
        if (!isEditing) {
          deleteElement()
          e.preventDefault()
        }
        return
      default: return
    }

    updateElement(selectedElement.value.id, { x, y })
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    handleKeyDown
  }
}
