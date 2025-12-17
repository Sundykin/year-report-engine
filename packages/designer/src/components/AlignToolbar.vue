<template>
  <div class="alignToolbar">
    <div class="alignGroup">
      <button @click="$emit('align', 'left')" class="alignBtn" :disabled="disabled" title="左对齐">
        <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M4 22H2V2h2v20zM22 7H6v3h16V7zm-6 7H6v3h16v-3z"/></svg>
      </button>
      <button @click="$emit('align', 'center')" class="alignBtn" :disabled="disabled" title="水平居中">
        <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M8 19h3v4h2v-4h3l-4-4-4 4zm8-14h-3V1h-2v4H8l4 4 4-4zM4 11v2h16v-2H4z"/></svg>
      </button>
      <button @click="$emit('align', 'right')" class="alignBtn" :disabled="disabled" title="右对齐">
        <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M20 2h2v20h-2V2zM2 10h16V7H2v3zm0 7h10v-3H2v3z"/></svg>
      </button>
      <span class="alignDivider"></span>
      <button @click="$emit('align', 'top')" class="alignBtn" :disabled="disabled" title="顶对齐">
        <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M22 2v2H2V2h20zM7 22h3V6H7v16zm7-6h3V6h-3v10z"/></svg>
      </button>
      <button @click="$emit('align', 'middle')" class="alignBtn" :disabled="disabled" title="垂直居中">
        <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 8h-4l4-4 4 4h-4zm-8 8H8l4 4 4-4h-3zM11 4v16h2V4h-2z"/></svg>
      </button>
      <button @click="$emit('align', 'bottom')" class="alignBtn" :disabled="disabled" title="底对齐">
        <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M22 22v-2H2v2h20zM7 2h3v16H7V2zm7 6h3v10h-3V8z"/></svg>
      </button>
    </div>
    <div class="alignGroup">
      <span class="alignDivider"></span>
      <button @click="$emit('distribute', 'horizontal')" class="alignBtn" :disabled="!canDistribute" title="水平等间距">
        <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M4 22H2V2h2v20zM22 2h-2v20h2V2zM13.5 7h-3v10h3V7z"/></svg>
      </button>
      <button @click="$emit('distribute', 'vertical')" class="alignBtn" :disabled="!canDistribute" title="垂直等间距">
        <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M22 2v2H2V2h20zM2 22h20v-2H2v2zm5-11.5v3h10v-3H7z"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  disabled: boolean
  canDistribute: boolean
}>()

defineEmits<{
  align: [type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom']
  distribute: [type: 'horizontal' | 'vertical']
}>()
</script>

<style scoped>
.alignToolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #1a1a1a;
  border-radius: 4px;
  border: 1px solid #333;
}
.alignGroup {
  display: flex;
  align-items: center;
  gap: 2px;
}
.alignBtn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  color: #888;
  cursor: pointer;
  transition: all 0.15s;
}
.alignBtn:hover:not(:disabled) {
  background: #333;
  border-color: #444;
  color: white;
}
.alignBtn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.alignDivider {
  width: 1px;
  height: 20px;
  background: #333;
  margin: 0 4px;
}
</style>
