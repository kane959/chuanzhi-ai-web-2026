# CampusFlow prototype

这是备赛工作区的第一版 UI 原型，默认使用本地演示数据，不需要 API Key。它把评委能观察到的 AI 闭环放在同一个工作台：

目标输入 → Agent 阶段 → 任务计划 → 证据卡片 → 情景推演 → 人工确认

## 运行

pnpm install
pnpm dev

生产构建：pnpm build

真实模型适配器将在下一阶段接入；请从 .env.example 开始，任何密钥都不要提交。
