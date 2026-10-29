# 传智杯 2026 AI Web 备赛工作区

这是 2026 第九届传智杯全国大学生数智创新与 AI 应用大赛「AI WEB 网页开发挑战赛」的备赛工作区。

当前工作项目为 **CampusFlow：可查证的校园事务行动协同智能体**：把分散的校园通知、规章、课程与服务入口变成可查证、可规划、可执行的校园行动。参赛方向为 **AI 协同办公工具**，技术标签为 RAG 知识检索、Agent 行动规划和 AI 安全审核。作品与参赛学校无关，演示使用自建的合成校园资料包，任何高校都可以替换自己的知识包后复用。

## 已完成的前期准备

- 从传智杯官网赛道接口保存了 10037 赛道的原始响应与规则摘录。
- 根据官方评分权重建立了选题决策表、技术架构、验收标准和提交清单。
- 检索并保存了 2026 年可见的 AI Web 竞品 README（仅作为能力参考，禁止直接包装或抄袭）。
- 将附件问卷截图和视频样例转为研究记录：问卷强调“解决具体问题”和“互动体验”，视频样例包含非遗纸艺展示和健康管理看板。
- 安装了与本项目直接相关的 Codex skills：Playwright、PDF、Vercel Deploy、Cloudflare Deploy、GitHub CI、Security Best Practices、Speech、Transcribe、Frontend Design、Web Interface Guidelines、React Best Practices，并创建了本项目专用 `chuanzhi-ai-web-contest` skill。

## 目录

- `docs/01-official-rules.md`：官方赛道约束、截止时间和评分权重。
- `docs/02-competitive-landscape.md`：GitHub 竞品与开源能力矩阵。
- `docs/03-product-brief.md`：CampusFlow 选题假设、用户、场景和差异化。
- `docs/04-architecture.md`：AI Native 架构与数据边界。
- `docs/05-sprint-plan.md`：到省赛提交的 22 天执行排期。
- `docs/08-frontend-direction.md`：GitHub 参考、视觉方向和前端验收边界。
- `submission/checklist.md`：代码、演示视频、PDF 文档、在线演示的提交门禁。
- `prototype/`：可操作的工作台原型（本地检索、排期冲突、材料进度、原文抽屉和导出预览）。
- `server/`、`api/`：单页官网资料同步服务；白名单、大小/超时限制、来源 URL 和 SSRF 防护。
- `server/model-adapter.mjs`、`api/plan.js`：结构化 Planner 适配层；无 Key 演示模式与 OpenAI 兼容接口可切换，失败自动回退。
- `docs/deployment.md`：公网预览、长期部署和官网同步配置说明。
- `research/`：原始抓取结果、竞品 README、附件观察记录。
- `research/2025-national-benchmark.md`：去年公开国赛作品的核对记录与可迁移启发。

## 当前验证状态

- 官方接口抓取：已完成，来源与时间见 `docs/01-official-rules.md`。
- 竞品资料抓取：已完成，见 `research/competitors/`。
- 产品方向：CampusFlow 可查证的校园事务行动协同智能体；参赛学校、组别和指导教师只记录在提交资料中，不作为产品事实或知识来源。队员、仓库和在线演示地址仍待补齐。
- 真实模型接入：尚未配置 API Key，原型默认使用可解释的演示数据；不在仓库写入密钥。
- GitHub 只读调研快照：`research/github-2026-10-28/`，包含仓库版本、许可证和 README；不把外部代码作为运行时依赖。

## 本地运行与预检

```bash
pnpm install --dir prototype
pnpm dev
```

需要启用官网单页同步时，另开一个终端：

```powershell
$env:SYNC_ALLOWED_HOSTS="example.edu.cn,www.example.edu.cn"
pnpm server
```

前端开发服务器会把 `/api` 代理到 `http://127.0.0.1:8787`。部署到 Vercel 时，`vercel.json` 会使用 `prototype/dist` 作为静态产物，并部署 `api/health.js` 与 `api/sources.js`。公网环境只应把明确授权的官网域名写入 `SYNC_ALLOWED_HOSTS`，不要把 API 令牌或模型密钥放进前端变量。

另开终端执行：

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm test:e2e
pnpm test:source-sync
pnpm preflight
```

固定 AI 演示评测：

```bash
pnpm evaluate
```

评测会复现 8 个校园场景，输出证据召回、任务覆盖、无依据拒答和 Reviewer 安全率到 `output/evaluation/demo-evaluation.json`；当前使用本地合成资料和确定性规则，不调用外部模型。

`test:e2e` 是无外部依赖的仓库烟测；浏览器中的评委路径（生成计划、任务/证据切换、情景推演、清单导出）已用本地浏览器完成走查。真实 E2E 接入 Playwright 后，沿用同一组检查点。

## 评分对齐

| 官方维度 | 当前可见证据 | 下一步验收 |
| --- | --- | --- |
| AI 技术深度 35% | Agent 阶段、RAG 证据卡、结构化 Planner、Reviewer 审核状态、8 案例固定评测 | 接入图片/PDF 解析和更多服务端工具 |
| 创新性 25% | 计划与证据同屏、情景推演、人工确认边界 | 增加图片/PDF 解析和冲突解释 |
| 工程质量 10% | TypeScript、构建、预检、真实 Git 历史 | CI、错误边界、依赖许可证清单 |
| 实用性 10% | 新生办事任务、材料完整性和时间约束 | 替换为真实学校知识包 |
| 用户体验 10% | 任务工作台、移动断点、状态反馈 | 键盘/无障碍和在线健康检查 |
| 社会价值/商业潜力 10% | 隐私优先、可替换学校知识包 | 访谈记录、部署成本与商业化页 |

## 资料来源

- 官方赛道详情：[boxuegu.com/matchTrack/detail/?id=10037](https://www.boxuegu.com/matchTrack/detail/?id=10037)
- 官方接口快照：`research/raw/official-track-10037.json`
- GitHub 竞品与能力目录：`research/competitors/`、`docs/open-source-credits.md`
- 附件观察记录：`research/attachment-notes.md`

## 原创边界

开源项目只用于学习架构、交互和测试方法。CampusFlow 的知识库、提示词、数据模型、视觉设计、代码和演示脚本必须独立实现，并在 README 中保留来源致谢和许可证记录。评审提交前保留真实 Git 历史，不用开源代码拼装成作品。
