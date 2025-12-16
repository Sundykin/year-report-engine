<template>
  <div ref="editorRef" class="codeEditor"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'

interface Props {
  modelValue: string
  disabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorRef = ref<HTMLDivElement | null>(null)
let editorView: EditorView | null = null

onMounted(() => {
  if (!editorRef.value) return

  editorView = new EditorView({
    doc: props.modelValue,
    extensions: [
      basicSetup,
      javascript(),
      oneDark,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          emit('update:modelValue', update.state.doc.toString())
        }
      }),
      EditorState.readOnly.of(props.disabled || false)
    ],
    parent: editorRef.value
  })
})

watch(() => props.modelValue, (newValue) => {
  if (!editorView) return
  const currentValue = editorView.state.doc.toString()
  if (newValue !== currentValue) {
    editorView.dispatch({
      changes: {
        from: 0,
        to: currentValue.length,
        insert: newValue
      }
    })
  }
})

onUnmounted(() => {
  editorView?.destroy()
})
</script>

<style scoped>
.codeEditor {
  width: 100%;
  height: 100%;
  min-height: 120px;
  border: 1px solid #444;
  border-radius: 4px;
  overflow: hidden;
}

.codeEditor :deep(.cm-editor) {
  height: 100%;
  font-size: 12px;
}

.codeEditor :deep(.cm-scroller) {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}
</style>
