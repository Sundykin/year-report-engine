<template>
  <div class="conditionRules">
    <div v-for="(rule, index) in rules" :key="index" class="ruleItem">
      <select v-model="rule.sourceId" class="ruleSelect" @change="emitUpdate">
        <option value="">选择数据源</option>
        <option v-for="ds in dataSources" :key="ds.id" :value="ds.id">{{ ds.name }}</option>
      </select>
      <input
        v-model="rule.field"
        placeholder="字段路径"
        class="ruleInput"
        @input="emitUpdate"
      />
      <select v-model="rule.operator" class="ruleSelect" @change="emitUpdate">
        <option v-for="op in operators" :key="op.value" :value="op.value">{{ op.label }}</option>
      </select>
      <input
        v-if="!['empty', 'notEmpty'].includes(rule.operator)"
        v-model="rule.value"
        placeholder="比较值"
        class="ruleInput"
        @input="emitUpdate"
      />
      <button class="removeBtn" @click="removeRule(index)">×</button>
    </div>
    <button class="addBtn" @click="addRule">+ 添加条件</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ConditionRule, ConditionOperator } from '@year-report/core'

interface Props {
  modelValue?: ConditionRule[]
  dataSources?: { id: string; name: string }[]
  operators?: { value: ConditionOperator; label: string }[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  dataSources: () => [],
  operators: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: ConditionRule[]]
}>()

const rules = ref<ConditionRule[]>([...props.modelValue])

watch(() => props.modelValue, (val) => {
  rules.value = [...val]
}, { deep: true })

const emitUpdate = () => {
  emit('update:modelValue', [...rules.value])
}

const addRule = () => {
  rules.value.push({
    sourceId: '',
    field: '',
    operator: 'eq',
    value: ''
  })
  emitUpdate()
}

const removeRule = (index: number) => {
  rules.value.splice(index, 1)
  emitUpdate()
}
</script>

<style scoped>
.conditionRules {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ruleItem {
  display: flex;
  gap: 4px;
  align-items: center;
}

.ruleSelect {
  flex: 1;
  min-width: 0;
  background: #171717;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 4px;
  color: #fff;
  font-size: 11px;
}

.ruleInput {
  flex: 1;
  min-width: 0;
  background: #171717;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 4px 6px;
  color: #fff;
  font-size: 11px;
}

.removeBtn {
  background: rgba(220, 38, 38, 0.2);
  border: none;
  color: #dc2626;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}

.addBtn {
  background: #262626;
  border: 1px dashed #404040;
  color: #737373;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
}

.addBtn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}
</style>
