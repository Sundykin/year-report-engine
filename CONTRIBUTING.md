# Contributing to Year Report Engine

感谢你对 Year Report Engine 的关注！我们欢迎各种形式的贡献。

Thank you for your interest in Year Report Engine! We welcome all kinds of contributions.

## 开发环境设置 / Development Setup

### 环境要求 / Prerequisites

- Node.js >= 18
- pnpm >= 8

### 安装步骤 / Installation

```bash
# 克隆仓库 / Clone the repository
git clone https://github.com/user/year-report-engine.git
cd year-report-engine

# 安装依赖 / Install dependencies
pnpm install

# 启动开发服务器 / Start development server
pnpm dev
```

## 项目结构 / Project Structure

```
packages/
├── core/           # 核心类型和工具 / Core types and utilities
├── designer/       # Vue 3 设计器 / Vue 3 Designer
├── renderer-vue3/  # Vue 3 渲染器 / Vue 3 Renderer
├── renderer-vue2/  # Vue 2 渲染器 / Vue 2 Renderer
└── renderer-react/ # React 渲染器 / React Renderer
```

## 开发流程 / Development Workflow

### 1. 创建分支 / Create a Branch

```bash
git checkout -b feature/your-feature-name
# 或 / or
git checkout -b fix/your-bug-fix
```

### 2. 开发 / Development

- 遵循现有的代码风格 / Follow existing code style
- 使用 TypeScript 编写代码 / Write code in TypeScript
- 确保代码通过类型检查 / Ensure code passes type checking

```bash
# 类型检查 / Type check
pnpm run build:core
```

### 3. 提交 / Commit

我们使用约定式提交规范 / We use Conventional Commits:

```
feat: 添加新功能 / Add new feature
fix: 修复 bug / Fix bug
docs: 更新文档 / Update documentation
style: 代码格式调整 / Code style changes
refactor: 代码重构 / Code refactoring
perf: 性能优化 / Performance improvement
test: 添加测试 / Add tests
chore: 构建/工具变更 / Build/tool changes
```

示例 / Examples:
```bash
git commit -m "feat: add progress bar component"
git commit -m "fix: resolve animation timing issue"
git commit -m "docs: update README installation guide"
```

### 4. 提交 Pull Request / Submit Pull Request

1. 推送分支到远程 / Push your branch
   ```bash
   git push origin feature/your-feature-name
   ```

2. 在 GitHub 上创建 Pull Request / Create a Pull Request on GitHub

3. 填写 PR 描述，包括：/ Fill in the PR description, including:
   - 变更说明 / Description of changes
   - 相关 Issue（如有）/ Related issues (if any)
   - 测试方法 / How to test

## 代码规范 / Code Guidelines

### TypeScript

- 使用严格模式 / Use strict mode
- 为公共 API 添加类型注释 / Add type annotations for public APIs
- 避免使用 `any` / Avoid using `any`

### Vue 组件

- 使用 `<script setup>` 语法 / Use `<script setup>` syntax
- Props 使用 TypeScript 类型定义 / Define props with TypeScript types
- 组件名使用 PascalCase / Use PascalCase for component names

### CSS

- 使用 scoped 样式 / Use scoped styles
- 类名使用小驼峰 / Use camelCase for class names
- 避免深层嵌套 / Avoid deep nesting

## 添加新组件 / Adding New Components

1. 在 `packages/core/src/types.ts` 中定义组件类型 / Define component type in types.ts
2. 在设计器中添加组件面板入口 / Add component panel entry in designer
3. 在设计器中实现属性面板 / Implement properties panel in designer
4. 在各渲染器中实现渲染逻辑 / Implement rendering logic in each renderer

## 报告问题 / Reporting Issues

提交 Issue 时请包含：/ When submitting an issue, please include:

- 问题描述 / Problem description
- 复现步骤 / Steps to reproduce
- 期望行为 / Expected behavior
- 实际行为 / Actual behavior
- 环境信息（浏览器、Node 版本等）/ Environment info (browser, Node version, etc.)

## 许可证 / License

通过贡献代码，你同意你的贡献将按照 MIT 许可证进行授权。

By contributing, you agree that your contributions will be licensed under the MIT License.

---

再次感谢你的贡献！/ Thank you again for your contribution!
