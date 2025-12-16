# 项目结构说明

## 目录结构

```
year-report-engine/
├── packages/                          # 核心包目录
│   ├── core/                         # @year-report/core
│   │   ├── src/
│   │   │   ├── types.ts             # 类型定义（框架无关）
│   │   │   ├── constants.ts         # 常量定义
│   │   │   ├── utils.ts             # 工具函数
│   │   │   └── index.ts             # 导出入口
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── renderer-vue3/                # @year-report/renderer-vue3
│   │   ├── src/
│   │   │   ├── YearReportRenderer.vue    # 主渲染器组件
│   │   │   ├── ElementRenderer.vue        # 元素渲染组件
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── renderer-vue2/                # @year-report/renderer-vue2
│   │   ├── src/
│   │   │   ├── YearReportRenderer.vue
│   │   │   ├── ElementRenderer.vue
│   │   │   └── index.js
│   │   └── package.json
│   │
│   ├── renderer-react/               # @year-report/renderer-react
│   │   ├── src/
│   │   │   └── index.tsx
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── designer/                     # @year-report/designer
│       ├── src/
│       │   ├── YearReportDesigner.vue    # 设计器主组件
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── examples/                         # 示例项目
│   └── designer-app/                # 设计器示例应用
│       ├── src/
│       │   ├── App.vue
│       │   └── main.ts
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
│
├── package.json                      # 根配置
├── pnpm-workspace.yaml              # Monorepo配置
├── README.md                        # 项目文档
└── .gitignore
```

## 包依赖关系

```
designer → renderer-vue3 → core
renderer-vue3 → core
renderer-vue2 → core
renderer-react → core
```

## 核心包说明

### @year-report/core

框架无关的核心包，包含：
- 类型定义 (ProjectData, H5Page, H5Element等)
- 常量定义 (画布尺寸、默认数据等)
- 工具函数 (ID生成、动画样式生成等)

### @year-report/renderer-vue3

Vue3渲染器，特点：
- 使用Composition API
- 使用ECharts渲染图表
- 支持触摸和鼠标事件
- 完整动画系统

### @year-report/renderer-vue2

Vue2渲染器，特点：
- 使用Options API
- 兼容Vue 2.7+
- 与Vue3渲染器功能一致

### @year-report/renderer-react

React渲染器，特点：
- 使用React Hooks
- 使用Recharts渲染图表
- 与Vue渲染器功能一致

### @year-report/designer

Vue3可视化设计器，功能：
- 拖拽编辑
- 组件库面板
- 属性编辑面板
- 页面管理
- 导出功能

## 数据流

1. **设计阶段**
   ```
   用户操作 → Designer组件 → 更新ProjectData → 实时预览
   ```

2. **预览/发布阶段**
   ```
   ProjectData (JSON) → Renderer组件 → 渲染H5页面
   ```

3. **导出流程**
   ```
   ProjectData → 下载资源 → 打包ZIP → 下载
   ```

## 开发流程

### 1. 安装依赖

```bash
pnpm install
```

### 2. 开发调试

```bash
# 启动设计器示例
pnpm dev

# 或者指定端口
pnpm --filter example-designer-app dev
```

### 3. 构建发布

```bash
# 构建所有包
pnpm build:all

# 或单独构建
pnpm build:core
pnpm build:renderer-vue3
pnpm build:designer
```

### 4. 新增渲染器框架

如果要支持新的框架（如Svelte、Angular等）：

1. 在 `packages/` 下创建新包目录
2. 依赖 `@year-report/core`
3. 实现相同的组件接口
4. 使用对应框架的语法重写渲染逻辑

## 关键接口

### 渲染器Props

所有渲染器都应该接受以下props：

```typescript
interface RendererProps {
  data: ProjectData      // 必需：项目数据
  onClose?: () => void   // 可选：关闭回调
}
```

### 设计器Props

```typescript
interface DesignerProps {
  project: ProjectData             // 必需：项目数据（双向绑定）
  onPreview?: () => void          // 可选：预览回调
}
```

## 注意事项

1. **类型安全**: 所有包都应该从 `@year-report/core` 导入类型
2. **框架隔离**: core包不应该依赖任何UI框架
3. **样式隔离**: 每个组件使用scoped样式，避免样式污染
4. **资源处理**: 导出时自动下载并打包外部资源
5. **动画系统**: 使用CSS关键帧动画，在渲染器中动态注入

## 扩展建议

### 新增组件类型

1. 在 `packages/core/src/types.ts` 中添加新类型
2. 在各个渲染器中实现渲染逻辑
3. 在设计器中添加组件选项

### 新增动画效果

1. 在 `packages/core/src/constants.ts` 中添加动���类型
2. 在 `packages/core/src/utils.ts` 中添加CSS关键帧
3. 渲染器会自动支持

### 集成AI能力

参考原React版本的 `geminiService.ts`，可以添加：
- AI文案生成
- AI图片生成
- AI配色建议
