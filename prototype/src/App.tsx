import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight, Bell, BookOpen, CalendarDays, Check, CheckCircle2, ChevronRight, CircleAlert,
  ClipboardCheck, Clock3, Download, ExternalLink, FileText, Info, MapPin, Menu,
  Paperclip, Play, RefreshCw, Search, ShieldCheck, Sparkles, X,
} from 'lucide-react'
import { evidence, evidenceById, initialTasks, packNotice, quickPrompts } from './data'
import { createChecklist, matchTaskIds, missingRequired, retrieveEvidence, reviewPlan, scheduleTasks } from './lib/planner'
import { restoreProgress, saveProgress } from './lib/storage'
import type { Availability, Evidence, RetrievalHit, ReviewResult, ScheduledTask, Task, TraceEvent } from './types'

const stages = [
  { label: '理解目标', icon: Sparkles },
  { label: '召回依据', icon: Search },
  { label: '排期检查', icon: CalendarDays },
  { label: 'Reviewer 审核', icon: ShieldCheck },
  { label: '等待确认', icon: ClipboardCheck },
]

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => restoreProgress(initialTasks))
  const [prompt, setPrompt] = useState(quickPrompts[0].text)
  const [availability, setAvailability] = useState<Availability>('afternoon')
  const [stage, setStage] = useState(0)
  const [running, setRunning] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState('repair')
  const [selectedEvidenceId, setSelectedEvidenceId] = useState('E-03')
  const [retrievalHits, setRetrievalHits] = useState<RetrievalHit[]>([])
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null)
  const [hasRun, setHasRun] = useState(false)
  const [noEvidence, setNoEvidence] = useState(false)
  const [notice, setNotice] = useState('本地演示已就绪。输入一个目标，看看它如何变成可执行的周计划。')
  const [drawerEvidence, setDrawerEvidence] = useState<Evidence | null>(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [libraryQuery, setLibraryQuery] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const timerRefs = useRef<number[]>([])

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? tasks[0]
  const schedule = useMemo(() => scheduleTasks(tasks, availability), [tasks, availability])
  const selectedSchedule = schedule.find((item) => item.task.id === selectedTask.id) ?? schedule[0]
  const selectedEvidence = evidenceById.get(selectedEvidenceId) ?? evidenceById.get(selectedTask.evidence[0]) ?? evidence[0]
  const completedTasks = tasks.filter((task) => task.status === 'done').length
  const completedMaterials = tasks.flatMap((task) => task.materials).filter((item) => item.checked).length
  const totalMaterials = tasks.flatMap((task) => task.materials).length
  const progress = Math.round((completedTasks / tasks.length) * 100)
  const relevantEvidence = useMemo(() => {
    const ids = new Set(selectedTask.evidence)
    const ranked = retrievalHits.filter((hit) => ids.has(hit.evidence.id))
    return ranked.length ? ranked : selectedTask.evidence.map((id) => ({ evidence: evidenceById.get(id)!, score: 0, matchedTerms: [] }))
  }, [retrievalHits, selectedTask.evidence])
  const libraryResults = useMemo(() => {
    const query = libraryQuery.trim().toLowerCase()
    if (!query) return evidence
    return evidence.filter((item) => (item.title + item.domain + item.text + item.keywords.join('')).toLowerCase().includes(query))
  }, [libraryQuery])

  useEffect(() => { saveProgress(tasks) }, [tasks])
  useEffect(() => () => { timerRefs.current.forEach((timer) => window.clearTimeout(timer)) }, [])
  useEffect(() => {
    if (!drawerEvidence && !exportOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setDrawerEvidence(null); setExportOpen(false) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [drawerEvidence, exportOpen])

  function selectTask(task: Task) {
    setSelectedTaskId(task.id)
    setSelectedEvidenceId(task.evidence[0])
    document.querySelector('#detail-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }
  function updateTaskStatus(id: string) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, status: task.status === 'done' ? 'todo' : 'done' } : task))
    setNotice('已更新本地完成状态。外部提交仍需要人工确认。')
  }
  function toggleMaterial(taskId: string, materialId: string) {
    setTasks((current) => current.map((task) => task.id !== taskId ? task : {
      ...task, materials: task.materials.map((item) => item.id === materialId ? { ...item, checked: !item.checked } : item),
    }))
    setNotice('材料进度已保存到本机。不会保存你的输入内容或文件。')
  }
  function stopPlanning() {
    timerRefs.current.forEach((timer) => window.clearTimeout(timer))
    timerRefs.current = []
    setRunning(false); setStage(0)
    setNotice('已取消本次规划。原有任务和材料进度保持不变。')
  }
  function runPlan() {
    if (running) return
    const hits = retrieveEvidence(prompt)
    const matchedTaskIds = matchTaskIds(prompt)
    const firstMatched = matchedTaskIds[0] ?? selectedTaskId
    const matchedTask = tasks.find((task) => task.id === firstMatched) ?? selectedTask
    const plannedSchedule = scheduleTasks(tasks, availability)
    const review = reviewPlan(prompt, tasks, plannedSchedule, hits, matchedTaskIds)
    timerRefs.current.forEach((timer) => window.clearTimeout(timer))
    setRetrievalHits(hits); setReviewResult(review); setHasRun(true); setNoEvidence(hits.length === 0 || matchedTaskIds.length === 0)
    setSelectedTaskId(matchedTask.id)
    setSelectedEvidenceId(hits.find((hit) => matchedTask.evidence.includes(hit.evidence.id))?.evidence.id ?? matchedTask.evidence[0])
    setRunning(true); setStage(1)
    setNotice(hits.length ? '已从合成资料包召回 ' + hits.length + ' 条依据，正在拆解你的目标。' : '没有找到能支持这个目标的资料，系统会保留人工核对入口。')
    timerRefs.current = [
      window.setTimeout(() => { setStage(2); setNotice(hits.length ? '已按关键词相关度排序 ' + hits.length + ' 条资料，保留原文定位。' : '检索结果为空，没有依据就不生成确定结论。') }, 550),
      window.setTimeout(() => { setStage(3); setNotice('正在检查开放时间、材料依赖和可用时段。') }, 1100),
      window.setTimeout(() => { setStage(4); setNotice(review.status === 'blocked' ? 'Reviewer 已阻止确定性结论，请补充可核验依据。' : review.status === 'needs_review' ? 'Reviewer 标记了需要人工确认的事项。' : 'Reviewer 已通过基础检查，仍请在导出前复核。') }, 1450),
      window.setTimeout(() => { setStage(5); setRunning(false); setNotice(hits.length ? '计划已准备好。请检查审核结果、冲突与材料，再决定是否导出。' : '已完成保守检查。请补充通知或办理事项后再生成计划。') }, 1950),
    ]
  }
  async function handleUpload(file?: File) {
    if (!file) return
    if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
      const text = await file.text()
      setPrompt(text.slice(0, 500)); setNotice('已读取 ' + file.name + ' 的文本内容。你仍可以编辑后再生成计划。')
      return
    }
    setPrompt('请解析这份材料：' + file.name)
    setNotice('已记录文件名。当前版本只对文本通知做本地读取，图片/PDF 解析会在后续版本接入。')
  }
  function resetDemo() {
    setTasks(initialTasks); setPrompt(quickPrompts[0].text); setAvailability('afternoon'); setStage(0)
    setRetrievalHits([]); setReviewResult(null); setHasRun(false); setNoEvidence(false); setSelectedTaskId('repair'); setSelectedEvidenceId('E-03')
    setNotice('演示已重置。你的本地进度也已清空。')
    try { localStorage.removeItem('campusflow:progress:v2') } catch { /* private browsing can reject storage */ }
  }
  function downloadChecklist() {
    const blob = new Blob([createChecklist(schedule, availability)], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a')
    anchor.href = url; anchor.download = 'campusflow-action-plan.md'; anchor.click(); URL.revokeObjectURL(url)
    setExportOpen(false); setNotice('清单已下载到本机。它没有写入日历，也没有发送到外部系统。')
  }

  const trace: TraceEvent[] = [
    { id: 'parse', label: '理解目标', detail: '提取事项与时间约束', state: 'done' },
    { id: 'retrieve', label: '召回依据', detail: hasRun ? retrievalHits.length + ' 条资料' : '等待输入', state: noEvidence ? 'warning' : 'done' },
    { id: 'schedule', label: '排期检查', detail: availability === 'evening' ? '检测晚间窗口' : '检查可用时间', state: schedule.some((item) => item.conflict) ? 'warning' : 'done' },
    { id: 'review', label: 'Reviewer 审核', detail: reviewResult ? (reviewResult.status === 'pass' ? '基础检查通过' : reviewResult.status === 'blocked' ? '阻止确定性结论' : '需要人工确认') : '等待运行', state: reviewResult?.status === 'pass' ? 'done' : reviewResult ? 'warning' : 'done' },
    { id: 'confirm', label: '等待确认', detail: '导出前由你决定', state: 'done' },
  ]
  const reviewerLabel = reviewResult?.status === 'pass' ? '已通过' : reviewResult?.status === 'blocked' ? '已阻止确定性结论' : '需要人工确认'
  const reviewerLead = reviewResult?.findings[0]?.message ?? '未发现阻断项，导出前仍请核对真实通知。'

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      <header className="topbar">
        <div className="brand-lockup"><div className="brand-mark" aria-hidden="true"><Sparkles size={17} strokeWidth={2.4} /></div><div><div className="brand-name" translate="no">CampusFlow</div><div className="brand-caption">校园行动 OS</div></div></div>
        <nav className={mobileNavOpen ? 'topnav open' : 'topnav'} aria-label="主导航"><a className="active" href="#workspace" onClick={() => setMobileNavOpen(false)}>行动工作台</a><a href="#library" onClick={() => setMobileNavOpen(false)}>知识资料</a><a href="#about" onClick={() => setMobileNavOpen(false)}>使用边界</a></nav>
        <div className="top-actions"><span className="demo-badge"><span className="pulse-dot" />本地演示</span><button className="icon-button mobile-menu" aria-label="打开菜单" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((value) => !value)}><Menu size={18} /></button><button className="text-button reset-button" onClick={resetDemo}>重置演示</button><button className="top-cta" onClick={runPlan} disabled={running}><Play size={14} fill="currentColor" />{running ? '规划中…' : '生成行动计划'}</button></div>
      </header>

      <div className="app-layout">
        <aside className="sidebar" aria-label="工作区导航">
          <div className="workspace-switcher"><div className="workspace-avatar">C</div><div><strong>我的校园周</strong><span>通用合成校园资料</span></div><ChevronRight size={15} /></div>
          <div className="sidebar-group"><span className="sidebar-label">工作区</span><a className="side-link active" href="#workspace"><ClipboardCheck size={16} />行动计划<span className="count-badge">{tasks.length}</span></a><a className="side-link" href="#calendar"><CalendarDays size={16} />本周日程</a><a className="side-link" href="#library"><BookOpen size={16} />知识资料<span className="count-badge soft">{evidence.length}</span></a></div>
          <div className="sidebar-group sidebar-note"><span className="sidebar-label">当前状态</span><div className="privacy-card"><ShieldCheck size={17} /><div><strong>隐私边界已开启</strong><p>资料在本地演示中处理。不会自动提交或写入外部系统。</p></div></div></div>
          <div className="sidebar-bottom"><button className="side-help"><Bell size={15} />演示提示<ChevronRight size={14} /></button><span>v0.2 · 2026.10</span></div>
        </aside>

        <main id="main-content" className="main-content">
          <section className="workspace-header" id="workspace"><div><div className="breadcrumb"><span>工作区</span><ChevronRight size={13} /><strong>行动计划</strong></div><h1>这周，先把重要的事做完。</h1><p>把通知里的截止时间、地点和材料，变成一份你能检查的计划。</p></div><div className="header-status"><span><span className="status-dot" />资料包已加载</span><span><ShieldCheck size={14} />仅本地演示</span></div></section>
          <section className="week-strip" id="calendar" aria-label="本周进度"><div className="week-intro"><span className="eyebrow">本周进度</span><strong>{completedTasks}/{tasks.length}</strong><small>项已完成</small></div><div className="week-days"><div className="week-day muted"><span>周二</span><small>10/27</small></div><div className="week-day active"><span>周三</span><small>10/28 · 今天</small><i style={{ width: Math.max(18, progress) + '%' }} /></div><div className="week-day"><span>周四</span><small>10/29</small></div><div className="week-day"><span>周五</span><small>10/30 · 截止</small></div></div><div className="week-total"><strong>{progress}%</strong><span>完成度</span></div></section>

          <section className="workspace-grid" aria-label="计划工作台">
            <section className="input-panel panel"><div className="section-heading"><div><span className="section-index">01</span><div><span className="eyebrow">输入目标</span><h2>你想完成什么？</h2></div></div><span className="quiet-tag">自然语言</span></div><label className="sr-only" htmlFor="goal-input">行动目标</label><textarea id="goal-input" name="goal" value={prompt} onChange={(event) => setPrompt(event.target.value.slice(0, 500))} placeholder="例如：我周三下午有空，帮我安排报到和报修…" /><div className="input-footer"><button className="upload-button" onClick={() => fileRef.current?.click()}><Paperclip size={15} />上传通知 / 截图</button><input ref={fileRef} type="file" accept=".txt,.png,.jpg,.jpeg,.pdf" hidden onChange={(event) => { void handleUpload(event.target.files?.[0]); event.target.value = '' }} /><span>{prompt.length}/500</span></div><div className="prompt-list"><div className="prompt-list-heading"><span>快速开始</span><span>点击填入</span></div>{quickPrompts.map((item) => <button key={item.label} onClick={() => setPrompt(item.text)}><span>{item.label}</span><ChevronRight size={14} /></button>)}</div><div className="availability-field"><div><span className="eyebrow">时间约束</span><strong>我什么时候有空？</strong></div><div className="availability-toggle" role="group" aria-label="可用时间"><button className={availability === 'afternoon' ? 'selected' : ''} onClick={() => setAvailability('afternoon')}>周三下午</button><button className={availability === 'evening' ? 'selected' : ''} onClick={() => setAvailability('evening')}>只有晚上</button></div></div><button className="primary-button generate-button" onClick={runPlan} disabled={running}>{running ? <><RefreshCw size={16} className="spin" />正在查证与规划…</> : <><Sparkles size={16} />生成我的行动计划<ArrowRight size={16} /></>}</button><p className="privacy-note"><ShieldCheck size={15} /><span>{packNotice} 当前不需要 API Key。</span></p></section>

            <section className="plan-panel panel"><div className="panel-topline"><div><span className="section-index">02</span><div><span className="eyebrow">Agent 规划</span><h2>{noEvidence ? '示例行动队列' : '我的行动队列'}</h2></div></div><div className="plan-head-actions"><span className="plan-mode">演示规则</span><button className="more-button" aria-label="取消或重新生成计划" onClick={running ? stopPlanning : runPlan}>{running ? <X size={15} /> : <RefreshCw size={15} />}</button></div></div><div className="plan-summary"><div><strong>{tasks.length} 个行动</strong><span>预计 {Math.floor(tasks.reduce((sum, task) => sum + task.duration, 0) / 60)} 小时 {tasks.reduce((sum, task) => sum + task.duration, 0) % 60} 分</span></div><div className="plan-constraint"><Clock3 size={14} />{availability === 'evening' ? '仅晚上有空' : '周三下午有空'}</div></div><div className="agent-trace" aria-label="Agent 工作阶段">{stages.map((item, index) => { const Icon = item.icon; const active = stage >= index + 1; const event = trace[index]; return <div className={active ? 'trace-item active' : 'trace-item'} key={item.label}><div className="trace-icon">{event.state === 'warning' ? <CircleAlert size={14} /> : active && stage > index + 1 ? <Check size={14} /> : <Icon size={14} />}</div><span>{item.label}</span><small>{event.detail}</small></div> })}</div>{reviewResult && <div className={'review-banner ' + reviewResult.status} role="status"><div className="review-banner-icon">{reviewResult.status === 'pass' ? <ShieldCheck size={17} /> : <CircleAlert size={17} />}</div><div className="review-banner-copy"><div className="review-banner-heading"><strong>Reviewer · {reviewerLabel}</strong><span>{reviewResult.checkedTaskIds.length} 项行动 · {reviewResult.checkedEvidenceIds.length} 条依据</span></div><p>{reviewerLead}</p>{reviewResult.findings.length > 1 && <small>还有 {reviewResult.findings.length - 1} 项检查结果，展开详情前请先人工核对。</small>}</div></div>}{noEvidence && <><div className="no-evidence-banner"><CircleAlert size={17} /><div><strong>暂未找到足够依据</strong><p>系统不会为通用问题编造校园事实。补充通知、办理事项或截止时间后再试。</p></div></div><div className="stale-plan-note">下面保留上一份示例计划，未针对当前输入更新。补充依据后再生成。</div></>}<div className="task-list">{schedule.map((item, index) => <TaskCard key={item.task.id} item={item} index={index} selected={selectedTask.id === item.task.id} onSelect={selectTask} onToggle={updateTaskStatus} />)}</div><div className="plan-footer"><div className="footer-stat"><strong>{completedMaterials}<small>/{totalMaterials}</small></strong><span>材料已核对</span></div><div className="footer-stat"><strong>{tasks.filter((task) => task.evidence.length).length}<small>/{tasks.length}</small></strong><span>行动有依据</span></div><button className="secondary-button" onClick={() => setExportOpen(true)}><Download size={14} />导出清单</button></div></section>

            <aside className="detail-panel panel" id="detail-panel"><div className="detail-heading"><div><span className="section-index">03</span><div><span className="eyebrow">当前事项</span><h2>{selectedTask.title}</h2></div></div><span className={selectedSchedule.conflict ? 'conflict-tag' : 'ready-tag'}>{selectedSchedule.conflict ? '待协调' : '可安排'}</span></div><div className="selected-schedule"><div className="schedule-icon"><CalendarDays size={17} /></div><div><strong>{selectedSchedule.day} · {selectedSchedule.time}</strong><span><MapPin size={13} />{selectedTask.location}</span></div></div><div className="detail-reason"><Info size={15} /><p>{selectedSchedule.reason}</p></div><div className="detail-section"><div className="detail-section-title"><strong>材料清单</strong><span>{selectedTask.materials.filter((item) => item.checked).length}/{selectedTask.materials.length}</span></div><div className="material-list">{selectedTask.materials.map((item) => <label className={item.checked ? 'material-row checked' : 'material-row'} key={item.id}><input type="checkbox" checked={item.checked} onChange={() => toggleMaterial(selectedTask.id, item.id)} /><span className="check-box">{item.checked && <Check size={12} />}</span><span>{item.label}</span>{item.required ? <em>必备</em> : <em className="optional">按需</em>}</label>)}</div></div><div className="detail-section evidence-section"><div className="detail-section-title"><strong>支持这一步的依据</strong><span>{relevantEvidence.length} 条</span></div><div className="evidence-mini-list">{relevantEvidence.map((hit) => <button className={selectedEvidence.id === hit.evidence.id ? 'evidence-mini selected' : 'evidence-mini'} key={hit.evidence.id} onClick={() => setSelectedEvidenceId(hit.evidence.id)}><span className="evidence-mini-id">{hit.evidence.id}</span><span><strong>{hit.evidence.title}</strong><small>{hit.evidence.locator}</small></span><ChevronRight size={14} /></button>)}</div><button className="text-link" onClick={() => setDrawerEvidence(selectedEvidence)}><FileText size={14} />打开原文定位<ExternalLink size={13} /></button></div><div className="confirm-note"><ShieldCheck size={16} /><span>提交、写入日历和发送提醒都需要你的确认。</span></div></aside>
          </section>

          <section className="activity-panel panel" id="about"><div className="activity-heading"><div><span className="section-index">04</span><div><span className="eyebrow">运行记录</span><h2>我为什么可以相信这份计划？</h2></div></div><span className="trace-id">trace · local-demo</span></div><div className="activity-grid">{trace.map((event, index) => <div className={event.state === 'warning' ? 'activity-item warning' : 'activity-item'} key={event.id}><span className="activity-number">0{index + 1}</span><div><strong>{event.label}</strong><p>{event.detail}</p></div><span className="activity-state">{event.state === 'warning' ? '需确认' : '已完成'}</span></div>)}</div><div className="activity-foot"><span><ShieldCheck size={14} />每个结论都能回到合成资料包中的来源。</span><span>当前使用关键词检索 + 规则排期，未调用外部模型。</span></div></section>

          <section className="library-panel panel" id="library"><div className="library-heading"><div><span className="eyebrow">知识资料</span><h2>当前演示资料包</h2><p>{packNotice}</p></div><label className="library-search"><Search size={15} /><span className="sr-only">搜索资料</span><input value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} placeholder="搜索标题、主题或关键词…" /></label></div><div className="library-grid">{libraryResults.map((item) => <button className="library-card" key={item.id} onClick={() => setDrawerEvidence(item)}><div className="library-card-top"><span>{item.id}</span><small>{item.domain}</small></div><strong>{item.title}</strong><p>{item.text}</p><span className="library-card-foot">{item.locator}<ChevronRight size={13} /></span></button>)}</div></section>
          <div className="status-toast" role="status" aria-live="polite"><span className="toast-dot" />{notice}</div>
        </main>
      </div>
      <footer className="footer"><span translate="no">CampusFlow / 校园行动 OS</span><span>通用合成资料 · 本地演示</span><span><ShieldCheck size={13} />不代办，不编造</span></footer>
      {drawerEvidence && <EvidenceDrawer item={drawerEvidence} onClose={() => setDrawerEvidence(null)} />}
      {exportOpen && <ExportModal schedule={schedule} availability={availability} onClose={() => setExportOpen(false)} onConfirm={downloadChecklist} />}
    </div>
  )
}

function TaskCard({ item, index, selected, onSelect, onToggle }: { item: ScheduledTask; index: number; selected: boolean; onSelect: (task: Task) => void; onToggle: (id: string) => void }) {
  const { task } = item
  return <article className={selected ? 'task-card selected' : 'task-card'} onClick={() => onSelect(task)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(task) } }} role="button" tabIndex={0} aria-pressed={selected}><div className="task-number">0{index + 1}</div><div className="task-content"><div className="task-title-line"><h3>{task.title}</h3><span className={item.conflict ? 'status-pill conflict' : task.status === 'done' ? 'status-pill done' : 'status-pill'}>{item.conflict ? '待协调' : task.status === 'done' ? <><CheckCircle2 size={12} />已完成</> : '待开始'}</span></div><p>{task.detail}</p><div className="task-meta"><span><Clock3 size={13} />{item.day} · {item.time}</span><span><MapPin size={13} />{task.location}</span></div>{item.conflict && <div className="task-warning"><CircleAlert size={13} />{item.reason}</div>}</div><button className={task.status === 'done' ? 'task-check checked' : 'task-check'} onClick={(event) => { event.stopPropagation(); onToggle(task.id) }} aria-label={task.title + (task.status === 'done' ? '标记未完成' : '标记完成')}>{task.status === 'done' && <Check size={15} />}</button></article>
}

function EvidenceDrawer({ item, onClose }: { item: Evidence; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><aside className="evidence-drawer" role="dialog" aria-modal="true" aria-labelledby="evidence-title"><div className="drawer-top"><div><span className="eyebrow">原文定位 · {item.id}</span><h2 id="evidence-title">{item.title}</h2></div><button className="icon-button" aria-label="关闭原文" onClick={onClose}><X size={18} /></button></div><div className="drawer-meta"><span><BookOpen size={14} />{item.source}</span><span><FileText size={14} />{item.locator}</span><span>更新于 {item.updated}</span></div><div className="source-document">{item.paragraphs.map((paragraph, index) => <p className={index === 1 ? 'highlighted' : ''} key={paragraph}>{index === 1 && <span className="highlight-label">引用段落</span>}{paragraph}</p>)}</div><div className="drawer-boundary"><ShieldCheck size={16} /><span>这是通用合成演示资料。真实接入时应显示学校、来源更新时间和授权边界。</span></div><button className="secondary-button drawer-close" onClick={onClose}>返回工作台</button></aside></div>
}
function ExportModal({ schedule, availability, onClose, onConfirm }: { schedule: ScheduledTask[]; availability: Availability; onClose: () => void; onConfirm: () => void }) {
  const conflicts = schedule.filter((item) => item.conflict)
  const missing = schedule.flatMap((item) => missingRequired(item.task))
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div className="export-modal" role="dialog" aria-modal="true" aria-labelledby="export-title"><div className="drawer-top"><div><span className="eyebrow">导出前确认</span><h2 id="export-title">检查这份行动清单</h2></div><button className="icon-button" aria-label="关闭导出预览" onClick={onClose}><X size={18} /></button></div><div className="export-summary"><div><strong>{schedule.length}</strong><span>个行动</span></div><div><strong>{missing.length}</strong><span>项必备材料待补</span></div><div><strong>{conflicts.length}</strong><span>个时间冲突</span></div></div><div className="export-warning"><CircleAlert size={17} /><p>{conflicts.length ? '有事项与当前空闲时间冲突，导出只会记录“待协调”，不会替你改写事实。' : '导出前请再核对真实通知、截止时间和材料要求。'}</p></div><pre className="export-preview">{createChecklist(schedule, availability)}</pre><div className="modal-actions"><button className="secondary-button" onClick={onClose}>继续检查</button><button className="primary-button" onClick={onConfirm}><Download size={15} />确认下载</button></div></div></div>
}

export default App
