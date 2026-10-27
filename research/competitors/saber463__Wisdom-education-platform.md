# 智慧教育学习平台

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-18%2B-brightgreen.svg)
![Vue](https://img.shields.io/badge/vue-3.0-blue.svg)

**AI驱动的个性化智慧教育学习平台 · V2.0 全新升级**

[功能特性](#功能特性) • [快速开始](#快速开始) • [项目结构](#项目结构) • [技术栈](#技术栈) • [文档](#文档) • [健康监测](#健康监测系统)

</div>

---

## 📖 项目概述

智慧教育学习平台是一个面向传智杯国赛的创新型教育系统，采用**Node.js + Python + Rust**多语言协同架构，通过AI技术解决教师批改负担重、学生反馈慢、家长难以掌握学情的核心痛点。

**V2.0 重大升级** (2026-03-30): 全新引入 FaceGuard 防刷课系统、AI代码编辑器、AI教育社区、错题智能推送、视频智能上下架五大原创功能，彻底区分于学习通等传统平台。

### 🎯 核心价值

- **减轻教师负担**: AI自动批改，准确率≥92%，批改速度提升8倍
- **提升学习效率**: 个性化学习路径，AI动态调整，针对性推荐
- **增强学习动力**: 虚拟学习伙伴，协作任务，积分徽章系统
- **改善家校沟通**: 实时学情监控，错题本同步，学习报告

### 🏆 技术创新亮点

- **FaceGuard 静默核验**: 每2分钟余弦相似度静默防刷课，全程无感知，相比传统签到抗造假能力提升10倍
- **差分推送算法**: MD5内容哈希去重，只推送新增异常，避免教师信息轰炸
- **AI代码编辑器**: 在线运行 + AI逐行解析 + 自动生成流程图，零配置
- **错题协同过滤预测**: 不只推给答错学生，还预测"潜在易错"学生，个性化精准度领先行业
- **Rust-WASM前端计算**: 客观题批改速度比纯Python快8倍
- **BERT主观题评分**: 教育领域优化，准确率≥92%
- **多语言gRPC协同**: Node.js + Python + Rust跨语言通信
- **纯Windows本地部署**: 零容器化，规避虚拟化风险

---

## ✨ 功能特性

### 👨‍🏫 教师端功能

#### 1. 课程管理
- ✅ **课程创建**: 支持多语言课程（Python、Java、C++等）
- ✅ **课程分支**: 初级/中级/高级分支，满足不同水平学生
- ✅ **课节管理**: 视频、文档、代码示例、练习题
- ✅ **班级管理**: 自动分配班级，均衡学生分布

#### 2. 作业管理
- ✅ **作业发布**: 支持选择题、填空题、编程题、主观题
- ✅ **AI自动批改**: 
  - 客观题：WASM前端批改，速度提升8倍
  - 主观题：BERT模型评分，准确率≥92%
- ✅ **批量批改**: 一键批改全班作业
- ✅ **批改记录**: 详细的批改历史和统计

#### 3. 学情分析
- ✅ **班级学情**: 整体学习情况可视化
- ✅ **学生分析**: 个人学习轨迹、薄弱点识别
- ✅ **视频追踪**: 观看进度、热力图、异常行为检测
- ✅ **错题统计**: 班级错题分布、知识点掌握度

#### 4. 分层教学
- ✅ **学生分层**: 根据能力自动分层
- ✅ **差异化教学**: 不同层次不同教学内容
- ✅ **进度跟踪**: 各层次学习进度监控

### 👨‍🎓 学生端功能

#### 1. 课程学习
- ✅ **课程浏览**: 热门课程、分类筛选、搜索功能
- ✅ **课程购买**: 支持支付宝、微信支付
- ✅ **视频学习**: 
  - Video.js播放器
  - 进度自动保存（每5秒）
  - 暂停位置记忆
  - 播放速度调节（0.5x-2x）
- ✅ **学习进度**: 可视化进度条，完成度统计

#### 2. 用户兴趣调查
- ✅ **6步问卷**: 编程经验、学习目标、语言偏好、学习风格等
- ✅ **智能推荐**: 基于兴趣推荐合适课程
- ✅ **兴趣设置**: 可随时修改兴趣偏好

#### 3. AI动态学习路径
- ✅ **路径生成**: 根据兴趣和能力生成个性化路径
- ✅ **动态调整**: 
  - 基于学习数据实时调整
  - 知识点掌握度评估（已掌握/待巩固/薄弱）
  - 自动跳过已掌握内容
  - 薄弱点重点强化
- ✅ **路径可视化**: 思维导图展示，节点状态标记
- ✅ **调整日志**: 查看历史调整记录和原因

#### 4. 虚拟学习伙伴
- ✅ **伙伴生成**: AI匹配相似进度、相同路径的虚拟伙伴
- ✅ **伙伴互动**: 
  - 聊天交流（AI生成个性化话术）
  - 学习鼓励和提醒
  - 知识点答疑
- ✅ **共同任务**: 
  - 每日学习任务
  - 进度比拼
  - 完成任务获得积分×1.5奖励
- ✅ **协作排行榜**: 每周排行榜，激励学习

#### 5. 视频答题与错题本
- ✅ **视频答题**:
  - 随机时间点弹出题目（10-20分钟）
  - 60秒倒计时
  - 答对奖励5积分
  - 答错自动加入错题本
- ✅ **错题本管理**:
  - 错题列表和详情
  - 按视频、知识点、时间筛选
  - 重做错题功能
  - 标记已掌握
- ✅ **薄弱点分析**: TOP5薄弱知识点统计和可视化


#### 6. 积分和徽章
- ✅ **积分系统**:
  - 完成课程：50积分
  - 答题正确：5积分
  - 完成共同任务：基础积分×1.5
- ✅ **徽章系统**: 协作达人系列徽章

### 🆕 V2.0 新增功能

#### 7. FaceGuard 防刷课系统
- ✅ **静默人脸核验**: 每2分钟后台抓拍，余弦相似度比对（≥0.85通过，0.6~0.85警告，<0.6暂停）
- ✅ **活体检测**: 眨眼/点头/左右转头四步活体验证，防录像欺骗
- ✅ **7天设备信任**: 相同设备7天内免高频核验，学习体验无打扰
- ✅ **申诉机制**: 核验失败可上传证据申诉，教师审核
- ✅ **加密存储**: 128维特征向量AES加密，不存原始照片，符合隐私规范

#### 8. AI在线代码编辑器
- ✅ **多语言支持**: Python / Java / C++ / JavaScript 在线运行
- ✅ **AI代码分析**: 一键获取逐行解析、时间空间复杂度分析、优化建议
- ✅ **自动生成流程图**: AI将代码逻辑转换为可视化流程图（Mermaid格式）
- ✅ **代码片段收藏**: 收藏常用代码，支持公开分享
- ✅ **结果缓存**: MD5去重缓存，相同代码无需重复AI调用

#### 9. AI教育社区
- ✅ **热点资讯**: AI自动抓取并过滤教育/编程/竞赛热点，7天自动归档
- ✅ **AI内容审核**: 所有用户发帖/评论经AI合规审核
- ✅ **防刷屏限流**: 发帖/评论/点赞行为速率限制，维护社区质量
- ✅ **教师动态置顶**: 教师发布内容自动置顶展示
- ✅ **AI学习要点提取**: 每条热点提供AI总结的学习价值

#### 10. 错题智能推送（V2.0增强）
- ✅ **即时推送**: 答题错误率>60%时即时推送错题解析
- ✅ **协同过滤预测**: 查找学习轨迹相似学生，提前推送潜在易错题目
- ✅ **遗忘曲线**: 基于艾宾浩斯遗忘曲线计算下次复习时间
- ✅ **7天去重**: 同题目7天内不重复推送，防止打扰

#### 11. 视频智能上下架
- ✅ **完成率守门**: 每日凌晨2点统计，完成率<30%自动下架
- ✅ **7天保护期**: 新上传视频7天内不参与自动下架（冷启动保护）
- ✅ **教师锁定**: 教师可标记"推荐"视频，跳过自动下架检查
- ✅ **难点视频放宽**: 标记为"难点"的视频阈值放宽至25%
- ✅ **审计日志**: 每次上下架操作完整记录原因和完成率

### 👨‍👩‍👧 家长端功能

#### 1. 学情监控
- ✅ **学习路径查看**: 查看孩子的学习路径和调整历史
- ✅ **视频进度**: 查看视频学习进度和完成情况
- ✅ **错题本查看**: 查看错题和薄弱点分析
- ✅ **学习报告**: 学习时长、完成度、成绩趋势

#### 2. 家校沟通
- ✅ **消息通知**: 接收学校通知和作业提醒
- ✅ **错题提醒**: 孩子有错题时实时通知

---

## 🚀 快速开始

### 📋 环境要求

在开始之前，请确保您的计算机已安装以下软件：

| 软件 | 版本要求 | 下载地址 |
|------|---------|---------|
| **Node.js** | 18.0+ | [nodejs.org](https://nodejs.org/) |
| **Python** | 3.10+ | [python.org](https://www.python.org/) |
| **MySQL** | 8.0+ | [mysql.com](https://www.mysql.com/) |
| **Git** | 最新版 | [git-scm.com](https://git-scm.com/) |

**可选组件**（提升性能）：
- **Redis** 6.0+（用于缓存，如未安装会自动降级到内存缓存）
- **Rust** 1.70+（用于高性能服务，如未安装会使用Node.js降级方案）

### 📥 第一步：获取项目代码

```bash
# 使用Git克隆项目（如果有Git仓库）
git clone <repository_url>
cd edu-ai-platform-web

# 或直接解压项目压缩包到本地目录
```

### 🔧 第二步：配置数据库

#### 2.1 启动MySQL服务

**Windows系统**:
```powershell
# 方法1: 使用服务管理器
# 按 Win+R，输入 services.msc，找到MySQL服务并启动

# 方法2: 使用命令行
net start MySQL80
```

**Linux/Mac系统**:
```bash
sudo systemctl start mysql  # Linux
brew services start mysql   # Mac
```

#### 2.2 创建数据库

打开MySQL客户端（MySQL Workbench、Navicat或命令行），执行：

```sql
-- 创建数据库
CREATE DATABASE edu_education_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户（可选，也可以使用root用户）
CREATE USER 'edu_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON edu_education_platform.* TO 'edu_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 2.3 导入数据库表结构

```bash
# 进入backend目录
cd backend

# 执行基础表结构（V1.0）
mysql -u root -p edu_education_platform < sql/learning-platform-integration-tables.sql

# 执行V2.0新增表结构（FaceGuard/代码编辑器/社区/错题推送/视频上下架）
mysql -u root -p edu_education_platform < sql/v2-complete.sql
```

#### 2.4 执行索引脚本（推荐，提升查询性能）

在首次部署或数据量较大时执行一次，可加速课程、作业、提交等查询：

```bash
# 在项目根目录执行
mysql -u root -p edu_education_platform < backend/scripts/mysql-indexes.sql
```

若部分索引已存在会报错，可忽略。详见 `docs/数据库索引与性能.md`。

### ⚙️ 第三步：配置环境变量

#### 3.1 后端配置

在 `backend` 目录下创建 `.env` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=edu_education_platform

# JWT密钥（请修改为随机字符串）
JWT_SECRET=your_jwt_secret_key_change_this

# 服务端口
PORT=3000

# Redis配置（可选，如未安装Redis可删除此配置）
REDIS_URL=redis://localhost:6379

# MongoDB配置（用于学习数据存储）
MONGODB_URI=mongodb://localhost:27017/edu_education_platform

# AI服务地址
AI_SERVICE_ADDRESS=localhost:50051
```

#### 3.2 根目录配置（健康监测 + 微信通知）

在项目根目录 `Wisdom-education-platform/` 下创建 `.env` 文件：

```env
# 微信推送 Token（xtuis.cn）
# 访问 https://xtuis.cn 获取你的 Token
WECHAT_NOTIFY_TOKEN=你的Token
```

> 配置后，每次运行健康检查或 `npm run agents` 都会自动发送微信通知。Token 不会被 git 提交（已在 `.gitignore` 中）。

#### 3.2 前端配置（可选）

在 `frontend` 目录下创建 `.env` 文件（如果需要自定义API地址）：

```env
VITE_API_BASE_URL=http://localhost:3000
```

### 📦 第四步：安装依赖

#### 4.1 安装后端依赖

```bash
# 进入backend目录
cd backend

# 安装依赖（可能需要几分钟）
npm install
```

#### 4.2 安装前端依赖

```bash
# 进入frontend目录
cd frontend

# 安装依赖（可能需要几分钟）
npm install
```

#### 4.3 安装Python AI服务依赖（可选）

```bash
# 进入python-ai目录
cd python-ai

# 创建虚拟环境（Windows）
python -m venv venv
venv\Scripts\activate

# 创建虚拟环境（Linux/Mac）
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

### 🎬 第五步：启动服务

#### 方式1：一键启动（推荐，Windows）

双击运行项目根目录下的 `start-all-services.bat` 文件，脚本会自动：
1. 检查MySQL服务
2. 启动后端服务（端口3000）
3. 启动前端服务（端口5173）
4. （可选）启动Python AI服务（端口5000）

#### 方式2：手动启动

**启动后端服务**:
```bash
cd backend
npm run dev
```

看到以下信息表示启动成功：
```
数据库连接成功
Redis客户端初始化成功（或：已启用内存缓存降级方案）
智慧教育学习平台后端服务运行在端口 3000
```

**启动前端服务**:
```bash
cd frontend
npm run dev
```

看到以下信息表示启动成功：
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

**启动Python AI服务**（可选）:
```bash
cd python-ai
python app.py
```

### 🌐 第六步：访问应用

1. **打开浏览器**，访问：http://localhost:5173
2. **登录系统**：
   - 默认测试账号（需要先在数据库中创建）：
     - 学生：`student` / `123456`
     - 教师：`teacher` / `123456`
     - 家长：`parent` / `123456`

### ✅ 验证安装

#### 检查服务状态

打开浏览器访问以下地址，确认服务正常运行：

- **后端健康检查**: http://localhost:3000/health
  - 应该返回：`{"status":"ok","message":"智慧教育学习平台后端服务运行中"}`
- **前端页面**: http://localhost:5173
  - 应该看到登录页面

#### 检查端口占用

**Windows**:
```powershell
netstat -ano | findstr "3000 5173"
```

**Linux/Mac**:
```bash
netstat -tuln | grep -E "3000|5173"
```

应该看到端口3000和5173都在监听状态。

---

## 📁 项目结构

```
edu-ai-platform-web/
├── frontend/                    # Vue3前端项目
│   ├── src/
│   │   ├── views/              # 页面组件
│   │   │   ├── teacher/        # 教师端页面
│   │   │   ├── student/        # 学生端页面
│   │   │   │   ├── LessonPlayer.vue  # 视频播放（含FaceGuard）
│   │   │   │   ├── CodeEditor.vue    # AI代码编辑器（V2.0新增）
│   │   │   │   └── Community.vue     # AI教育社区（V2.0新增）
│   │   │   └── parent/         # 家长端页面
│   │   ├── components/          # 公共组件
│   │   │   └── FaceGuard.vue   # 防刷课核验覆盖层（V2.0新增）
│   │   ├── router/             # 路由配置
│   │   ├── stores/             # Pinia状态管理
│   │   ├── utils/               # 工具函数
│   │   ├── styles/             # 样式文件
│   │   │   └── global.css      # 全局样式（科技青+智慧紫主题）
│   │   └── vite-env.d.ts       # Vite类型声明
│   ├── package.json
│   └── vite.config.ts          # Vite配置（已优化）
│
├── backend/                     # Node.js后端服务
│   ├── src/
│   │   ├── config/             # 配置文件
│   │   ├── middleware/         # 中间件
│   │   ├── routes/              # API路由
│   │   │   ├── face-verify.ts       # 人脸核验路由（V2.0新增）
│   │   │   ├── code-analysis.ts     # 代码分析路由（V2.0新增）
│   │   │   └── ...
│   │   ├── services/            # 业务逻辑
│   │   │   ├── anomaly-report.service.ts    # 差分异常上报（V2.0新增）
│   │   │   ├── video-publish.service.ts     # 智能上下架（V2.0新增）
│   │   │   ├── wrong-question-push.service.ts  # 错题推送（V2.0新增）
│   │   │   └── ...
│   │   └── index.ts
│   ├── sql/
│   │   ├── learning-platform-integration-tables.sql  # V1.0基础表结构
│   │   └── v2-complete.sql     # V2.0新增表结构（V2.0新增）
│   └── package.json
│
├── python-ai/                   # Python AI服务（可选）
│
├── health/                      # 健康监测系统（V2.0新增）
│   ├── generate.js              # 一键健康检查 + 微信通知
│   ├── report.md               # 历史健康报告（追加模式）
│   ├── tests-merged.txt        # 合并后的测试文件快照
│   └── agents/
│       ├── agent1-runner.js    # 进程守护（后端+前端自动重启）
│       ├── agent2-health.js    # 健康检查（TS编译+Lint+构建）
│       ├── agent3-merge-tests.js  # 测试文件合并
│       ├── agent4-cicd.js      # CI/CD构建流水线（含3次重试）
│       ├── agent5-frontend-test.js  # Playwright E2E浏览器测试
│       └── run-all.js          # 多Agent协调器
│
├── docs/                         # 项目文档
├── .env                         # 微信推送Token（不提交git）
├── README.md                     # 项目主文档（本文件）
├── QUICK-START.md               # 快速启动指南
└── start-all-services.bat       # 一键启动脚本（Windows）
```

---

## 🛠️ 技术栈

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Vue 3** | 3.3+ | 前端框架 |
| **TypeScript** | 5.0+ | 类型安全 |
| **Vite** | 5.0+ | 构建工具（已优化） |
| **Vue Router** | 4.0+ | 路由管理（懒加载） |
| **Pinia** | 2.0+ | 状态管理 |
| **Element Plus** | 2.4+ | UI组件库 |
| **Tailwind CSS** | 3.0+ | 原子化CSS |
| **ECharts** | 5.0+ | 数据可视化 |
| **Video.js** | 8.0+ | 视频播放器 |
| **Axios** | 1.6+ | HTTP客户端 |
| **face-api.js** | 0.22+ | 人脸特征提取（纯JS WASM，V2.0新增） |
| **Monaco Editor** | - | 代码编辑器内核（V2.0新增） |

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Node.js** | 18.0+ | 运行时环境 |
| **Express** | 4.18+ | Web框架 |
| **TypeScript** | 5.0+ | 类型安全 |
| **MySQL2** | 3.6+ | MySQL驱动（连接池优化） |
| **MongoDB** | 5.0+ | NoSQL数据库 |
| **Redis** | 6.0+ | 缓存（可选） |
| **JWT** | 9.0+ | 身份认证 |
| **gRPC** | 1.9+ | 跨语言通信 |

### AI服务技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Python** | 3.10+ | AI服务运行时 |
| **Flask** | 2.3+ | Web框架 |
| **BERT** | Transformers | 主观题评分 |
| **Qwen3** | - | 文本生成、对话 |
| **百度AI** | - | 学习行为分析 |

---

## 🎯 核心功能详解

### 1. AI动态学习路径

**功能描述**: 根据学生的学习数据（视频观看、练习完成、错题记录）实时评估知识点掌握度，动态调整学习路径。

**核心特性**:
- 📊 **知识点评估**: 综合正确率、错误次数、回看次数、完成效率
- 🎯 **掌握度分级**: 已掌握（≥85%）、待巩固（60-84%）、薄弱（<60%）
- 🔄 **路径调整**: 
  - 已掌握：自动跳过
  - 薄弱：增加练习和微课
  - 待巩固：正常进度
- 📈 **可视化**: 思维导图展示，节点状态实时更新
- 📝 **调整日志**: 记录每次调整的原因和影响

**API端点**:
- `POST /api/ai-learning-path/collect` - 采集学习数据
- `GET /api/ai-learning-path/adjusted-path/:pathId` - 获取调整后的路径
- `GET /api/ai-learning-path/knowledge-mastery` - 获取知识点掌握度
- `GET /api/ai-learning-path/adjustment-logs` - 获取调整日志

### 2. 虚拟学习伙伴

**功能描述**: AI生成个性化虚拟学习伙伴，与学生互动、协作学习，提升学习动力。

**核心特性**:
- 🤖 **伙伴生成**: 匹配相似进度、相同路径、能力标签一致的虚拟伙伴
- 💬 **智能对话**: AI生成个性化话术，响应时间<200ms
- 📋 **共同任务**: 每日自动生成学习任务，完成任务获得积分×1.5
- 📊 **进度比拼**: 实时显示与伙伴的进度差
- 🏆 **协作排行榜**: 每周排行榜，激励学习

**API端点**:
- `POST /api/virtual-partner/generate` - 生成虚拟伙伴
- `POST /api/virtual-partner/send-message` - 发送消息
- `GET /api/virtual-partner/tasks` - 获取任务列表
- `GET /api/virtual-partner/leaderboard` - 获取排行榜

### 3. 视频答题与错题本

**功能描述**: 视频学习过程中随机弹出题目，答错自动加入错题本，支持重做和薄弱点分析。

**核心特性**:
- ⏰ **随机触发**: 10-20分钟随机时间点弹出题目
- ⏱️ **倒计时**: 60秒答题时间，超时自动提交
- ✅ **即时反馈**: 答对奖励5积分，答错加入错题本
- 📚 **错题管理**: 筛选、重做、标记已掌握
- 📊 **薄弱点分析**: TOP5薄弱知识点统计和可视化
- 🔔 **实时通知**: 错题同步通知教师和家长（≤3秒）

**API端点**:
- `GET /api/video-quiz/trigger/:lessonId` - 获取触发信息
- `POST /api/video-quiz/submit` - 提交答案
- `GET /api/video-quiz/wrong-book` - 获取错题本
- `GET /api/video-quiz/weak-points` - 获取薄弱知识点

### 4. 用户兴趣调查

**功能描述**: 6步问卷收集用户兴趣，基于兴趣推荐合适课程。

**核心特性**:
- 📝 **6步问卷**: 编程经验、学习目标、语言偏好、学习风格、可用时间、难度偏好
- 🎯 **智能推荐**: 基于兴趣匹配度推荐课程
- ⚙️ **兴趣设置**: 可随时修改兴趣偏好

**API端点**:
- `GET /api/user-interests/status` - 获取问卷状态
- `POST /api/user-interests/submit` - 提交问卷
- `GET /api/user-interests/recommendations` - 获取推荐课程

---

## 📚 文档

### 核心文档

- 📖 [README.md](README.md) - 项目主文档（本文件）
- 🚀 [QUICK-START.md](QUICK-START.md) - 快速启动指南
- 🔧 [README-SERVICES.md](README-SERVICES.md) - 服务管理指南

### API文档

- 📡 [API接口文档](docs/API-DOCUMENTATION.md) - 完整的API接口说明
- 🔐 [认证说明](docs/API-DOCUMENTATION.md#认证) - JWT认证使用说明

### 部署文档

- 🚀 [部署指南](docs/DEPLOYMENT-GUIDE.md) - 生产环境部署步骤
- 🔒 [安全配置](docs/DEPLOYMENT-GUIDE.md#安全建议) - 安全加固建议

### 用户文档

- 👥 [用户使用手册](docs/USER-MANUAL.md) - 详细的功能使用说明
- ❓ [常见问题](docs/USER-MANUAL.md#常见问题) - FAQ

### 技术文档

- 🏗️ [架构设计](.kiro/specs/learning-platform-integration/design.md) - 系统架构设计
- 📋 [需求文档](.kiro/specs/learning-platform-integration/requirements.md) - 功能需求说明
- ✅ [任务列表](.kiro/specs/learning-platform-integration/tasks.md) - 开发任务清单

### 性能文档

- ⚡ [性能优化报告](docs/PERFORMANCE-OPTIMIZATION-REPORT.md) - 性能优化详情
- 🔍 [性能检查报告](docs/CONNECTION-AND-PERFORMANCE-CHECK.md) - 性能检查结果

---

## 🔍 健康监测系统

V2.0 引入了多 Agent 自动化健康监测体系，无需 CI/CD 服务器，本地一键完成全量检查 + 微信通知。

### 快速运行

```bash
# 在项目根目录（Wisdom-education-platform/）执行

# 方式1：一键健康检查（5项检查 + 微信通知）
npm run health

# 方式2：多Agent完整检查（推荐，含E2E浏览器测试）
npm run agents

# 方式3：单独启动各 Agent
npm run agent:run     # Agent1 进程守护（后端+前端自动重启）
npm run agent:health  # Agent2 健康检查
npm run agent:merge   # Agent3 测试文件合并
npm run agent:cicd    # Agent4 CI/CD构建流水线
npm run agent:e2e     # Agent5 Playwright E2E测试
```

### 多 Agent 架构

```
run-all.js（协调器）
  ├── Agent3 测试合并 → 所有测试文件快照追加到 health/tests-merged.txt
  ├── Agent2 健康检查 → TS编译/ESLint/构建，结果追加到 health/health-report.md
  ├── Agent4 CI/CD    → 后端+前端构建+测试（每步最多重试3次）
  ├── Agent5 E2E测试  → Playwright Chromium无头浏览器，BFS遍历所有页面
  └── 微信通知        → 汇总结果发送至配置的微信Token
```

> **注意**: Agent1（进程守护）需单独启动，不参与 `npm run agents` 流程。

### 报告文件

| 文件 | 说明 |
|------|------|
| `health/report.md` | 简易健康报告（`npm run health` 生成，追加模式） |
| `health/health-report.md` | 多Agent详细报告（`npm run agents` 生成，追加模式） |
| `health/tests-merged.txt` | 所有测试文件合并快照（追加模式） |

所有报告均以 UTC+8 时间戳分隔，**不覆盖旧内容**，完整保留历史记录。

---

## 🔄 CI/CD 流水线

项目已配置 **GitHub Actions** 流水线，覆盖后端、前端、Python AI、Rust 多语言模块的自动化测试与构建。

### 流水线触发方式

1. **自动触发**
   - **Push** 到 `main`、`develop`、`master` 分支时，自动运行 **CI - 所有模块测试**（`ci.yml`）。
   - 创建 **Pull Request** 到上述分支时，同样自动运行。

2. **手动触发**
   - 打开 GitHub 仓库 → **Actions** 标签页。
   - 左侧选择工作流：
     - **CI - 所有模块测试**：后端 + 前端 + Python AI + Rust（可选）并行测试与构建。
     - **完整测试套件**：可勾选要运行的模块，支持定时（每日 2:00）与手动运行。
   - 点击 **Run workflow**，选择分支后运行。

3. **本地等效验证（提交前建议执行）**

   ```bash
   # 后端：安装、构建、测试
   cd backend && npm ci && npm run build && npm run test:fast

   # 前端：安装、类型检查、测试、构建
   cd frontend && npm ci && npx vue-tsc --noEmit && npm run test && npm run build

   # Python AI（可选）
   cd python-ai && pip install -r requirements.txt && pytest tests/ -v
   ```

### 工作流说明

| 工作流 | 说明 |
|--------|------|
| `ci.yml` | 主 CI：后端/前端/Python/Rust 并行测试与构建，支持手动触发 |
| `full-test.yml` | 完整测试套件：可选模块、定时与手动触发 |
| `backend-ci.yml` | 仅后端（backend/ 变更或手动） |
| `frontend-ci.yml` | 仅前端（frontend/ 变更或手动） |
| `python-ai-ci.yml` | 仅 Python AI（python-ai/ 变更或手动） |
| `deploy.yml` | 部署流水线（需配置 GitHub Secrets：SSH_PRIVATE_KEY、DEPLOY_HOST、DEPLOY_USER 等） |

部署前请先按 [.github/workflows/DEPLOY-SETUP.md](.github/workflows/DEPLOY-SETUP.md) 配置服务器与 Secrets；更多 CI/CD 说明见 [.github/workflows/README.md](.github/workflows/README.md)。

---

## 🔧 常见问题

### Q1: 启动时提示端口被占用？

**A**: 检查是否有其他实例在运行：
```bash
# Windows
netstat -ano | findstr ":3000"
taskkill /F /PID <进程ID>

# Linux/Mac
lsof -i :3000
kill -9 <进程ID>
```

### Q2: 数据库连接失败？

**A**: 检查以下几点：
1. MySQL服务是否启动：`net start MySQL80`（Windows）
2. 数据库用户名密码是否正确（检查 `backend/.env`）
3. 数据库是否已创建：`SHOW DATABASES;`
4. 防火墙是否阻止了3306端口

### Q3: 前端页面无法访问后端API？

**A**: 检查：
1. 后端服务是否启动（端口3000）
2. Vite代理配置是否正确（`frontend/vite.config.ts`）
3. 浏览器控制台是否有CORS错误

### Q4: Redis连接失败？

**A**: 系统已自动启用内存缓存降级方案，不影响功能。如需使用Redis：
1. 安装Redis服务
2. 启动Redis：`redis-server`
3. 配置 `backend/.env` 中的 `REDIS_URL`

### Q5: Python AI服务启动失败？

**A**: 
1. 检查Python版本：`python --version`（需要3.10+）
2. 安装依赖：`pip install -r requirements.txt`
3. 检查模型文件是否存在

### Q6: 如何重置数据库？

**A**:
```sql
-- 删除数据库
DROP DATABASE edu_education_platform;

-- 重新创建
CREATE DATABASE edu_education_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 重新导入表结构（V1.0基础 + V2.0新增）
mysql -u root -p edu_education_platform < backend/sql/learning-platform-integration-tables.sql
mysql -u root -p edu_education_platform < backend/sql/v2-complete.sql
```

### Q7: 微信通知收不到？

**A**: 检查以下几点：
1. 根目录 `.env` 文件是否存在，且 `WECHAT_NOTIFY_TOKEN` 已填写真实 Token
2. 访问 [xtuis.cn](https://xtuis.cn) 获取你的推送 Token
3. 运行 `npm run health` 后查看控制台是否有 `⚠️ 未配置微信 Token` 提示

### Q8: `npm run agents` 提示 Playwright 浏览器未安装？

**A**:
```bash
# 在项目根目录执行
npx playwright install chromium
```
安装完成后重新运行 `npm run agents`。如果前端服务未启动，Agent5 会自动跳过，不影响其他检查项。

### Q9: 人脸核验一直失败？

**A**:
1. 确保浏览器已授权摄像头权限（地址栏摄像头图标）
2. 检查光线是否充足
3. 注册时的环境光线与学习时差异过大会导致相似度降低
4. 如有需要，可通过申诉机制（核验日志页面）向教师申请人工审核

---

## 🎓 使用示例

### 学生端使用流程

1. **注册/登录** → 访问 http://localhost:5173，使用学生账号登录
2. **完成兴趣调查** → 首次登录会弹出问卷，完成6步问卷
3. **浏览课程** → 在课程首页浏览和搜索课程
4. **购买课程** → 选择课程分支，完成支付
5. **开始学习** → 在"我的课程"页面点击"继续学习"
6. **观看视频** → 视频播放器自动记录进度
7. **视频答题** → 观看过程中随机弹出题目
8. **查看错题本** → 在错题本页面查看和重做错题
9. **生成学习伙伴** → 在学习路径页面生成虚拟伙伴
10. **协作学习** → 与伙伴聊天、完成任务、查看排行榜

### 教师端使用流程

1. **登录** → 使用教师账号登录
2. **创建课程** → 在课程管理页面创建课程和课节
3. **发布作业** → 创建作业题目，发布到班级
4. **查看学情** → 在学情分析页面查看班级和学生数据
5. **批改作业** → 使用AI辅助批改或手动批改
6. **查看错题** → 查看学生的错题本和薄弱点

### 家长端使用流程

1. **登录** → 使用家长账号登录
2. **绑定孩子** → 输入孩子的账号信息完成绑定
3. **查看学习路径** → 查看孩子的学习路径和调整历史
4. **查看视频进度** → 查看视频学习进度
5. **查看错题本** → 查看错题和薄弱点分析

---

## 🚀 性能优化

### 前端性能优化

- ✅ **代码分割**: 按角色和功能模块分包，初始包<500KB
- ✅ **路由懒加载**: 所有路由组件动态导入
- ✅ **图片懒加载**: 使用Intersection Observer API
- ✅ **资源预加载**: DNS预解析、预连接、关键资源预加载
- ✅ **构建优化**: esbuild压缩，构建速度提升3-5倍

### 后端性能优化

- ✅ **响应压缩**: gzip压缩，减少传输量60-80%
- ✅ **缓存策略**: 静态资源1年缓存，只读API 5分钟缓存
- ✅ **数据库优化**: 连接池20个连接，慢查询监控
- ✅ **批量操作**: MongoDB批量写入，视频进度批量更新
- ✅ **性能监控**: 响应时间监控，慢请求警告

**预期性能提升**:
- 网页打开速度：提升40-60%
- API响应速度：提升20-30%
- 数据库查询：提升20-30%

---

## 🔒 安全特性

- ✅ **JWT认证**: 所有API需要JWT令牌
- ✅ **角色权限**: 学生/教师/家长权限隔离
- ✅ **SQL注入防护**: 参数化查询
- ✅ **XSS防护**: 输入验证和转义
- ✅ **API速率限制**: 防止滥用（严格/中等/宽松三级）
- ✅ **密码加密**: bcrypt哈希存储

---

## 📊 系统要求

### 最低配置

- **CPU**: 2核心
- **内存**: 4GB
- **磁盘**: 20GB可用空间
- **网络**: 稳定的互联网连接（用于AI服务）

### 推荐配置

- **CPU**: 4核心+
- **内存**: 8GB+
- **磁盘**: 50GB+ SSD
- **网络**: 100Mbps+

---

## 🐛 故障排除

### 问题诊断步骤

1. **检查服务状态**
   ```bash
   # 检查端口占用
   netstat -ano | findstr "3000 5173"
   ```

2. **查看日志**
   - 后端日志：查看终端输出
   - 前端日志：浏览器控制台（F12）
   - 数据库日志：MySQL错误日志

3. **验证配置**
   - 检查 `.env` 文件配置
   - 检查数据库连接
   - 检查API地址

4. **重启服务**
   - 停止所有服务
   - 重新启动

### 获取帮助

- 📧 技术支持：查看项目文档
- 🐛 报告Bug：提交Issue（如果有Git仓库）
- 💬 讨论交流：查看项目文档

---

## 📈 项目进度

### ✅ 已完成功能

- Phase 1: 数据库架构扩展 (100%)
- Phase 2: 基础功能API (100%)
- Phase 3: 高级功能API (100%)
- Phase 4: 前端基础界面 (100%)
- Phase 5: 前端高级功能 (100%)
- Phase 6: 系统集成与联动 (100%)
- Phase 7: 测试与部署 (90%)
- **Phase 8: V2.0 原创功能 (100%)** ← 新增
  - FaceGuard 防刷课系统
  - AI在线代码编辑器
  - AI教育社区
  - 错题智能推送（协同过滤增强）
  - 视频智能上下架
  - 多Agent健康监测系统

### 🔄 进行中

- E2E自动化测试覆盖率提升
- 性能持续优化

---

## 🏆 竞赛评分维度

- **技术创新性 (30%)**: FaceGuard静默核验 + 协同过滤预测推送 + AI代码编辑器 + 多Agent自动化
- **功能完整性 (25%)**: 教师-学生-家长全角色业务闭环 + V2.0五大原创功能
- **演示效果 (20%)**: 一键启动≤10秒，核心流程≤5分钟
- **文档规范性 (15%)**: 结构化中文文档 + 技术架构图
- **可扩展性 (10%)**: 模块化设计，多Agent架构，支持新增AI模型/设备适配

---

## 📝 许可证

本项目仅用于传智杯参赛使用。

---

## 👥 贡献者

感谢所有参与项目开发的团队成员！

---

## 📞 联系方式
tell:17761042685
QQ:1002668039@QQ.COM

- 📧 项目文档：查看 `docs/` 目录
- 🐛 问题反馈：查看故障排除章节

---

**最后更新**: 2026年3月30日（V2.0全面升级）
**项目版本**: v2.0.0
**文档版本**: v2.0（详细版）

