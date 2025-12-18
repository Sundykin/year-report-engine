<template>
  <div class="richTextEditor">
    <Toolbar :editor="editorRef" :defaultConfig="toolbarConfig" mode="default" class="toolbar" />
    <Editor
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      mode="default"
      class="editor"
      @onCreated="handleCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount, shallowRef, computed } from 'vue'
// @ts-ignore
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'

interface Props {
  modelValue: string
  disabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorRef = shallowRef()
const valueHtml = ref(props.modelValue || '')

const toolbarConfig = {
  excludeKeys: [
    'group-video',
    'insertImage',
    'uploadImage',
    'codeBlock',
    'divider',
    'emotion',
    'insertLink',
    'editLink',
    'unLink',
    'viewLink'
  ]
}

const editorConfig = computed(() => ({
  placeholder: '请输入内容...',
  MENU_CONF: {},
  readOnly: props.disabled
}))

const handleCreated = (editor: any) => {
  editorRef.value = editor
}

watch(valueHtml, (newVal) => {
  emit('update:modelValue', newVal)
})

watch(() => props.modelValue, (newVal) => {
  if (newVal !== valueHtml.value) {
    valueHtml.value = newVal || ''
  }
})

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor) {
    editor.destroy()
  }
})
</script>

<style scoped>
.richTextEditor {
  width: 100%;
  height: 100%;
  min-height: 300px;
  border: 1px solid #444;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}

.toolbar {
  border-bottom: 1px solid #444;
  background: #2a2a2a;
}

.editor {
  flex: 1;
  overflow-y: auto;
  background: #1a1a1a;
}

.richTextEditor :deep(.w-e-text-container) {
  background: #1a1a1a !important;
}

.richTextEditor :deep(.w-e-text-placeholder) {
  color: #666 !important;
}

.richTextEditor :deep(.w-e-text-container [data-slate-editor]) {
  color: #e5e5e5 !important;
}

.richTextEditor :deep(.w-e-bar) {
  background: #2a2a2a !important;
  border-color: #444 !important;
}

.richTextEditor :deep(.w-e-bar-item button) {
  color: #a3a3a3 !important;
}

.richTextEditor :deep(.w-e-bar-item button:hover) {
  color: #fff !important;
  background: #404040 !important;
}

.richTextEditor :deep(.w-e-bar-divider) {
  background: #444 !important;
}
</style>
