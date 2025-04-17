# 诗词意象分析系统

## 项目简介
诗词意象分析系统是由天津大学汉语言文学专业诗词意象分析团队开发的一个基于现代Web技术的诗词分析平台。该系统能够自动识别诗词中的意象，分析情感倾向，并可视化展示意象之间的关系。系统采用先进的自然语言处理技术和AI模型，为诗词研究提供智能化的分析工具。

## 功能特点
- 意象自动识别与分类
- 情感倾向分析
- 意象关系网络可视化
- 诗词数据统计与分析
- 自定义分析规则
- 批量处理功能

## 技术栈
- 前端：React + TypeScript + ECharts + D3.js
- 后端：Node.js + Express
- 数据库：MongoDB + Redis
- AI模型：Deepseek API
- 部署：Netlify + Docker

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- MongoDB >= 4.4
- Redis >= 6.0

### 安装步骤
1. 克隆项目
```bash
git clone https://github.com/your-username/poem-analysis.git
cd poem-analysis
```

2. 安装依赖
```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

3. 配置环境变量
```bash
# 前端环境变量
cp frontend/.env.example frontend/.env

# 后端环境变量
cp backend/.env.example backend/.env
```

4. 启动服务
```bash
# 启动前端服务
cd frontend
npm start

# 启动后端服务
cd ../backend
npm start
```

## 项目结构
```
poem-analysis/
├── frontend/              # 前端代码
│   ├── src/              # 源代码
│   ├── public/           # 静态资源
│   └── package.json      # 前端依赖
├── backend/              # 后端代码
│   ├── src/             # 源代码
│   ├── config/          # 配置文件
│   └── package.json     # 后端依赖
└── docs/                # 文档
    └── techno.md        # 技术文档
```

## 在线演示
系统已部署在 Netlify，访问地址：
https://sweet-palmier-4c55b2.netlify.app/

## 技术文档
详细的技术实现原理请参考 [技术文档](docs/techno.md)

## 贡献指南
1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request


## 联系方式
- 项目团队：天津大学汉语言文学专业诗词意象分析团队
- 联系邮箱：pengsquare82@gmail.com
- 项目链接：[https://github.com/psq2006/poem-analysis]
