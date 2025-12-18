import { type Ref, onMounted, onUnmounted } from 'vue'
import type { H5Element } from '@year-report/core'

export interface KeyboardEventHandlers {
  undo?: () => boolean
  redo?: () => boolean
  copy?: () => boolean
  paste?: () => string[]
  cut?: () => boolean
  copyStyle?: () => boolean
  pasteStyle?: () => boolean
}

export function useKeyboardEvents(
  selectedElement: Ref<H5Element | undefined>,
  updateElement: (id: string, updates: Partial<H5Element>) => void,
  deleteElement: () => void,
  handlers: KeyboardEventHandlers = {}
) {
  const handleKeyDown = (e: KeyboardEvent) => {
    const target = document.activeElement
    const isEditing = target?.tagName === 'INPUT' ||
                     target?.tagName === 'TEXTAREA' ||
                     (target as HTMLElement)?.isContentEditable ||
                     target?.closest('.cm-editor') ||
                     target?.closest('.w-e-text-container')

    // Ctrl+Z 撤销 / Ctrl+Shift+Z 重做（全局生效，不受编辑状态影响）
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      if (e.shiftKey) {
        handlers.redo?.()
      } else {
        handlers.undo?.()
      }
      e.preventDefault()
      return
    }

    // Ctrl+Y 重做
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      handlers.redo?.()
      e.preventDefault()
      return
    }

    // Ctrl+C 复制 / Ctrl+Shift+C 复制样式
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && !isEditing) {
      if (e.shiftKey) {
        handlers.copyStyle?.()
      } else {
        handlers.copy?.()
      }
      e.preventDefault()
      return
    }

    // Ctrl+V 粘贴 / Ctrl+Shift+V 粘贴样式
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v' && !isEditing) {
      if (e.shiftKey) {
        handlers.pasteStyle?.()
      } else {
        handlers.paste?.()
      }
      e.preventDefault()
      return
    }

    // Ctrl+X 剪切
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x' && !isEditing) {
      handlers.cut?.()
      e.preventDefault()
      return
    }

    if (!selectedElement.value) return
    if (isEditing) return

    const step = e.shiftKey ? 10 : 1
    let { x, y } = selectedElement.value

    switch (e.key) {
      case 'ArrowUp': y -= step; e.preventDefault(); break
      case 'ArrowDown': y += step; e.preventDefault(); break
      case 'ArrowLeft': x -= step; e.preventDefault(); break
      case 'ArrowRight': x += step; e.preventDefault(); break
      case 'Delete':
      case 'Backspace':
        deleteElement()
        e.preventDefault()
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
