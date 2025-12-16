<template>
  <SimpleScrollView class="componentPanel">
    <div v-for="group in componentGroups" :key="group.title" class="componentGroup">
      <h3 class="groupTitle">{{ group.title }}</h3>
      <div class="componentGrid">
        <button
          v-for="item in group.items"
          :key="item.type"
          @click="$emit('add-element', item.type)"
          class="componentBtn"
        >
          <span class="componentIcon">{{ item.icon }}</span>
          <span class="componentLabel">{{ item.label }}</span>
        </button>
      </div>
    </div>

    <div class="exportSection">
      <h3 class="groupTitle">项目导出</h3>
      <button @click="$emit('export')" class="exportBtn">📥 导出 ZIP</button>
    </div>
  </SimpleScrollView>
</template>

<script setup lang="ts">
import type { ElementType } from '@year-report/core'
import SimpleScrollView from './SimpleScrollView.vue'

interface ComponentItem {
  type: ElementType
  icon: string
  label: string
}

interface ComponentGroup {
  title: string
  items: ComponentItem[]
}

interface Props {
  componentGroups: ComponentGroup[]
}

defineProps<Props>()
defineEmits<{
  'add-element': [type: ElementType]
  export: []
}>()
</script>

<style scoped>
.componentPanel {
  width: clamp(180px, 12vw, 220px);
  height: 100%;
  padding: 12px;
  flex-shrink: 0;
  border-right: 1px solid #262626;
  background: #0a0a0a;
}
.componentGroup { margin-bottom: 20px; }
.groupTitle { font-size: 11px; color: #60a5fa; text-transform: uppercase; font-weight: bold; margin-bottom: 8px; }
.componentGrid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.componentBtn { background: #171717; border: 1px solid #262626; border-radius: 6px; padding: 12px 8px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px; color: white; font-size: 11px; }
.componentBtn:hover { border-color: #3b82f6; background: #1e1e1e; }
.componentIcon { font-size: 24px; }
.componentLabel { font-size: 11px; }
.exportSection { margin-top: 24px; padding-top: 16px; border-top: 1px solid #262626; }
.exportBtn { width: 100%; background: #3b82f6; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; }
.exportBtn:hover { background: #2563eb; }
</style>
