<template>
  <div class="dataSourceTimeline">
    <div class="timelineHeader">
      <span class="title">数据源列表</span>
      <button class="addBtn" @click="$emit('add')" title="新增数据源">+</button>
    </div>
    <div class="timelineList">
      <div
        v-for="source in dataSources"
        :key="source.id"
        class="sourceItem"
        :class="{ active: selectedId === source.id }"
        @click="$emit('select', source.id)"
      >
        <div class="sourceInfo">
          <span class="icon">{{ source.type === 'static' ? '📄' : '🌐' }}</span>
          <span class="name">{{ source.name }}</span>
        </div>
        <div class="sourceActions">
          <button
            v-if="source.type === 'async'"
            class="actionBtn"
            @click.stop="$emit('test', source.id)"
            title="测试连接"
          >⚡</button>
          <button
            class="actionBtn"
            @click.stop="$emit('duplicate', source.id)"
            title="复制"
          >📋</button>
          <!-- 删除按钮和确认提示 -->
          <div class="deleteWrapper">
            <button
              class="actionBtn danger"
              @click.stop="showDeleteConfirm(source.id)"
              title="删除"
            >×</button>
            <!-- 确认删除提示 -->
            <div v-if="confirmingDeleteId === source.id" class="deleteConfirm">
              <span>确定删除?</span>
              <button class="confirmYes" @click.stop="confirmDelete(source.id)">是</button>
              <button class="confirmNo" @click.stop="cancelDelete">否</button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="dataSources.length === 0" class="emptyTip">
        点击 + 添加数据源
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { DataSource } from '@year-report/core'

interface Props {
  dataSources: DataSource[]
  selectedId?: string | null
}

defineProps<Props>()

const emit = defineEmits<{
  select: [id: string]
  add: []
  delete: [id: string]
  duplicate: [id: string]
  test: [id: string]
}>()

const confirmingDeleteId = ref<string | null>(null)

const showDeleteConfirm = (id: string) => {
  confirmingDeleteId.value = id
}

const confirmDelete = (id: string) => {
  emit('delete', id)
  confirmingDeleteId.value = null
}

const cancelDelete = () => {
  confirmingDeleteId.value = null
}
</script>

<style scoped>
.dataSourceTimeline {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.timelineHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #262626;
  flex-shrink: 0;
}

.title {
  font-size: 11px;
  color: #a3a3a3;
  text-transform: uppercase;
  font-weight: 600;
}

.addBtn {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: #3b82f6;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.addBtn:hover {
  background: #2563eb;
}

.timelineList {
  flex: 1;
  overflow-y: auto;
  padding: 4px;
}

.sourceItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  margin-bottom: 2px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
  background: transparent;
}

.sourceItem:hover {
  background: #1a1a1a;
}

.sourceItem.active {
  background: #1e3a8a33;
  border-left: 2px solid #3b82f6;
}

.sourceInfo {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1;
}

.icon {
  font-size: 12px;
  flex-shrink: 0;
}

.name {
  font-size: 12px;
  color: #e5e5e5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sourceActions {
  display: none;
  gap: 2px;
  flex-shrink: 0;
  align-items: center;
}

.sourceItem:hover .sourceActions {
  display: flex;
}

.actionBtn {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.actionBtn:hover {
  background: #333;
  color: #e5e5e5;
}

.actionBtn.danger:hover {
  background: #dc2626;
  color: white;
}

.deleteWrapper {
  position: relative;
}

.deleteConfirm {
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  background: #262626;
  border: 1px solid #404040;
  border-radius: 4px;
  padding: 4px 8px;
  white-space: nowrap;
  z-index: 10;
  margin-right: 4px;
}

.deleteConfirm span {
  font-size: 11px;
  color: #a3a3a3;
}

.confirmYes, .confirmNo {
  padding: 2px 8px;
  border-radius: 3px;
  border: none;
  font-size: 10px;
  cursor: pointer;
}

.confirmYes {
  background: #dc2626;
  color: white;
}

.confirmYes:hover {
  background: #ef4444;
}

.confirmNo {
  background: #404040;
  color: #a3a3a3;
}

.confirmNo:hover {
  background: #525252;
  color: white;
}

.emptyTip {
  color: #525252;
  text-align: center;
  padding: 20px;
  font-size: 11px;
}
</style>
