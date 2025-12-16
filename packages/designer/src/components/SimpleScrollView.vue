<template>
  <simplebar :data-simplebar-auto-hide="false">
    <slot />
  </simplebar>
</template>

<script setup lang="ts">
import simplebar from 'simplebar-vue'
import 'simplebar-vue/dist/simplebar.min.css'
</script>

<style>
.simplebar-scrollbar::before {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.simplebar-track.simplebar-vertical {
  width: 8px;
  right: 2px;
}

.simplebar-track.simplebar-horizontal {
  height: 8px;
  bottom: 2px;
}
</style>
