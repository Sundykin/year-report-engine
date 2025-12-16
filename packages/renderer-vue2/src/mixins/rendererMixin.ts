import Vue from 'vue'
import type { DataSourceManager } from '@year-report/core'

// 渲染器混入，提供数据源访问等通用功能
Vue.extend({
  inject: {
    dataManager: {
      default: null
    },
    dataVersion: {
      default: 0
    }
  },

  methods: {
    // 获取数据源管理器
    getDataManager(): DataSourceManager | null {
      return this.dataManager as DataSourceManager | null
    },

    // 解析数据绑定
    resolveContent(content: string): string {
      const dataManager = this.getDataManager()
      if (!dataManager || !content) return content
      return dataManager.resolve(content)
    }
  }
})

export const rendererMixin = Vue.extend({
  inject: {
    dataManager: {
      default: null
    },
    dataVersion: {
      default: 0
    }
  },

  methods: {
    // 获取数据源管理器
    getDataManager(): DataSourceManager | null {
      return this.dataManager as DataSourceManager | null
    },

    // 解析数据绑定
    resolveContent(content: string): string {
      const dataManager = this.getDataManager()
      if (!dataManager || !content) return content
      return dataManager.resolve(content)
    }
  }
})