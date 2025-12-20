<template>
  <div class="eventList">
    <div v-for="(event, eventIndex) in events" :key="eventIndex" class="eventItem">
      <div class="eventHeader">
        <select v-model="event.trigger" class="triggerSelect" @change="emitUpdate">
          <option v-for="t in triggers" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
        <button class="removeEventBtn" @click="removeEvent(eventIndex)">×</button>
      </div>

      <div class="actionList">
        <div v-for="(action, actionIndex) in event.actions" :key="actionIndex" class="actionItem">
          <select v-model="action.type" class="actionSelect" @change="emitUpdate">
            <option v-for="at in actionTypes" :key="at.value" :value="at.value">{{ at.label }}</option>
          </select>

          <!-- 跳转链接 -->
          <template v-if="action.type === 'navigate'">
            <input v-model="action.url" placeholder="URL" class="actionInput" @input="emitUpdate" />
            <label class="checkLabel">
              <input type="checkbox" v-model="action.openInNew" @change="emitUpdate" />
              新窗口
            </label>
          </template>

          <!-- 切换页面 -->
          <template v-else-if="action.type === 'page'">
            <select v-model="action.pageId" class="actionSelect" @change="emitUpdate">
              <option value="">选择页面</option>
              <option v-for="p in pages" :key="p.id" :value="p.id">{{ p.name || p.id }}</option>
            </select>
          </template>

          <!-- 拨打电话/发送邮件 -->
          <template v-else-if="action.type === 'call' || action.type === 'email'">
            <input
              v-model="action.value"
              :placeholder="action.type === 'call' ? '电话号码' : '邮箱地址'"
              class="actionInput"
              @input="emitUpdate"
            />
          </template>

          <!-- 触发动画 -->
          <template v-else-if="action.type === 'animation'">
            <select v-model="action.targetElementId" class="actionSelect" @change="emitUpdate">
              <option value="">选择元素</option>
              <option v-for="el in elements" :key="el.id" :value="el.id">{{ el.name || el.id }}</option>
            </select>
          </template>

          <!-- 切换显示 -->
          <template v-else-if="action.type === 'toggle'">
            <select v-model="action.toggleElementId" class="actionSelect" @change="emitUpdate">
              <option value="">选择元素</option>
              <option v-for="el in elements" :key="el.id" :value="el.id">{{ el.name || el.id }}</option>
            </select>
          </template>

          <!-- 自定义代码 -->
          <template v-else-if="action.type === 'custom'">
            <textarea
              v-model="action.customCode"
              placeholder="JavaScript代码"
              class="codeInput"
              @input="emitUpdate"
            />
          </template>

          <button class="removeActionBtn" @click="removeAction(eventIndex, actionIndex)">×</button>
        </div>
        <button class="addActionBtn" @click="addAction(eventIndex)">+ 添加动作</button>
      </div>
    </div>
    <button class="addEventBtn" @click="addEvent">+ 添加事件</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ElementEvent } from '@year-report/core'

interface Props {
  modelValue?: ElementEvent[]
  triggers?: { value: string; label: string }[]
  actionTypes?: { value: string; label: string }[]
  pages?: { id: string; name?: string }[]
  elements?: { id: string; name?: string }[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  triggers: () => [],
  actionTypes: () => [],
  pages: () => [],
  elements: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: ElementEvent[]]
}>()

const events = ref<ElementEvent[]>([...props.modelValue])

watch(() => props.modelValue, (val) => {
  events.value = val ? [...val] : []
}, { deep: true })

const emitUpdate = () => {
  emit('update:modelValue', [...events.value])
}

const addEvent = () => {
  events.value.push({
    trigger: 'click',
    actions: []
  })
  emitUpdate()
}

const removeEvent = (index: number) => {
  events.value.splice(index, 1)
  emitUpdate()
}

const addAction = (eventIndex: number) => {
  events.value[eventIndex].actions.push({
    type: 'navigate',
    url: ''
  })
  emitUpdate()
}

const removeAction = (eventIndex: number, actionIndex: number) => {
  events.value[eventIndex].actions.splice(actionIndex, 1)
  emitUpdate()
}
</script>

<style scoped>
.eventList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.eventItem {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 8px;
}

.eventHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.triggerSelect {
  background: #262626;
  border: 1px solid #404040;
  border-radius: 4px;
  padding: 4px 8px;
  color: #fff;
  font-size: 12px;
}

.removeEventBtn, .removeActionBtn {
  background: rgba(220, 38, 38, 0.2);
  border: none;
  color: #dc2626;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.actionList {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.actionItem {
  display: flex;
  gap: 4px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.actionSelect, .actionInput {
  flex: 1;
  min-width: 80px;
  background: #171717;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 4px 6px;
  color: #fff;
  font-size: 11px;
}

.checkLabel {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #999;
  white-space: nowrap;
}

.codeInput {
  flex: 1;
  min-width: 100%;
  background: #171717;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 6px;
  color: #fff;
  font-size: 11px;
  font-family: monospace;
  resize: vertical;
  min-height: 60px;
}

.addActionBtn {
  background: transparent;
  border: 1px dashed #404040;
  color: #666;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
}

.addEventBtn {
  background: #262626;
  border: 1px dashed #404040;
  color: #737373;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
}

.addEventBtn:hover, .addActionBtn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}
</style>
