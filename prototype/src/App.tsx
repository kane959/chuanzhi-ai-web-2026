import { useMemo, useRef, useState } from 'react'
import {
  ArrowRight, Bot, CalendarClock, Check, CheckCircle2, ChevronRight,
  CircleAlert, Clock3, Download, ExternalLink, FileCheck2, FileImage, Fingerprint, Info, MapPin,
  Menu, Paperclip, Play, RefreshCw, ShieldCheck, Sparkles, X, Zap,
} from 'lucide-react'
import { evidence, initialTasks, quickPrompts, retrieveEvidence, type Task, type TaskStatus } from './data'

const statusMeta: Record<TaskStatus, { label: string; className: string }> = {
  done: { label: '已完成', className: 'status-done' },
  doing: { label: '进行中', className: 'status-doing' },
  todo: { label: '待开始', className: 'status-todo' },
  blocked: { label: '待确认', className: 'status-blocked' },
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [prompt, setPrompt] = useState(quickPrompts[0])
  const [running, setRunning] = useState(false)
  const [stage, setStage] = useState(4)
  const [selectedTaskId, setSelectedTaskId] = useState('repair')
  const [selectedEvidenceId, setSelectedEvidenceId] = useState('E-03')
  const [onlyEvening, setOnlyEvening] = useState(false)
  const [notice, setNotice] = useState('演示模式已就绪：不需要 API Key，也不会上传你的内容。')
  const [approvalVisible, setApprovalVisible] = useState(true)
  const [retrievedEvidenceIds, setRetrievedEvidenceIds] = useState<string[]>([])
  const [retrievalState, setRetrievalState] = useState<'idle' | 'found' | 'empty'>('idle')
  const fileRef = useRef<HTMLInputElement>(null)

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? tasks[0]
  const selectedEvidence = evidence.find((item) => item.id === selectedEvidenceId) ?? evidence[0]
  const completed = tasks.filter((task) => task.status === 'done').length
  const checkedMaterials = tasks.flatMap((task) => task.materials).filter((item) => item.checked).length
  const totalMaterials = tasks.flatMap((task) => task.materials).length
  const progress = useMemo(() => Math.round((completed / tasks.length) * 100), [completed, tasks.length])
  const visibleEvidenceIds = useMemo(() => {
    const taskEvidence = selectedTask.evidence
    if (retrievalState === 'empty') return []
    const rankedForTask = retrievedEvidenceIds.filter((id) => taskEvidence.includes(id))
    return rankedForTask.length > 0 ? rankedForTask : taskEvidence
  }, [retrievalState, retrievedEvidenceIds, selectedTask.evidence])

  function updateTaskStatus(id: string) {
    setTasks((current) => current.map((task) => task.id === id
      ? { ...task, status: task.status === 'done' ? 'todo' : 'done' }
      : task))
    setNotice('已更新本地计划。真实模式下，写入日历或提交前仍需再次确认。')
  }

  function runPlan() {
    if (running) return
    const retrieved = retrieveEvidence(prompt)
    setRetrievedEvidenceIds(retrieved.map((item) => item.id))
    setRetrievalState(retrieved.length > 0 ? 'found' : 'empty')
    const normalizedPrompt = prompt.toLowerCase()
    const matchedTaskId = normalizedPrompt.includes('报修') || normalizedPrompt.includes('漏水') || normalizedPrompt.includes('宿舍')
      ? 'repair'
      : normalizedPrompt.includes('奖助') || normalizedPrompt.includes('材料') || normalizedPrompt.includes('资助')
        ? 'grant'
        : normalizedPrompt.includes('校园卡') || normalizedPrompt.includes('报到')
          ? 'card'
          : selectedTaskId
    const matchedTask = tasks.find((task) => task.id === matchedTaskId) ?? tasks[0]
    setSelectedTaskId(matchedTask.id)
    setSelectedEvidenceId(retrieved.find((item) => matchedTask.evidence.includes(item.id))?.id ?? matchedTask.evidence[0])
    setRunning(true)
    setStage(1)
    setNotice(retrieved.length > 0
      ? `Planner 正在拆解目标；Retriever 已在通用合成资料包中召回 ${retrieved.length} 条依据。`
      : 'Planner 正在拆解目标；Retriever 暂未找到足够依据，将保守展示并等待确认。')
    window.setTimeout(() => { setStage(2); setNotice(retrieved.length > 0 ? `Retriever 已排序 ${retrieved.length} 条带定位的合成资料。` : 'Retriever 未找到足够依据，已保留人工确认入口。') }, 650)
    window.setTimeout(() => { setStage(3); setNotice('工具校验完成：窗口时间、材料依赖和时间冲突均已检查。') }, 1300)
    window.setTimeout(() => { setStage(4); setRunning(false); setNotice('计划生成完成。任何对外写入动作都需要你确认。') }, 1950)
  }

  function handleUpload(file?: File) {
    if (!file) return
    setPrompt('请解析这份材料：' + file.name)
    setNotice('已读取 ' + file.name + ' 的文件名。原型仅展示安全流程，真实解析会先清理 EXIF 并标记个人信息。')
  }

  function toggleMaterial(taskId: string, label: string) {
    setTasks((current) => current.map((task) => task.id !== taskId ? task : {
      ...task,
      materials: task.materials.map((item) => item.label === label ? { ...item, checked: !item.checked } : item),
    }))
  }

  function downloadChecklist() {
    const lines = [
      '# CampusFlow 行动清单',
      '',
      ...tasks.flatMap((task, index) => [
        `${index + 1}. ${task.title} · ${task.time}`,
        `   地点：${task.location}｜${task.owner}`,
        ...task.materials.map((item) => `   - [${item.checked ? 'x' : ' '}] ${item.label}${item.required ? '' : '（按需）'}`),
        '',
      ]),
      '由 CampusFlow 本地演示生成；提交前请人工核对原文与截止时间。',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'campusflow-action-plan.md'
    anchor.click()
    URL.revokeObjectURL(url)
    setNotice('清单已生成并下载。真实模式下仍需确认后才会写入外部系统。')
  }

  function openEvidence() {
    setNotice(`已定位到 ${selectedEvidence.id} · ${selectedEvidence.locator}。演示模式展示的是本地样例原文。`)
  }

  function selectTask(task: Task) {
    setSelectedTaskId(task.id)
    setSelectedEvidenceId(task.evidence[0])
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><Sparkles size={18} strokeWidth={2.5} /></div>
          <div><div className="brand-name">CampusFlow</div><div className="brand-caption">校园行动 OS</div></div>
        </div>
        <nav className="topnav" aria-label="主导航">
          <a className="active" href="#workspace">行动工作台</a>
          <a href="#evidence">知识与证据</a>
          <a href="#about">为什么可信</a>
        </nav>
        <div className="top-actions">
          <span className="demo-badge"><span className="pulse-dot" />本地演示</span>
          <button className="icon-button mobile-menu" aria-label="打开菜单"><Menu size={18} /></button>
          <button className="top-cta" onClick={runPlan}><Play size={14} fill="currentColor" />生成行动计划</button>
        </div>
      </header>

      <main>
        <section className="hero" id="workspace">
          <div className="hero-copy">
            <div className="eyebrow"><span />AI-native campus workflow</div>
            <h1>把校园通知，变成<br /><em>今天能做完的行动。</em></h1>
            <p className="hero-lede">CampusFlow 读懂通知、截图和资料，先查证，再规划，最后把每一步变成你能确认、能完成的行动。</p>
            <div className="hero-pills"><span><ShieldCheck size={14} />有据可查</span><span><Zap size={14} />会规划的 Agent</span><span><Fingerprint size={14} />隐私优先</span></div>
          </div>
          <div className="hero-orbit" aria-label="能力概览">
            <div className="orbit-ring orbit-ring-outer" /><div className="orbit-ring orbit-ring-inner" />
            <div className="orbit-center"><Sparkles size={20} /><strong>行动<br />而非答案</strong><small>AI Native</small></div>
            <div className="orbit-node node-top"><FileCheck2 size={16} /><span>RAG<br /><b>证据</b></span></div>
            <div className="orbit-node node-right"><Bot size={16} /><span>Agent<br /><b>规划</b></span></div>
            <div className="orbit-node node-bottom"><MapPin size={16} /><span>工具<br /><b>校验</b></span></div>
            <div className="orbit-node node-left"><FileImage size={16} /><span>多模态<br /><b>输入</b></span></div>
          </div>
        </section>

        <section className="workspace-grid">
          <aside className="input-column panel">
            <div className="panel-heading"><div><span className="kicker">01 / 输入目标</span><h2>你想完成什么？</h2></div><span className="step-chip">自然语言</span></div>
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} aria-label="行动目标" />
            <div className="input-toolbar"><button className="soft-button" onClick={() => fileRef.current?.click()}><Paperclip size={15} />上传通知 / 截图</button><input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.pdf,.txt" hidden onChange={(event) => handleUpload(event.target.files?.[0])} /><span className="char-count">{prompt.length}/500</span></div>
            <div className="quick-prompts"><span>试试这些</span>{quickPrompts.map((item) => <button key={item} onClick={() => setPrompt(item)}>{item}<ChevronRight size={13} /></button>)}</div>
            <button className="primary-button generate-button" onClick={runPlan} disabled={running}>{running ? <><RefreshCw size={16} className="spin" />正在查证与规划…</> : <><Sparkles size={16} />生成我的行动计划<ArrowRight size={16} /></>}</button>
            <div className="privacy-note"><ShieldCheck size={15} /><span>演示只使用通用合成校园资料，不代表任何学校官方通知。真实模式会先做隐私提示，再把必要片段送入模型。</span></div>
          </aside>

          <section className="plan-column panel">
            <div className="panel-heading plan-heading"><div><span className="kicker">02 / Agent 规划</span><h2>本周新生行动</h2></div><div className="progress-dial"><strong>{progress}%</strong><span>完成度</span></div></div>
            <div className="plan-meta"><span><CalendarClock size={14} />本周 · 3 个行动</span><span><Clock3 size={14} />预计 2 小时 30 分</span><button onClick={() => setOnlyEvening(!onlyEvening)} className={onlyEvening ? 'filter-chip active' : 'filter-chip'}>{onlyEvening ? '仅晚上有空' : '周三下午有空'}</button></div>
            <div className="agent-trace">
              {['理解目标', '检索证据', '调用工具', '等待确认'].map((label, index) => <div className={stage >= index + 1 ? 'trace-step active' : 'trace-step'} key={label}><span>{stage > index + 1 ? <Check size={12} /> : index + 1}</span><label>{label}</label></div>)}
            </div>
            <div className="task-list">
              {tasks.map((task, index) => <article className={selectedTaskId === task.id ? 'task-card selected' : 'task-card'} key={task.id} role="button" tabIndex={0} aria-pressed={selectedTaskId === task.id} onClick={() => selectTask(task)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectTask(task) } }}>
                <div className="task-index">0{index + 1}</div><div className="task-main"><div className="task-title-row"><h3>{task.title}</h3><span className={'status-pill ' + statusMeta[task.status].className}>{task.status === 'done' && <CheckCircle2 size={12} />}{statusMeta[task.status].label}</span></div><p>{task.detail}</p><div className="task-meta"><span><Clock3 size={13} />{task.time}</span><span><MapPin size={13} />{task.location}</span><span className="owner-tag">{task.owner}</span></div></div><button className={task.status === 'done' ? 'task-check checked' : 'task-check'} onClick={(event) => { event.stopPropagation(); updateTaskStatus(task.id) }} aria-label={task.title + (task.status === 'done' ? '标记未完成' : '标记完成')}>{task.status === 'done' ? <Check size={16} /> : ''}</button>
              </article>)}
            </div>
            <div className="plan-footer"><div className="footer-stat"><span className="stat-number">{checkedMaterials}<small>/{totalMaterials}</small></span><span>材料已备齐</span></div><div className="footer-stat"><span className="stat-number">{tasks.filter((task) => task.evidence.length).length}<small>/{tasks.length}</small></span><span>行动有依据</span></div><button className="secondary-button" onClick={downloadChecklist}>导出清单 <Download size={14} /></button></div>
          </section>

          <aside className="evidence-column panel" id="evidence">
            <div className="panel-heading"><div><span className="kicker">03 / 证据与确认</span><h2>为什么这样安排？</h2></div><span className="confidence"><span />{retrievedEvidenceIds.length > 0 ? `本次检索 ${retrievedEvidenceIds.length} 条` : '合成资料包'}</span></div>
            <div className="evidence-context"><div className="context-icon"><Info size={17} /></div><div><strong>{selectedTask.title}</strong><p>{selectedTask.note}</p></div></div>
            <div className="evidence-list">{visibleEvidenceIds.length > 0 ? visibleEvidenceIds.map((id) => { const item = evidence.find((entry) => entry.id === id)!; return <button className={selectedEvidenceId === id ? 'evidence-card active' : 'evidence-card'} key={id} onClick={() => setSelectedEvidenceId(id)}><div className="evidence-top"><span className="source-id">{item.id}</span><span className="match-score">{Math.round(item.score * 100)}% 匹配</span></div><strong>{item.title}</strong><span className="evidence-source">{item.source}</span><p>{item.excerpt}</p><div className="evidence-bottom"><span>{item.locator}</span><span>更新于 {item.updated}</span></div></button> }) : <div className="evidence-empty"><CircleAlert size={16} /><strong>暂未找到足够依据</strong><p>请补充通知、办理事项或截止时间。系统不会为通用问题编造校园事实。</p></div>}</div>
            {visibleEvidenceIds.length > 0 && <div className="selected-source"><div className="source-line"><span className="source-id">{selectedEvidence.id}</span><span>当前依据</span><span className="source-score">{Math.round(selectedEvidence.score * 100)}%</span></div><p>“{selectedEvidence.excerpt}”</p><button onClick={openEvidence}>打开原文定位 <ExternalLink size={13} /></button></div>}
            {approvalVisible && <div className="approval-box"><div className="approval-icon"><CircleAlert size={17} /></div><div><strong>提交前需要你的确认</strong><p>CampusFlow 不会替你提交系统或写入日历。确认后才会生成可导出的清单。</p></div><button aria-label="关闭提示" onClick={() => setApprovalVisible(false)}><X size={14} /></button></div>}
          </aside>
        </section>

        <section className="simulation panel" id="about">
          <div className="simulation-copy"><span className="kicker">04 / 情景推演</span><h2>如果我只有晚上有空？</h2><p>把计划当成可以调整的地图。修改约束，Agent 重新排序并告诉你为什么。</p><button className="secondary-button" onClick={() => { setOnlyEvening(!onlyEvening); setNotice('已切换时间约束。真实 Agent 会重新计算依赖和窗口。') }}>{onlyEvening ? '恢复周三下午' : '试试重新规划'} <RefreshCw size={14} /></button></div>
          <div className="simulation-board"><div className="sim-track"><div className="sim-day muted"><span>周二</span><small>今天</small></div><div className="sim-line" /><div className={onlyEvening ? 'sim-day highlighted' : 'sim-day'}><span>周三</span><small>{onlyEvening ? '19:00 后' : '14:00–17:00'}</small><i /></div><div className="sim-line" /><div className="sim-day"><span>周四</span><small>晚上</small><i /></div><div className="sim-line" /><div className="sim-day"><span>周五</span><small>截止前</small><i /></div></div><div className="sim-callout"><Zap size={14} /><span>{onlyEvening ? '领取校园卡移到周四窗口，报修可今晚完成；奖助材料仍保留周四晚上。' : '窗口型任务优先排在周三下午，线上任务作为缓冲。'}</span></div></div>
        </section>
        <div className="status-toast" role="status"><span className="toast-dot" />{notice}</div>
      </main>
      <footer className="footer"><span>CampusFlow / v0.1 · 通用合成资料</span><span>为 2026 传智杯 AI WEB 赛道准备</span><span><ShieldCheck size={13} />隐私边界已开启</span></footer>
    </div>
  )
}

export default App
