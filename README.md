# Investment Dashboard

智能交易空间 - 实时市场新闻和投资信号看板。

## 功能特性

- 📰 **实时新闻聚合** - 从多个 RSS 源获取市场新闻
- 🗂️ **来源勾选过滤** - 在新闻头部按来源勾选查看，支持中英文来源混合展示
- 📊 **智能信号生成** - 基于新闻内容自动生成投资信号
- 🌐 **多语言支持** - 中英文界面切换
- 🔄 **自动刷新** - 每 5 秒自动更新数据
- 🛠️ **管理台集成** - 一键跳转到管理控制台

## 技术栈

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS + 内联样式
- **API**: RESTful 接口调用

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动

### 生产构建

```bash
npm run build
npm start
```

## 配置说明

### 环境变量

创建 `.env.local` 文件来配置以下环境变量：

```bash
# 管理台 URL
NEXT_PUBLIC_ADMIN_URL=https://smart-trading-admin.vercel.app

# API 基础 URL
NEXT_PUBLIC_API_URL=https://smart-trading-api.vercel.app
```

如果不设置，将使用默认值。

### 默认配置

- **管理台 URL**: `https://smart-trading-admin.vercel.app`（board 默认跳转到线上 admin）
- **API URL**: `https://smart-trading-api.vercel.app`

## 项目结构

```
investment-dashboard/
├── app/
│   ├── layout.tsx      # 根布局
│   ├── page.tsx        # 主页面
│   └── globals.css     # 全局样式
├── lib/
│   └── config.ts       # 配置文件
├── package.json        # 项目配置
├── next.config.ts      # Next.js 配置
├── tsconfig.json       # TypeScript 配置
└── README.md           # 项目文档
```

## 部署

### Vercel 部署

1. 连接 GitHub 仓库
2. 设置环境变量（可选）
3. 部署完成

### 其他平台

参考 Next.js 官方部署文档：[Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)

## 相关项目

- [investment-admin](https://github.com/sky-jiangcheng/smart-trading-admin) - 管理控制台
- [investment-api](https://github.com/sky-jiangcheng/smart-trading-api) - 后端 API 服务

## 许可证

MIT License
