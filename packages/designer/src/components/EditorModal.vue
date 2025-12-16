<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modalOverlay" @click="close">
      <div class="modalContainer" @click.stop>
        <div class="modalHeader">
          <h3 class="modalTitle">{{ title }}</h3>
          <button @click="close" class="closeBtn">✕</button>
        </div>
        <div class="modalBody">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title: string
}

defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const close = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modalOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.modalContainer {
  background: #0a0a0a;
  border: 1px solid #262626;
  border-radius: 8px;
  width: 90vw;
  height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modalHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #262626;
}

.modalTitle {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.closeBtn {
  background: transparent;
  border: none;
  color: #737373;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
  transition: color 0.2s;
}

.closeBtn:hover {
  color: white;
}

.modalBody {
  flex: 1;
  padding: 20px;
  overflow: auto;
}
</style>
