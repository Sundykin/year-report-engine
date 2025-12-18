<template>
  <div class="simpleScrollView">
    <slot />
  </div>
</template>

<style scoped>
.simpleScrollView {
  height: 100%;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 自定义滚动条样式 */
.simpleScrollView::-webkit-scrollbar {
  width: 6px;
}

.simpleScrollView::-webkit-scrollbar-track {
  background: transparent;
}

.simpleScrollView::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.simpleScrollView::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
