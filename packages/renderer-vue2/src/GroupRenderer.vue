<template>
  <div class="groupWrapper" :style="wrapperStyle">
    <ElementRenderer
      v-for="el in elements"
      :key="el.id"
      :element="el"
      :page-index="pageIndex"
      :is-active="isActive"
      :offset-x="-bounds.x"
      :offset-y="-bounds.y"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import type { H5Element } from '@year-report/core'
import ElementRenderer from './ElementRenderer.vue'

interface GroupBounds {
  x: number
  y: number
  width: number
  height: number
}

export default Vue.extend({
  name: 'GroupRenderer',

  components: {
    ElementRenderer
  },

  props: {
    elements: {
      type: Array as () => H5Element[],
      required: true
    },
    bounds: {
      type: Object as () => GroupBounds,
      required: true
    },
    rotation: {
      type: Number,
      default: 0
    },
    pageIndex: {
      type: Number,
      required: true
    },
    isActive: {
      type: Boolean,
      required: true
    }
  },

  computed: {
    wrapperStyle(): any {
      return {
        position: 'absolute',
        left: `${this.bounds.x}px`,
        top: `${this.bounds.y}px`,
        width: `${this.bounds.width}px`,
        height: `${this.bounds.height}px`,
        transform: this.rotation ? `rotate(${this.rotation}deg)` : undefined,
        transformOrigin: 'center center'
      }
    }
  }
})
</script>

<style scoped>
.groupWrapper {
  pointer-events: none;
}
</style>