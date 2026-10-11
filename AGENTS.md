# 项目上下文

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
│   ├── build.sh            # 构建脚本
│   ├── dev.sh              # 开发环境启动脚本
│   ├── prepare.sh          # 预处理脚本
│   └── start.sh            # 生产环境启动脚本
├── src/
│   ├── app/                # 页面路由与布局
│   ├── components/ui/      # Shadcn UI 组件库
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具库
│   │   └── utils.ts        # 通用工具函数 (cn)
│   └── server.ts           # 自定义服务端入口
├── next.config.ts          # Next.js 配置
├── package.json            # 项目依赖管理
└── tsconfig.json           # TypeScript 配置
```

- 项目文件（如 app 目录、pages 目录、components 等）默认初始化到 `src/` 目录下。

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。
**常用命令**：
- 安装依赖：`pnpm add <package>`
- 安装开发依赖：`pnpm add -D <package>`
- 安装所有依赖：`pnpm install`
- 移除依赖：`pnpm remove <package>`

## 开发规范

### 编码规范

- 默认按 TypeScript `strict` 心智写代码；优先复用当前作用域已声明的变量、函数、类型和导入，禁止引用未声明标识符或拼错变量名。
- 禁止隐式 `any` 和 `as any`；函数参数、返回值、解构项、事件对象、`catch` 错误在使用前应有明确类型或先完成类型收窄，并清理未使用的变量和导入。

### next.config 配置规范

- 配置的路径不要写死绝对路径，必须使用 path.resolve(__dirname, ...)、import.meta.dirname 或 process.cwd() 动态拼接。

### Hydration 问题防范

1. 严禁在 JSX 渲染逻辑中直接使用 typeof window、Date.now()、Math.random() 等动态数据。**必须使用 'use client' 并配合 useEffect + useState 确保动态内容仅在客户端挂载后渲染**；同时严禁非法 HTML 嵌套（如 <p> 嵌套 <div>）。
2. **禁止使用 head 标签**，优先使用 metadata，详见文档：https://nextjs.org/docs/app/api-reference/functions/generate-metadata
   1. 三方 CSS、字体等资源可在 `globals.css` 中顶部通过 `@import` 引入或使用 next/font
   2. preload, preconnect, dns-prefetch 通过 ReactDOM 的 preload、preconnect、dns-prefetch 方法引入
   3. json-ld 可阅读 https://nextjs.org/docs/app/guides/json-ld

## UI 设计与组件规范 (UI & Styling Standards)

- 模板默认预装核心组件库 `shadcn/ui`，位于`src/components/ui/`目录下
- Next.js 项目**必须默认**采用 shadcn/ui 组件、风格和规范，**除非用户指定用其他的组件和规范。**

## 项目功能说明

### 人生管理面板 (Life Dashboard)

主页面是一个完整的单页应用，位于 `public/dashboard.html`，通过 `next.config.ts` 中的 rewrite 规则将 `/` 重写到 `/dashboard.html`。

功能模块：
- **总览 (Dashboard)**：统计卡片、目标金字塔、今日聚焦、OKR 进度环
- **人生目标 (Goals)**：长期目标管理，支持分类筛选（事业/健康/家庭/成长/财务/兴趣/其他）
- **OKR 看板**：季度目标与关键结果管理，实时进度调整
- **今日待办 (Todo)**：每日任务清单，支持优先级排序
- **杂想沉淀 (Thoughts)**：灵感/反思/笔记记录，支持搜索和标签

### 云端同步 API

数据通过 Supabase 实现云端同步，支持跨设备共享。

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/sync/generate` | POST | 生成新的同步码（格式：XXXX-XXXX-XXXX） |
| `/api/sync/load` | GET | 根据 `sync_code` 查询参数加载云端数据 |
| `/api/sync/save` | POST | 保存数据到云端，body: `{ sync_code, content }` |

同步流程：
1. 用户点击「创建新同步」生成同步码，数据自动上传到云端
2. 在其他设备输入同步码连接，拉取云端数据
3. 每次本地编辑后自动 debounce 保存到云端（1.2s 延迟）
4. 同步码存储在 localStorage，刷新页面后自动恢复同步状态

### 数据库

- 表 `dashboard_sync`：存储每个同步码对应的 JSON 数据
- 使用 Supabase service_role_key 绕过 RLS（场景 A）
