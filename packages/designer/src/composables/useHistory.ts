import { ref, watch, type Ref } from 'vue'
import type { ProjectData } from '@year-report/core'

export interface HistoryOptions {
  maxLength?: number
  debounceMs?: number
}

export function useHistory(
  project: Ref<ProjectData>,
  options: HistoryOptions = {}
) {
  const { maxLength = 50, debounceMs = 300 } = options

  const undoStack = ref<string[]>([])
  const redoStack = ref<string[]>([])
  const isHistoryAction = ref(false)

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let lastSnapshot = ''

  // 初始化快照
  const initSnapshot = () => {
    lastSnapshot = JSON.stringify(project.value)
    undoStack.value = []
    redoStack.value = []
  }

  // 保存快照（带防抖，合并连续操作）
  const saveSnapshot = () => {
    if (isHistoryAction.value) return

    if (debounceTimer) clearTimeout(debounceTimer)

    debounceTimer = setTimeout(() => {
      const current = JSON.stringify(project.value)
      if (current === lastSnapshot) return

      undoStack.value.push(lastSnapshot)
      if (undoStack.value.length > maxLength) {
        undoStack.value.shift()
      }

      redoStack.value = []
      lastSnapshot = current
    }, debounceMs)
  }

  // 立即保存（用于重要操作如删除）
  const saveSnapshotImmediate = () => {
    if (isHistoryAction.value) return
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }

    const current = JSON.stringify(project.value)
    if (current === lastSnapshot) return

    undoStack.value.push(lastSnapshot)
    if (undoStack.value.length > maxLength) {
      undoStack.value.shift()
    }

    redoStack.value = []
    lastSnapshot = current
  }

  const undo = () => {
    if (undoStack.value.length === 0) return false

    const current = JSON.stringify(project.value)
    redoStack.value.push(current)

    const prev = undoStack.value.pop()!
    isHistoryAction.value = true
    project.value = JSON.parse(prev)
    lastSnapshot = prev

    setTimeout(() => { isHistoryAction.value = false }, 0)
    return true
  }

  const redo = () => {
    if (redoStack.value.length === 0) return false

    const current = JSON.stringify(project.value)
    undoStack.value.push(current)

    const next = redoStack.value.pop()!
    isHistoryAction.value = true
    project.value = JSON.parse(next)
    lastSnapshot = next

    setTimeout(() => { isHistoryAction.value = false }, 0)
    return true
  }

  const canUndo = () => undoStack.value.length > 0
  const canRedo = () => redoStack.value.length > 0

  // 监听 project 变化自动保存快照
  watch(
    () => project.value,
    () => saveSnapshot(),
    { deep: true }
  )

  return {
    undoStack,
    redoStack,
    initSnapshot,
    saveSnapshot,
    saveSnapshotImmediate,
    undo,
    redo,
    canUndo,
    canRedo
  }
}
