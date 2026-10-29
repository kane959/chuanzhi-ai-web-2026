# CampusFlow 技术架构草案

## 端到端数据流

```text
输入文字/图片/PDF
    ↓ 解析与隐私清洗（OCR/vision、PII 标记）
规范化事实 + 原文锚点
    ↓ 检索（BM25 起步，向量可插拔）
证据包（段落、页码/块号、相关度、更新时间）
    ↓ Planner（结构化计划）
任务 DAG + 所需工具 + 人类审批点
    ↓ 工具执行（纯函数优先）
日历冲突 / 开放时间 / 路线 / 材料校验 / 导出预览
    ↓ Reviewer
冲突、风险、缺失证据、可解释性检查
    ↓ SSE 事件流
计划时间线、工具卡片、证据引用、最终建议
```

## 推荐技术栈

- 前端：React + TypeScript + Vite（先快速验证）或 Next.js App Router（需要服务端路由时迁移）；Tailwind CSS + shadcn/ui；TanStack Query；Zustand。
- 服务端：Node.js + TypeScript；先用单进程 API，保持 `server/agent`、`server/rag`、`server/tools`、`server/policy` 分层。
- 模型：OpenAI 兼容接口，支持 DeepSeek/智谱/本地 Ollama；所有模型通过适配器接入，不把供应商写死在 UI。
- 检索：第一版本地 BM25/SQLite，保留 `Embedder` 接口；有时间再接 Qdrant/Chroma。
- 文件解析：MarkItDown/PDF.js 或后端解析；图片识别走视觉模型；敏感字段先本地遮罩。
- 实时协议：SSE 事件 `status | plan | evidence | tool_call | tool_result | token | warning | done | error`，每个事件带 `traceId`。
- 部署：前端静态托管 + 轻量 API（Vercel/Cloudflare/Render 任选其一）；提交前以一个固定在线地址做健康检查。

## Agent 分工

1. **Planner**：只输出 JSON 计划，不直接写入外部系统；每个任务有 `id`、`dependsOn`、`deadline`、`location`、`requiredMaterials`、`evidenceIds`、`requiresApproval`。
2. **Retriever**：按学校/知识域检索，返回带定位的证据；未达到阈值时返回 `insufficient_evidence`。
3. **Executor**：只调用白名单工具，工具参数由 Zod/JSON Schema 校验，读操作与写操作分开。
4. **Reviewer**：检查计划是否引用证据、依赖是否闭合、时间是否冲突、是否含个人敏感信息，并给出 `pass | needs_review | blocked`。

省赛版本不强求真正的多 Agent 网络拓扑；用四个职责清晰的步骤和可观测事件证明协作关系，避免为了名词增加脆弱性。

## 数据契约（核心）

```ts
type Evidence = {
  id: string; sourceId: string; title: string; locator: string;
  excerpt: string; updatedAt?: string; score: number;
};

type Task = {
  id: string; title: string; status: 'todo'|'doing'|'done'|'blocked';
  dependsOn: string[]; deadline?: string; location?: string;
  materials: {name: string; required: boolean; checked: boolean}[];
  evidenceIds: string[]; requiresApproval: boolean;
};

type AgentEvent =
  | {type:'status'; label:string}
  | {type:'plan'; tasks: Task[]}
  | {type:'evidence'; items: Evidence[]}
  | {type:'tool_call'; name:string; args: unknown}
  | {type:'tool_result'; name:string; result: unknown}
  | {type:'warning'; code:string; message:string}
  | {type:'done'; traceId:string};
```

## 安全和可用性门槛

- API Key 仅在服务端运行时读取；`.env*` 全部 gitignore，提交前扫描密钥。
- 所有上传文件限制大小和 MIME；图片去除 EXIF，文档解析隔离；PII 默认只在本地展示。
- 无证据不生成确定断言；系统区分“找到依据”“相关但未回答”“未检索到”。
- 工具失败显示真实原因，并保留重试/回退入口；演示模式不伪装成真实模型。
- 写入日历、导出或发送提醒前必须二次确认；审计记录包括用户确认时间。
- 预算：首屏 < 2.5s（无模型），SSE 首事件 < 1.5s（有模型），普通任务最多 3 轮工具调用。

## 官网资料同步服务

当前服务端提供单页预览接口：`POST /api/sources`，请求体为 `{ "url": "https://..." }`。它只允许 `SYNC_ALLOWED_HOSTS` 中的 HTTPS/HTTP 域名，拒绝回环/内网地址、非标准端口、带用户名密码的 URL、超过 512 KB 的响应和超过 8 秒的请求。正文提取为标题、段落、更新时间、来源 URL 和关键词后返回给前端；默认不写入数据库，前端只在当前会话加入“待核验证据”。

Vercel 部署使用 `api/health.js` 和 `api/sources.js`；本地长驻服务使用 `pnpm server`。生产环境还应在平台侧配置速率限制、日志脱敏和明确的域名授权，不能把它当成任意 URL 代理或全网爬虫。
