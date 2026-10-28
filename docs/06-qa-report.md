# 原型 QA 记录

日期：2026-10-27  
版本：CampusFlow v0.1（本地演示模式）

## 自动检查

- `pnpm typecheck`：通过。
- `pnpm lint`：通过，扫描 3 个前端源文件，未发现嵌入式 provider secret。
- `pnpm build`：通过，Vite production bundle 生成成功。
- `pnpm test:e2e`：通过，检查仓库文件、核心 UI 文案和 `Evidence`/`Task` 数据契约。
- `pnpm preflight`：通过，0 errors / 0 warnings。

## 浏览器走查

使用 Playwright CLI 和 Codex 应用内浏览器分别走查：

1. 生成行动计划：阶段从理解目标、检索证据、调用工具推进到等待确认，状态提示可见。
2. 选择任务：宿舍报修与奖助学金任务会切换右侧证据卡片和原文定位。
3. 完成任务：完成度从 33% 更新到 67%，提示同步更新。
4. 情景推演：周三下午与“仅晚上有空”可往返切换，时间标签和解释文字同步变化。
5. 导出清单：生成 `campusflow-action-plan.md` 下载，并明确写入外部系统仍需确认。
6. 关闭确认提示、快捷问题、输入框和上传入口均可操作。

## 视口检查

- 1440×900：三栏工作台、证据定位、人工确认提示和情景推演完整可见。
- 390×844：移动导航折叠，页面无横向溢出；输入、计划、证据和推演按纵向排列。
- 控制台错误：0（补充 favicon 后复查）。

截图存放在 `output/playwright/desktop-1440x900.png` 和 `output/playwright/mobile-390x844.png`。

## 有意保留的下一阶段项

- 当前结果是可解释的本地演示数据，不宣称已接入真实模型或真实学校系统。
- Playwright 目前用于人工 CLI 走查；正式提交前将把同一检查点迁移为可重复的浏览器测试。
- 需要补齐队伍、学校、指导教师、在线演示地址和真实知识包后，才能冻结提交材料。

## 2026-10-28 · Reviewer 与固定评测复核

- `pnpm typecheck`、`pnpm build`、`pnpm lint`、`pnpm test:e2e`、`pnpm preflight`：通过。
- `pnpm evaluate`：CF-01 至 CF-08 全部通过；证据召回率、任务覆盖率、无依据拒答率和 Reviewer 安全率均为 1.000。
- 浏览器复核：默认目标显示 `needs_review`；天气问题显示 `blocked` 和“暂未找到足够依据”；晚间校园卡场景显示 `TIME_CONFLICT` 对应的“待协调”。
- 评测结果：`output/evaluation/demo-evaluation.json`。结果属于 `mode=demo`，只覆盖合成资料和确定性规则，不代表真实模型成绩。
