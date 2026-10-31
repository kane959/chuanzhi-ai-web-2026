import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight, BookOpen, CalendarDays, Check, CheckCircle2, ChevronRight, CircleAlert,
  ClipboardCheck, Clock3, Download, ExternalLink, FileText, Globe2, Info, LoaderCircle, MapPin,
  Paperclip, RefreshCw, Search, ShieldCheck, Sparkles, X,
} from 'lucide-react'
import { evidence, initialTasks, packNotice, quickPrompts } from './data'
import { createChecklist, matchTaskIds, missingRequired, retrieveEvidence, reviewPlan, scheduleTasks } from './lib/planner'
import { restoreProgress, saveProgress } from './lib/storage'
import { apiBaseUrl, fetchApi } from './lib/api'
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
  const [prompt, setPrompt] = useState('')
  const [availability, setAvailability] = useState<Availability>('afternoon')
  const [stage, setStage] = useState(0)
  const [running, setRunning] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState('repair')
  const [selectedEvidenceId, setSelectedEvidenceId] = useState('E-03')
  const [retrievalHits, setRetrievalHits] = useState<RetrievalHit[]>([])
  const [liveEvidence, setLiveEvidence] = useState<Evidence[]>([])
  const [sourceUrl, setSourceUrl] = useState('')
  const [sourceSyncing, setSourceSyncing] = useState(false)
  const [sourceSyncState, setSourceSyncState] = useState<'checking' | 'ready' | 'unavailable' | 'disabled'>(apiBaseUrl ? 'checking' : 'disabled')
  const [sourceSyncError, setSourceSyncError] = useState('')
  const [sourceSyncInfo, setSourceSyncInfo] = useState('')
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null)
  const [modelPlanLabel, setModelPlanLabel] = useState('演示规则 · 可回退')
  const [hasRun, setHasRun] = useState(false)
  const [noEvidence, setNoEvidence] = useState(false)
  const [notice, setNotice] = useState('')
  const [drawerEvidence, setDrawerEvidence] = useState<Evidence | null>(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [view, setView] = useState<'workspace' | 'library' | 'about'>('workspace')
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [inputError, setInputError] = useState('')
  const planRequest = useRef(0)
  const [libraryQuery, setLibraryQuery] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const timerRefs = useRef<number[]>([])

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? tasks[0]
  const allEvidence = useMemo(() => [...liveEvidence, ...evidence], [liveEvidence])
  const allEvidenceById = useMemo(() => new Map(allEvidence.map((item) => [item.id, item])), [allEvidence])
  const schedule = useMemo(() => scheduleTasks(tasks, availability), [tasks, availability])
  const selectedSchedule = schedule.find((item) => item.task.id === selectedTask.id) ?? schedule[0]
  const selectedEvidence = allEvidenceById.get(selectedEvidenceId) ?? allEvidenceById.get(selectedTask.evidence[0]) ?? allEvidence[0]
  const completedTasks = tasks.filter((task) => task.status === 'done').length
  const completedMaterials = tasks.flatMap((task) => task.materials).filter((item) => item.checked).length
  const totalMaterials = tasks.flatMap((task) => task.materials).length
  const relevantEvidence = useMemo(() => {
    const ids = new Set(selectedTask.evidence)
    const ranked = retrievalHits.filter((hit) => ids.has(hit.evidence.id))
    return ranked.length ? ranked : selectedTask.evidence.map((id) => ({ evidence: allEvidenceById.get(id)!, score: 0, matchedTerms: [] }))
  }, [allEvidenceById, retrievalHits, selectedTask.evidence])
  const libraryResults = useMemo(() => {
    const query = libraryQuery.trim().toLowerCase()
    if (!query) return allEvidence
    return allEvidence.filter((item) => (item.title + item.domain + item.text + item.keywords.join('')).toLowerCase().includes(query))
  }, [allEvidence, libraryQuery])

  useEffect(() => { saveProgress(tasks) }, [tasks])
  useEffect(() => {
    if (!apiBaseUrl) return
    fetchApi('/api/sources').then((response) => response.ok ? response.json() : Promise.reject(new Error('not configured')))
      .then((payload: { enabled?: boolean }) => setSourceSyncState(payload.enabled ? 'ready' : 'disabled'))
      .catch(() => setSourceSyncState('unavailable'))
  }, [])
  useEffect(() => () => { timerRefs.current.forEach((timer) => window.clearTimeout(timer)) }, [])
  useEffect(() => {
    if (!drawerEvidence && !exportOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setDrawerEvidence(null); setExportOpen(false) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [drawerEvidence, exportOpen])

  useEffect(() => { document.getElementById('screen-title')?.focus({ preventScroll: true }) }, [view, step])

  function nextStep() {
    if (!prompt.trim()) { setInputError('先填写要办的事，或选择下方示例。'); document.getElementById('goal-input')?.focus(); return }
    setInputError(''); setNotice(''); setStep(2)
  }

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
    planRequest.current += 1
    setRunning(false); setStage(0)
    setNotice('已取消本次规划。原有任务和材料进度保持不变。')
  }
  async function syncSourcePage() {
    if (sourceSyncing) return
    const url = sourceUrl.trim()
    if (!url) { setSourceSyncError('先输入一个官网页面地址。'); return }
    setSourceSyncing(true); setSourceSyncError(''); setSourceSyncInfo('')
    try {
      const response = await fetchApi('/api/sources', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url }) })
      const payload = await response.json() as { ok?: boolean; error?: string; document?: Evidence }
      if (!response.ok || !payload.ok || !payload.document) throw new Error(payload.error ?? '同步失败，请稍后重试。')
      setLiveEvidence((current) => [payload.document!, ...current.filter((item) => item.id !== payload.document!.id)])
      setSelectedEvidenceId(payload.document.id)
      setSourceSyncInfo(`已加入资料库 · ${payload.document.id} · ${payload.document.paragraphs.length} 段摘要`)
      setNotice('官网页面已同步为待核验证据。生成计划前仍会经过 Reviewer。')
    } catch (error) {
      setSourceSyncError(error instanceof Error ? error.message : '同步失败，请稍后重试。')
    } finally { setSourceSyncing(false) }
  }
  function runPlan() {
    if (running) return
    if (!prompt.trim()) { setStep(1); nextStep(); return }
    setStep(3); setNotice('');
    const requestId = ++planRequest.current
    const hits = retrieveEvidence(prompt, 8, allEvidence)
    const matchedTaskIds = matchTaskIds(prompt)
    const firstMatched = matchedTaskIds[0] ?? selectedTaskId
    const matchedTask = tasks.find((task) => task.id === firstMatched) ?? selectedTask
    const plannedSchedule = scheduleTasks(tasks, availability)
    const review = reviewPlan(prompt, tasks, plannedSchedule, hits, matchedTaskIds)
    timerRefs.current.forEach((timer) => window.clearTimeout(timer))
    setRetrievalHits(hits); setReviewResult(review); setHasRun(true); setNoEvidence(hits.length === 0 || matchedTaskIds.length === 0)
    setModelPlanLabel('结构化 Planner · 连接中')
    void fetchApi('/api/plan', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ goal: prompt, availability, evidence: hits.map((hit) => ({ id: hit.evidence.id, title: hit.evidence.title, excerpt: hit.evidence.text })) }) })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('planner unavailable')))
      .then((payload: { plan?: { mode?: string; model?: string; fallbackReason?: string } }) => {
        if (requestId !== planRequest.current) return
        const plan = payload.plan
        if (!plan) throw new Error('planner unavailable')
        setModelPlanLabel(plan.mode === 'provider' ? `真实模型 · ${plan.model ?? '兼容接口'}` : `演示 Planner · ${plan.model ?? '本地规则'}`)
        setNotice(plan.fallbackReason ? `真实模型暂不可用，已安全回退演示模式：${plan.fallbackReason}` : '结构化 Planner 已返回结果，Reviewer 仍是最终闸门。')
      })
      .catch((error) => {
        if (requestId !== planRequest.current) return
        setModelPlanLabel(apiBaseUrl ? '演示 Planner · API 不可用' : '演示 Planner · 无 Key 可运行')
        if (apiBaseUrl) setNotice(error instanceof Error ? error.message : '后端暂时不可用，已回退本地演示。')
      })
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
    timerRefs.current.forEach((timer) => window.clearTimeout(timer))
    planRequest.current += 1
    setRunning(false); setStep(1); setView('workspace'); setInputError('')
    setTasks(initialTasks); setPrompt(''); setAvailability('afternoon'); setStage(0)
    setRetrievalHits([]); setReviewResult(null); setHasRun(false); setNoEvidence(false); setSelectedTaskId('repair'); setSelectedEvidenceId('E-03')
    setLiveEvidence([]); setSourceUrl(''); setSourceSyncError(''); setSourceSyncInfo(''); setModelPlanLabel('演示规则 · 可回退')
    setNotice('演示已重置，任务勾选进度已清空。')
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
        <a className="brand-lockup" href="#workspace" onClick={() => setView('workspace')} aria-label="CampusFlow 工作台">
          <ClipboardCheck size={28} strokeWidth={1.8} /><div><div className="brand-name" translate="no">CampusFlow</div><div className="brand-caption">校园事务，逐件办好</div></div>
        </a>
        <nav className="topnav" aria-label="主导航">
          {([['workspace', '工作台'], ['library', '资料库'], ['about', '使用说明']] as const).map(([key, label]) => <button key={key} aria-current={view === key ? 'page' : undefined} onClick={() => { setView(key); setNotice('') }}>{label}</button>)}
        </nav>
        <span className="demo-badge">规则演示版</span>
      </header>
      <main id="main-content" className="main-content">
        {view === 'workspace' && <>
          <ol className="onboarding-steps" aria-label="规划步骤">
            {['输入事项', '选择时间', '查看清单'].map((label, index) => <li key={label} aria-current={step === index + 1 ? 'step' : undefined} className={step > index + 1 ? 'completed' : ''}><span>{step > index + 1 ? <Check size={16} /> : index + 1}</span><strong>{label}</strong></li>)}
          </ol>
          <header className="workspace-header">
            <h1 id="screen-title" tabIndex={-1}>{step === 1 ? '这次，你想办什么事？' : step === 2 ? '选一个方便的时间。' : '看看接下来怎么做。'}</h1>
            <p>{step === 1 ? '输入校园事务，整理办理步骤、材料和原文依据。' : step === 2 ? '演示使用固定样例周；时间不合适的事项会标记出来。' : '先核对安排，再逐项准备材料、查看依据或导出。'}</p>
          </header>
          {step === 1 && <section className="wizard-panel panel" aria-label="输入事项">
            <label className="field-label" htmlFor="goal-input">要办的事</label>
            <textarea id="goal-input" value={prompt} aria-invalid={Boolean(inputError)} aria-describedby={inputError ? 'goal-error' : undefined} maxLength={500} onChange={(event) => { setPrompt(event.target.value); setInputError('') }} placeholder="例如：我想领取校园卡，还要处理宿舍漏水，需要准备什么？" />
            <div className="input-footer"><button className="upload-button" onClick={() => fileRef.current?.click()}><Paperclip size={16} />导入文本通知 (.txt)</button><span>{prompt.length}/500</span><input ref={fileRef} type="file" accept=".txt,text/plain" hidden onChange={(event) => { void handleUpload(event.target.files?.[0]); event.target.value = '' }} /></div>
            {inputError && <p className="field-error" id="goal-error" role="alert">{inputError}</p>}
            <div className="quick-start"><span>试试示例</span><div>{quickPrompts.map((item) => <button key={item.label} onClick={() => { setPrompt(item.text); setInputError(''); document.getElementById('goal-input')?.focus() }}>{item.label}<ArrowRight size={14} /></button>)}</div></div>
            <details className="source-disclosure"><summary>补充官网资料（可选）<span>{sourceSyncState === 'checking' ? '检查连接中' : sourceSyncState === 'ready' ? '可同步' : sourceSyncState === 'unavailable' ? '服务不可用' : '未配置服务'}</span></summary><div className="source-sync-card"><div className="source-sync-heading"><div><span className="eyebrow"><Globe2 size={12} />官网资料</span><strong>导入官网页面</strong></div><span className={sourceSyncState === 'ready' ? 'source-sync-status ready' : 'source-sync-status'}>{sourceSyncState === 'checking' ? '检查中' : sourceSyncState === 'ready' ? '已启用' : sourceSyncState === 'unavailable' ? 'API 不可用' : '待配置'}</span></div><div className="source-sync-row"><label className="sr-only" htmlFor="source-url">官网页面地址</label><input id="source-url" type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://example.edu.cn/notice" /><button className="secondary-button" onClick={() => { void syncSourcePage() }} disabled={sourceSyncing}>{sourceSyncing ? <LoaderCircle size={14} className="spin" /> : <Globe2 size={14} />}同步</button></div><p>支持教育官网的单个页面，保留原文链接。</p>{sourceSyncState === 'unavailable' && <div className="source-sync-error" role="alert">后端暂时不可用，同步会直接报错；请稍后重试。</div>}{sourceSyncError && <div className="source-sync-error" role="alert">{sourceSyncError}</div>}{sourceSyncInfo && <div className="source-sync-success" role="status">{sourceSyncInfo}</div>}</div></details>
            <div className="wizard-actions"><span>先用内置示例体验，资料可在资料库核对。</span><button className="primary-button" onClick={nextStep}>下一步：选择时间<ArrowRight size={16} /></button></div>
          </section>}
          {step === 2 && <section className="wizard-panel panel" aria-label="选择时间">
            <div className="goal-summary"><strong>这次要办</strong><p>{prompt}</p><button className="text-button" onClick={() => setStep(1)}>修改事项</button></div>
            <fieldset className="time-options"><legend>你什么时候方便？</legend>
              {([['afternoon', '周三下午', '样例时间 · 14:00 开始'], ['evening', '只有晚上', '样例时间 · 19:00 开始']] as const).map(([value, label, caption]) => <label key={value} className={availability === value ? 'selected' : ''}><input type="radio" name="availability" checked={availability === value} onChange={() => setAvailability(value)} /><span><strong>{label}</strong><small>{caption}</small></span></label>)}
            </fieldset>
            <p className="step-note">线下窗口可能在晚上关闭，结果中会提示时间冲突。</p>
            <div className="wizard-actions"><button className="text-button" onClick={() => setStep(1)}>上一步</button><button className="primary-button" onClick={runPlan}>生成我的行动计划<ArrowRight size={16} /></button></div>
          </section>}
          {step === 3 && <>
            <div className="result-toolbar"><button className="secondary-button" onClick={() => { if (running) stopPlanning(); setStep(2) }}>返回调整</button><span>{completedTasks}/{tasks.length} 项已完成 · {modelPlanLabel}</span><button className="text-button" onClick={resetDemo}>重置演示</button></div>
            {running && <div className="running-status" role="status"><LoaderCircle className="spin" size={18} />{stages[Math.min(Math.max(stage - 1, 0), stages.length - 1)].label}<button className="text-button" onClick={stopPlanning}>取消</button></div>}
            <div className="workspace-grid">            <section className="plan-panel panel"><div className="panel-topline"><div><div><h2>{noEvidence ? '未找到匹配事项' : '示例行动清单'}</h2></div></div><div className="plan-head-actions"><button className="more-button" aria-label="取消或重新生成计划" onClick={running ? stopPlanning : runPlan}>{running ? <X size={15} /> : <RefreshCw size={15} />}</button></div></div><div className="plan-summary"><div><strong>{tasks.length} 个行动</strong><span>预计 {Math.floor(tasks.reduce((sum, task) => sum + task.duration, 0) / 60)} 小时 {tasks.reduce((sum, task) => sum + task.duration, 0) % 60} 分</span></div><div className="plan-constraint"><Clock3 size={14} />{availability === 'evening' ? '仅晚上有空' : '周三下午有空'}</div></div>{reviewResult && <div className={'review-banner ' + reviewResult.status} role="status"><div className="review-banner-icon">{reviewResult.status === 'pass' ? <ShieldCheck size={17} /> : <CircleAlert size={17} />}</div><div className="review-banner-copy"><div className="review-banner-heading"><strong>核对结果 · {reviewerLabel}</strong><span>{reviewResult.checkedTaskIds.length} 项行动 · {reviewResult.checkedEvidenceIds.length} 条依据</span></div><p>{reviewerLead}</p>{reviewResult.findings.length > 1 && <small>还有 {reviewResult.findings.length - 1} 项检查结果，展开详情前请先人工核对。</small>}</div></div>}{noEvidence && <><div className="no-evidence-banner"><CircleAlert size={17} /><div><strong>暂未找到足够依据</strong><p>系统不会为通用问题编造校园事实。补充通知、办理事项或截止时间后再试。</p></div><div className="stale-plan-note">下面保留上一份示例计划，补充依据后再生成。</div></div></>}<p className="result-disclosure">以下来自内置合成资料，仍是规则演示，不代表官网生成的计划。</p><div className="task-list">{schedule.map((item, index) => <TaskCard key={item.task.id} item={item} index={index} selected={selectedTask.id === item.task.id} onSelect={selectTask} onToggle={updateTaskStatus} />)}</div><div className="plan-footer"><div className="footer-stat"><strong>{completedMaterials}<small>/{totalMaterials}</small></strong><span>材料已核对</span></div><div className="footer-stat"><strong>{tasks.filter((task) => task.evidence.length).length}<small>/{tasks.length}</small></strong><span>行动有依据</span></div><button className="secondary-button" onClick={() => setExportOpen(true)}><Download size={14} />导出清单</button></div></section>            <aside className="detail-panel panel" id="detail-panel"><div className="detail-heading"><div><div><span className="eyebrow">所选事项 · 材料与依据</span><h2>{selectedTask.title}</h2></div></div><span className={selectedSchedule.conflict ? 'conflict-tag' : 'ready-tag'}>{selectedSchedule.conflict ? '待协调' : '可安排'}</span></div><div className="selected-schedule"><div className="schedule-icon"><CalendarDays size={17} /></div><div><strong>{selectedSchedule.day} · {selectedSchedule.time}</strong><span><MapPin size={13} />{selectedTask.location}</span></div></div><div className="detail-reason"><Info size={15} /><p>{selectedSchedule.reason}</p></div><div className="detail-section"><div className="detail-section-title"><strong>材料清单</strong><span>{selectedTask.materials.filter((item) => item.checked).length}/{selectedTask.materials.length}</span></div><div className="material-list">{selectedTask.materials.map((item) => <label className={item.checked ? 'material-row checked' : 'material-row'} key={item.id}><input type="checkbox" checked={item.checked} onChange={() => toggleMaterial(selectedTask.id, item.id)} /><span className="check-box">{item.checked && <Check size={12} />}</span><span>{item.label}</span>{item.required ? <em>必备</em> : <em className="optional">按需</em>}</label>)}</div></div><div className="detail-section evidence-section"><div className="detail-section-title"><strong>支持这一步的依据</strong><span>{relevantEvidence.length} 条</span></div><div className="evidence-mini-list">{relevantEvidence.map((hit) => <button className={selectedEvidence.id === hit.evidence.id ? 'evidence-mini selected' : 'evidence-mini'} key={hit.evidence.id} onClick={() => setSelectedEvidenceId(hit.evidence.id)}><span className="evidence-mini-id">{hit.evidence.id}</span><span><strong>{hit.evidence.title}</strong><small>{hit.evidence.locator}</small></span><ChevronRight size={14} /></button>)}</div><button className="text-link" onClick={() => setDrawerEvidence(selectedEvidence)}><FileText size={14} />打开原文定位<ExternalLink size={13} /></button></div><div className="confirm-note"><ShieldCheck size={16} /><span>提交、写入日历和发送提醒都需要你的确认。</span></div></aside></div>
            <details className="process-disclosure"><summary>查看规划与核对过程</summary>          <section className="activity-panel panel" id="about"><div className="activity-heading"><div><div><h2>每一步都能回到依据。</h2></div></div><span className="trace-id">trace · {sourceSyncState === 'ready' ? 'source-api-ready' : 'local-demo'}</span></div><div className="activity-grid">{trace.map((event, index) => <div className={event.state === 'warning' ? 'activity-item warning' : 'activity-item'} key={event.id}><span className="activity-number">0{index + 1}</span><div><strong>{event.label}</strong><p>{event.detail}</p></div><span className="activity-state">{event.state === 'warning' ? '需确认' : '已完成'}</span></div>)}</div><div className="activity-foot"><span><ShieldCheck size={14} />每个结论都能回到合成资料包中的来源。</span><span>{modelPlanLabel}</span></div></section></details>
          </>}
        </>}
        {view === 'library' && <><header className="workspace-header"><h1 id="screen-title" tabIndex={-1}>资料库</h1><p>查看计划使用的依据，点击资料可读原文。</p></header>          <section className="library-panel panel" id="library"><div className="library-heading"><div><h2>可用资料</h2><p>{packNotice} {liveEvidence.length ? `已加入 ${liveEvidence.length} 条官网摘要。` : ''}</p></div><label className="library-search"><Search size={15} /><span className="sr-only">搜索资料</span><input value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} placeholder="搜索标题、主题或关键词…" /></label></div>{libraryResults.length === 0 && <p role="status">没有找到相关资料，换个关键词试试。</p>}<div className="library-grid">{libraryResults.map((item) => <button className="library-card" key={item.id} onClick={() => setDrawerEvidence(item)}><div className="library-card-top"><span>{item.id}</span><small>{item.domain}</small></div><strong>{item.title}</strong><p>{item.text}</p><span className="library-card-foot">{item.locator}<ChevronRight size={13} /></span></button>)}</div></section></>}
        {view === 'about' && <><header className="workspace-header"><h1 id="screen-title" tabIndex={-1}>使用说明</h1><p>知道它能做什么，也知道结果从哪里来。</p></header><section className="about-panel panel"><h2>从一件事开始</h2><p>填写事项，选择时间，再核对清单。任务进度仅保存在这台设备。</p><h2>当前是规则演示</h2><p>校园卡、宿舍报修、奖助材料使用通用合成校园资料，不代表任何学校官方通知。计划尚未由真实模型生成。</p><h2>资料导入的范围</h2><p>支持读取文本通知；官网同步需后端可用，连接失败会显示错误。图片与 PDF 解析暂未开放。</p><h2>执行前由你确认</h2><p>可以核对材料、打开原文定位、导出清单。系统不会替你提交申请或联系学校；仍需要人工确认。</p></section></>}
        {notice && <div className="status-toast" role="status" aria-live="polite">{notice}</div>}
      </main>
      <footer className="footer"><span>CampusFlow · 通用合成资料演示</span><span>核对来源，再开始行动。</span></footer>
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
