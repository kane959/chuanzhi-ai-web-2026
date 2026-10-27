# 传智杯 2026 AI Web 备赛工作区

这是 2026 第九届传智杯全国大学生数智创新与 AI 应用大赛「AI WEB 网页开发挑战赛」的备赛工作区。

当前工作假设项目名为 **CampusFlow / 校园行动 OS**：把分散的校园通知、规章、课程与服务入口变成可查证、可规划、可执行的校园行动。它以新生高频场景为第一套演示数据，后续可替换为任意学校的知识包。

## 已完成的前期准备

- 从传智杯官网赛道接口保存了 10037 赛道的原始响应与规则摘录。
- 根据官方评分权重建立了选题决策表、技术架构、验收标准和提交清单。
- 检索并保存了 2026 年可见的 AI Web 竞品 README（仅作为能力参考，禁止直接包装或抄袭）。
- 将附件问卷截图和视频样例转为研究记录：问卷强调“解决具体问题”和“互动体验”，视频样例包含非遗纸艺展示和健康管理看板。
- 安装了与本项目直接相关的 Codex skills：Playwright、PDF、Vercel Deploy、Cloudflare Deploy、GitHub CI、Security Best Practices、Speech、Transcribe，并创建了本项目专用 `chuanzhi-ai-web-contest` skill。

## 目录

- `docs/01-official-rules.md`：官方赛道约束、截止时间和评分权重。
- `docs/02-competitive-landscape.md`：GitHub 竞品与开源能力矩阵。
- `docs/03-product-brief.md`：CampusFlow 选题假设、用户、场景和差异化。
- `docs/04-architecture.md`：AI Native 架构与数据边界。
- `docs/05-sprint-plan.md`：到省赛提交的 22 天执行排期。
- `submission/checklist.md`：代码、演示视频、PDF 文档、在线演示的提交门禁。
- `prototype/`：第一版 UI 骨架（后续接入真实 AI）。
- `research/`：原始抓取结果、竞品 README、附件观察记录。

## 当前验证状态

- 官方接口抓取：已完成，来源与时间见 `docs/01-official-rules.md`。
- 竞品资料抓取：已完成，见 `research/competitors/`。
- 产品方向：暂定 CampusFlow，待你提供学校/队伍信息后补齐知识包和提交信息。
- 真实模型接入：尚未配置 API Key，原型默认使用可解释的演示数据；不在仓库写入密钥。

## 本地运行与预检

```bash
pnpm install --dir prototype
pnpm dev
```

另开终端执行：

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm test:e2e
pnpm preflight
```

`test:e2e` 是无外部依赖的仓库烟测；浏览器中的评委路径（生成计划、任务/证据切换、情景推演、清单导出）已用本地浏览器完成走查。真实 E2E 接入 Playwright 后，沿用同一组检查点。

## 评分对齐

| 官方维度 | 当前可见证据 | 下一步验收 |
| --- | --- | --- |
| AI 技术深度 35% | Agent 阶段、RAG 证据卡、工具/Reviewer 架构契约 | 接入结构化模型、固定评测集、失败回退 |
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
