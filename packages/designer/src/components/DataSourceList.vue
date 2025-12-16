<template>
  <div class="dataSourceList">
    <div class="listHeader">
      <h3 class="title">📊 数据源</h3>
      <button class="addBtn" @click="$emit('add')" title="新增数据源 (Ctrl+N)">
        <span class="icon">+</span>
      </button>
    </div>

    <!-- 搜索栏 -->
    <div class="searchBar">
      <input
        v-model="searchQuery"
        type="text"
        class="searchInput"
        placeholder="搜索数据源..."
        @keydown.ctrl.n.prevent="$emit('add')"
      />
    </div>

    <!-- 数据源列表 -->
    <div class="list">
      <div
        v-for="source in filteredSources"
        :key="source.id"
        class="listItem"
        :class="{
          active: selectedId === source.id,
          [source.type]: true
        }"
        @click="$emit('select', source.id)"
        @contextmenu.prevent="showContextMenu($event, source)"
      >
        <div class="itemMain">
          <span class="icon">
            {{ source.type === 'static' ? '📄' : '🌐' }}
          </span>
          <div class="itemInfo">
            <div class="name">{{ source.name }}</div>
            <div class="desc">{{ getSourceDesc(source) }}</div>
          </div>
        </div>

        <div class="itemStatus">
          <span class="statusIcon" :class="getStatusClass(source)">
            {{ getStatusIcon(source) }}
          </span>
          <div class="actions" @click.stop>
            <button
              v-if="source.type === 'async'"
              class="actionBtn"
              @click="$emit('test', source.id)"
              title="测试连接"
            >
              ⚡
            </button>
            <button
              class="actionBtn"
              @click="$emit('duplicate', source.id)"
              title="复制"
            >
              📋
            </button>
            <button
              class="actionBtn danger"
              @click="$emit('delete', source.id)"
              title="删除"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredSources.length === 0" class="emptyState">
        <div class="emptyIcon">📭</div>
        <div class="emptyText">
          {{ searchQuery ? '没有找到匹配的数据源' : '暂无数据源' }}
        </div>
        <button v-if="!searchQuery" class="emptyAddBtn" @click="$emit('add')">
          + 添加第一个数据源
        </button>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div
      v-if="contextMenu"
      class="contextMenu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      @click="hideContextMenu"
    >
      <button class="menuItem" @click="handleContextMenuAction('edit')">
        ✏️ 编辑
      </button>
      <button
        v-if="contextMenuSource?.type === 'async'"
        class="menuItem"
        @click="handleContextMenuAction('test')"
      >
        ⚡ 测试连接
      </button>
      <button class="menuItem" @click="handleContextMenuAction('duplicate')">
        📋 复制
      </button>
      <div class="menuDivider"></div>
      <button class="menuItem danger" @click="handleContextMenuAction('delete')">
        🗑️ 删除
      </button>
    </div>
    <div v-if="contextMenu" class="contextMenuOverlay" @click="hideContextMenu"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { DataSource } from '@year-report/core'

interface Props {
  sources: DataSource[]
  selectedId?: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [id: string]
  add: []
  delete: [id: string]
  duplicate: [id: string]
  test: [id: string]
}>()

const searchQuery = ref('')
const contextMenu = ref<{ x: number; y: number } | null>(null)
const contextMenuSource = ref<DataSource | null>(null)

// 过滤后的数据源
const filteredSources = computed(() => {
  if (!searchQuery.value) return props.sources

  const query = searchQuery.value.toLowerCase()
  return props.sources.filter(source =>
    source.name.toLowerCase().includes(query)
  )
})

// 获取数据源描述
const getSourceDesc = (source: DataSource) => {
  if (source.type === 'static') {
    const keys = Object.keys(source.staticData || {})
    if (keys.length === 0) return '空数据'
    if (keys.length === 1) return `1个字段: ${keys[0]}`
    return `${keys.length}个字段`
  } else {
    if (source.asyncConfig?.url) {
      const url = new URL(source.asyncConfig.url)
      return `${source.asyncConfig.method} ${url.hostname}`
    }
    return '未配置'
  }
}

// 获取状态图标
const getStatusIcon = (source: DataSource) => {
  if (source.type === 'static') {
    return Object.keys(source.staticData || {}).length > 0 ? '✅' : '⚠️'
  } else {
    if (!source.asyncConfig?.url) return '⚠️'
    return '✅'
  }
}

// 获取状态样式类
const getStatusClass = (source: DataSource) => {
  if (source.type === 'static') {
    return Object.keys(source.staticData || {}).length > 0 ? 'success' : 'warning'
  } else {
    return source.asyncConfig?.url ? 'success' : 'warning'
  }
}

// 显示右键菜单
const showContextMenu = (e: MouseEvent, source: DataSource) => {
  contextMenu.value = { x: e.clientX, y: e.clientY }
  contextMenuSource.value = source
}

// 隐藏右键菜单
const hideContextMenu = () => {
  contextMenu.value = null
  contextMenuSource.value = null
}

// 处理右键菜单操作
const handleContextMenuAction = (action: string) => {
  if (!contextMenuSource.value) return

  switch (action) {
    case 'edit':
      emit('select', contextMenuSource.value.id)
      break
    case 'test':
      emit('test', contextMenuSource.value.id)
      break
    case 'duplicate':
      emit('duplicate', contextMenuSource.value.id)
      break
    case 'delete':
      emit('delete', contextMenuSource.value.id)
      break
  }

  hideContextMenu()
}

// 键盘快捷键
const handleKeydown = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === 'n') {
    e.preventDefault()
    emit('add')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.dataSourceList {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0a0a0a;
  border-right: 1px solid #262626;
}

.listHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #262626;
}

.title {
  font-size: 14px;
  font-weight: 600;
  color: #e5e5e5;
  margin: 0;
}

.addBtn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #1890ff;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.addBtn:hover {
  background: #40a9ff;
  transform: scale(1.05);
}

.icon {
  font-size: 18px;
  font-weight: 300;
}

.searchBar {
  padding: 12px 16px;
  border-bottom: 1px solid #262626;
}

.searchInput {
  width: 100%;
  height: 32px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 0 12px;
  color: #e5e5e5;
  font-size: 12px;
  transition: all 0.2s;
}

.searchInput:focus {
  outline: none;
  border-color: #1890ff;
  background: #1f1f1f;
}

.searchInput::placeholder {
  color: #666;
}

.list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.listItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.listItem:hover {
  background: #1a1a1a;
}

.listItem.active {
  background: #1890ff20;
  border-color: #1890ff;
}

.itemMain {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.icon {
  font-size: 16px;
  flex-shrink: 0;
}

.itemInfo {
  min-width: 0;
  flex: 1;
}

.name {
  font-size: 13px;
  color: #e5e5e5;
  font-weight: 500;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.desc {
  font-size: 11px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.itemStatus {
  display: flex;
  align-items: center;
  gap: 8px;
}

.statusIcon {
  font-size: 12px;
}

.statusIcon.success {
  color: #52c41a;
}

.statusIcon.warning {
  color: #faad14;
}

.actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}

.listItem:hover .actions {
  opacity: 1;
}

.actionBtn {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s;
}

.actionBtn:hover {
  background: #333;
  color: #e5e5e5;
}

.actionBtn.danger:hover {
  background: #ff4d4f;
  color: white;
}

.emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.emptyIcon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.emptyText {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.emptyAddBtn {
  padding: 8px 20px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.emptyAddBtn:hover {
  background: #40a9ff;
  transform: translateY(-1px);
}

/* 右键菜单 */
.contextMenu {
  position: fixed;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 4px 0;
  min-width: 120px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.menuItem {
  width: 100%;
  padding: 8px 16px;
  background: transparent;
  border: none;
  color: #e5e5e5;
  font-size: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.menuItem:hover {
  background: #333;
}

.menuItem.danger:hover {
  background: #ff4d4f;
  color: white;
}

.menuDivider {
  height: 1px;
  background: #333;
  margin: 4px 0;
}

.contextMenuOverlay {
  position: fixed;
  inset: 0;
  z-index: 999;
}
</style>