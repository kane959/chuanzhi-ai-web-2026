# GitHub 参考项目与能力矩阵

抓取日期：2026-10-27。项目链接用于研究能力、交互和工程方法；不直接复制实现，不把任何仓库包装为自己的参赛作品。

## 2026 传智杯 AI Web 公开作品

| 项目 | 值得研究的能力 | 对 CampusFlow 的启发 | 不能照搬的部分 |
|---|---|---|---|
| [Solarward-1209/zhixing-agent](https://github.com/Solarward-1209/zhixing-agent) | 可见计划、SSE 事件、BM25+向量 RAG、MCP 动态工具、多模态进入 Agent 主循环、演示/真实双模式 | 采用可观察的 plan → retrieve → tool → answer 时间线；做可取消、可降级的事件协议 | 它的“赛事备赛/校园学习”知识域和提示词不能复用；我们改为校园行动的时空/材料规划 |
| [sssweetis/chuanzhi-cup-ai-web_Triple-Y](https://github.com/sssweetis/chuanzhi-cup-ai-web_Triple-Y) | 通知解析为结构化事项、三层复杂度、原文锚点、材料缺项和冲突提醒 | 把通知理解作为输入入口，但要扩展到多个来源、审批和跨任务依赖 | 不复制“不漏办”字段、界面和代码 |
| [233-arch/datapilot-chuanzhibei](https://github.com/233-arch/datapilot-chuanzhibei) | 确定性计算与 LLM 分工、引用编号校验、无 Key 演示模式、提交检查脚本 | 事实计算和引用验证由程序控制，模型只负责解释与规划；实现可审计演示 | 不复制数据分析领域和文案；其 README 的测试数字只作为对照 |
| [newhack-cpu/cite-checkup](https://github.com/newhack-cpu/cite-checkup) | 多源核验、AI 检索 Agent、图片识别、MCP Server、详细盲测与误报记录 | 为每个行动输出“来源 + 置信度 + 待人工确认”三态；对用户上传图片做清洗和审计 | 不复制引用核查业务与测试数据；遵守其许可证和外部服务条款 |
| [m-tx25/NetStudy-AI](https://github.com/m-tx25/NetStudy-AI) | 多团队知识库、SSE、权限与密钥作用域、文档页码溯源、Mock/真实双模式 | 将知识包按学校/场景隔离，默认无 Key 仍可完成本地演示；密钥只在后端/运行时 | 不复制其账户、团队、数据库表和前端主题 |
| [huiya07/semester-assistant](https://github.com/huiya07/semester-assistant) | 中文 PDF 页级切片、证据三态、离线嵌入降级 | 保留“有依据/相关但无答案/完全不相关”三态，按页或段落定位 | 不复制其资料和 Streamlit 实现 |
| [tths1/otowai-sound-encounters](https://github.com/tths1/otowai-sound-encounters) | 规则引擎 + Web Speech、多端响应式、隐私与额度治理 | 语音交互必须有可解释的浏览器降级和额度保护，不能把外部 API 当黑盒 | 不复制文化主题和规则表 |

## 通用开源能力库

| 仓库 | 许可证/定位 | 适合研究的模块 |
|---|---|---|
| [vercel/ai](https://github.com/vercel/ai) | SDK；仓库以 `NOASSERTION` 展示许可证 | TypeScript 流式 UI、工具调用、生成式 UI |
| [vercel/chatbot](https://github.com/vercel/chatbot) | Next.js AI Chatbot；`NOASSERTION` | 对话状态、消息渲染、Next.js 全栈组织 |
| [shadcn-ui/ui](https://github.com/shadcn-ui/ui) | MIT | 可访问的组件与设计令牌；只复制按文档生成的组件代码并保留 MIT 声明 |
| [assistant-ui/assistant-ui](https://github.com/assistant-ui/assistant-ui) | MIT | AI 对话组件、线程与工具卡片 |
| [langchain-ai/langchainjs](https://github.com/langchain-ai/langchainjs) | MIT | Agent 工具抽象、检索链；只选用必要模块 |
| [modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk) | 官方 SDK | MCP 客户端/服务端协议实现 |
| [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | 官方服务器集合 | 研究文件、时间、搜索等工具的边界与权限设计 |
| [openai/openai-cookbook](https://github.com/openai/openai-cookbook) | MIT | 结构化输出、检索、评测和安全实践 |
| [qdrant/qdrant](https://github.com/qdrant/qdrant) | Apache-2.0 | 向量检索服务；原型先用本地 BM25/SQLite，避免部署负担 |
| [xyflow/xyflow](https://github.com/xyflow/xyflow) | MIT | 任务依赖图、计划编辑器和流程可视化 |
| [TanStack/query](https://github.com/TanStack/query) | MIT | 服务端状态、缓存和请求重试 |
| [microsoft/markitdown](https://github.com/microsoft/markitdown) | MIT | Office/PDF/网页资料转 Markdown 的导入流程 |
| [dair-ai/Prompt-Engineering-Guide](https://github.com/dair-ai/Prompt-Engineering-Guide) | MIT | Prompt 版本化、结构化输出和评测思路 |

## 能力采纳原则

1. 先写场景测试和数据契约，再决定是否引入依赖；比赛时间短，不为“技术名词”堆库。
2. 每个 AI 结论都保留输入来源、工具调用和失败原因；没有依据时明确说不知道。
3. 公开仓库只保留我们的代码、数据生成器和配置模板；外部代码按许可证逐项记录，禁止复制竞品的业务文案、截图、知识库或演示视频。
4. 星标数量只用于发现项目，不代表质量或可复用许可；提交前重新查看许可证与仓库状态。
