import Vue from 'vue'
import YearReportRenderer from './YearReportRenderer.vue'
import ElementRenderer from './ElementRenderer.vue'
import GroupRenderer from './GroupRenderer.vue'

// 导出组件
export { YearReportRenderer, ElementRenderer, GroupRenderer }

// 安装插件方法
const install = function(vue: typeof Vue) {
  vue.component('YearReportRenderer', YearReportRenderer)
  vue.component('ElementRenderer', ElementRenderer)
  vue.component('GroupRenderer', GroupRenderer)
}

// 默认导出
export default {
  install,
  YearReportRenderer,
  ElementRenderer,
  GroupRenderer
}

// 自动安装
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}