# 开源参考与许可证记录

本项目只借鉴公开项目的架构、交互和测试方法，不复制其业务文案、知识库、截图或代码。参赛仓库发布前逐项核对许可证，并在此记录使用范围。

| 项目 | 用途 | 当前边界 |
| --- | --- | --- |
| [vercel/ai](https://github.com/vercel/ai) | 流式 UI 与模型适配思路 | 未直接复制源码 |
| [shadcn-ui/ui](https://github.com/shadcn-ui/ui) | 组件可访问性与设计参考 | 原型目前为自定义 CSS |
| [assistant-ui/assistant-ui](https://github.com/assistant-ui/assistant-ui) | 对话/工具事件呈现参考 | 未作为运行时依赖 |
| [langchain-ai/langchainjs](https://github.com/langchain-ai/langchainjs) | Retriever/工具抽象参考 | 先用轻量本地实现 |
| [modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk) | 工具边界参考 | 省赛版只开放白名单读工具 |
| [qdrant/qdrant](https://github.com/qdrant/qdrant) | 向量检索升级路线 | 暂未接入 |
| [xyflow/xyflow](https://github.com/xyflow/xyflow) | 任务 DAG 可视化参考 | 后续按需接入 |
| [ag-ui-protocol/ag-ui](https://github.com/ag-ui-protocol/ag-ui) | Agent 状态、工具结果和取消事件的协议参考 | 当前用本地 trace 展示，未引入运行时 |
| [CopilotKit/CopilotKit](https://github.com/CopilotKit/CopilotKit) | Agent-native 前端交互参考 | 未复制其组件或业务代码 |
| [microsoft/markitdown](https://github.com/microsoft/markitdown) | 文档导入与 Markdown 化路线 | 图片/PDF 仍明确标为未接入 |
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | 浏览器自审和反模板视觉方法 | 未复制图片、文案或页面 |
| [oil-oil/oil-ui](https://github.com/oil-oil/oil-ui) | UI 设计评审与多方向比较方法 | 未复制其 skill 资源 |

完整竞品与能力目录见 `research/competitors/` 和 `C:/Users/ThinkPad/.codex/skills/chuanzhi-ai-web-contest/references/github-project-catalog.md`。
