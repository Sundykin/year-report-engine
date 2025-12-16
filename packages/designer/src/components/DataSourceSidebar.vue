<template>
  <div class="dataSourceSidebar">
    <div class="sidebarHeader">
      <span class="title">📊 数据源</span>
      <button class="addBtn" @click="$emit('add')" title="新增数据源">
        +
      </button>
    </div>

    <!-- 搜索 -->
    <div class="searchWrapper">
      <input
        v-model="searchQuery"
        type="text"
        class="searchInput"
        placeholder="搜索..."
      />
    </div>

    <!-- 数据源列表 -->
    <SimpleScrollView class="listScroll">
      <div class="sourceList">
        <div
          v-for="source in filteredSources"
          :key="source.id"
          class="sourceItem"
          :class="{ active: selectedId === source.id }"
          @click="handleSelect(source.id)"
        >
          <div class="itemMain">
            <span class="icon">
              {{ source.type === 'static' ? '📄' : '🌐' }}
            </span>
            <div class="itemInfo">
              <div class="name">{{ source.name }}</div>
              <div class="status">
                <span v-if="source.type === 'static'">
                  {{ Object.keys(source.staticData || {}).length }} 字段
                </span>
                <span v-else>
                  {{ source.asyncConfig?.url ? '已配置' : '未配置' }}
                </span>
              </div>
            </div>
          </div>

          <!-- 快速操作 -->
          <div class="quickActions" @click.stop>
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
              @click="$emit('edit', source.id)"
              title="编辑"
            >
              ✏️
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

        <!-- 空状态 -->
        <div v-if="filteredSources.length === 0" class="emptyState">
          <div class="emptyIcon">📭</div>
          <div class="emptyText">
            {{ searchQuery ? '没有找到数据源' : '暂无数据源' }}
          </div>
        </div>
      </div>
    </SimpleScrollView>

    <!-- 底部信息 -->
    <div class="sidebarFooter">
      <div class="stats">
        共 {{ dataSources.length }} 个数据源
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DataSource } from '@year-report/core'
import SimpleScrollView from './SimpleScrollView.vue'

interface Props {
  dataSources: DataSource[]
  selectedId?: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [id: string]
  add: []
  edit: [id: string]
  delete: [id: string]
  duplicate: [id: string]
  test: [id: string]
}>()

const searchQuery = ref('')

// 过滤后的数据源
const filteredSources = computed(() => {
  if (!searchQuery.value) return props.dataSources

  const query = searchQuery.value.toLowerCase()
  return props.dataSources.filter(source =>
    source.name.toLowerCase().includes(query)
  )
})

// 处理选择
const handleSelect = (id: string) => {
  emit('select', id)
  emit('edit', id) // 同时触发编辑
}
</script>

<style scoped>
.dataSourceSidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0a0a0a;
}

.sidebarHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #262626;
}

.title {
  font-size: 12px;
  font-weight: 600;
  color: #a3a3a3;
  text-transform: uppercase;
}

.addBtn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: #1890ff;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
}

.addBtn:hover {
  background: #40a9ff;
}

.searchWrapper {
  padding: 8px 12px;
  border-bottom: 1px solid #262626;
}

.searchInput {
  width: 100%;
  height: 28px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 0 8px;
  color: #e5e5e5;
  font-size: 11px;
}

.searchInput:focus {
  outline: none;
  border-color: #1890ff;
}

.listScroll {
  flex: 1;
  min-height: 0;
}

.sourceList {
  padding: 4px;
}

.sourceItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 2px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.sourceItem:hover {
  background: #1a1a1a;
}

.sourceItem.active {
  background: #1890ff20;
}

.itemMain {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.icon {
  font-size: 14px;
  flex-shrink: 0;
}

.itemInfo {
  min-width: 0;
  flex: 1;
}

.name {
  font-size: 12px;
  color: #e5e5e5;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status {
  font-size: 10px;
  color: #666;
  margin-top: 2px;
}

.quickActions {
  display: none;
  gap: 2px;
}

.sourceItem:hover .quickActions {
  display: flex;
}

.actionBtn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
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
  color: #666;
}

.emptyIcon {
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.emptyText {
  font-size: 12px;
}

.sidebarFooter {
  padding: 8px 12px;
  border-top: 1px solid #262626;
  background: #0f0f0f;
}

.stats {
  font-size: 10px;
  color: #666;
  text-align: center;
}
</style>