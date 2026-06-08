# 商业楼宇设备报修管理系统

基于 Vue 3 + TypeScript + Ant Design Vue + Node.js + Express + SQLite/MySQL 的商业楼宇设备报修管理系统。

## 技术栈

### 前端
- Vue 3 (Composition API)
- TypeScript
- Ant Design Vue 4.x
- Vue Router
- Pinia
- Axios
- Vite
- Vitest

### 后端
- Node.js
- Express
- TypeScript
- SQLite (默认，开发用) / MySQL (生产用)
- Jest

## 功能模块

1. **报修工单列表** - 展示所有工单（工单编号、紧急程度、设备位置、维修进度、责任人）
2. **高级筛选** - 支持楼层、设备类型、工单状态、紧急程度、关键词多条件组合筛选
3. **工单详情** - 查看工单完整信息，更新处理备注，变更状态，指派责任人
4. **维修记录** - 完整记录工单处理流程的时间线

## 数据库设计

- `users` - 用户表（物业管理人员、工程师等）
- `devices` - 设备信息表
- `repair_tickets` - 报修工单表
- `repair_records` - 维修记录表

MySQL 数据库连接密码: `password`

## 目录结构

```
label-005/
├── client/                # 前端项目
│   ├── src/
│   │   ├── api/           # API 接口
│   │   ├── __tests__/     # 前端测试
│   │   ├── router/        # 路由配置
│   │   ├── styles/        # 全局样式
│   │   ├── types/         # 类型定义
│   │   ├── views/         # 页面组件
│   │   ├── App.vue
│   │   └── main.ts
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── server/                # 后端项目
│   ├── sql/               # MySQL 初始化脚本
│   ├── src/
│   │   ├── __tests__/     # 后端测试
│   │   ├── config/        # 配置
│   │   ├── database/      # 数据库初始化
│   │   ├── routes/        # API 路由
│   │   ├── services/      # 业务逻辑
│   │   ├── types/         # 类型定义
│   │   ├── utils/         # 工具函数
│   │   └── index.ts
│   ├── data/              # SQLite 数据文件
│   └── package.json
└── package.json           # 根配置
```

## 快速开始

### 1. 安装依赖

```bash
cd label-005
npm run install:all
```

### 2. 启动开发服务

同时启动前后端：

```bash
npm run dev
```

或分别启动：

```bash
# 后端 (端口 3001)
cd server && npm run dev

# 前端 (端口 5173)
cd client && npm run dev
```

### 3. 访问系统

打开浏览器访问: http://localhost:5173

## 构建生产版本

```bash
npm run build
```

## 运行测试

```bash
# 全部测试
npm test

# 仅后端测试
cd server && npm test

# 仅前端测试
cd client && npm test
```

## Lint 检查

```bash
npm run lint
```
