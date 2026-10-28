import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const root = process.cwd()
const packPath = path.join(root, 'prototype', 'public', 'data', 'synthetic-campus-pack.json')
const outputPath = path.join(root, 'output', 'evaluation', 'demo-evaluation.json')
const pack = JSON.parse(await readFile(packPath, 'utf8'))
const documents = pack.documents

const normalize = (value) => value.toLowerCase().replace(/[\s，。！？、；：,.!?;:（）()]/g, '')

function retrieveEvidence(query, limit = 8) {
  const normalized = normalize(query)
  if (!normalized) return []
  return documents.flatMap((item) => {
    const matchedTerms = item.keywords.filter((term) => normalized.includes(normalize(term)))
    if (!matchedTerms.length) return []
    const score = matchedTerms.length * 2 + (normalized.includes(normalize(item.title)) ? 4 : 0)
    return [{ evidence: item, score, matchedTerms }]
  }).sort((a, b) => b.score - a.score || a.evidence.id.localeCompare(b.evidence.id)).slice(0, limit)
}

function matchTaskIds(query) {
  const groups = [
    ['card', /校园卡|报到|入学|新生/],
    ['repair', /宿舍|报修|漏水|漏电|维修/],
    ['grant', /奖助|奖学金|助学金|资助|家庭情况|申请表/],
  ]
  return groups.filter(([, pattern]) => pattern.test(query)).map(([id]) => id)
}

const taskSeeds = [
  {
    id: 'card', title: '领取校园卡', kind: 'onsite', duration: 45, evidence: ['E-01', 'E-02'],
    location: '学生活动中心 · 一层服务台', materials: [
      { id: 'offer', required: true, checked: true }, { id: 'identity', required: true, checked: true },
    ],
  },
  {
    id: 'repair', title: '提交宿舍报修', kind: 'online', duration: 30, evidence: ['E-03', 'E-06'],
    location: '线上办理 · 宿舍报修入口', materials: [
      { id: 'photo', required: false, checked: false }, { id: 'room', required: true, checked: true }, { id: 'description', required: true, checked: false },
    ],
  },
  {
    id: 'grant', title: '准备奖助学金材料', kind: 'online', duration: 60, evidence: ['E-04', 'E-05', 'E-07'],
    location: '线上准备 · 学工系统', materials: [
      { id: 'application', required: true, checked: false }, { id: 'family', required: true, checked: false }, { id: 'supporting', required: false, checked: false },
    ],
  },
]

function freshTasks() {
  return taskSeeds.map((task) => ({ ...task, materials: task.materials.map((item) => ({ ...item })) }))
}

function scheduleTasks(tasks, availability) {
  let cursor = availability === 'evening' ? 19 * 60 : 14 * 60
  const format = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
  return tasks.map((task) => {
    if (task.kind === 'onsite' && availability === 'evening') {
      return { task, day: '待协调', time: '需要白天时段', conflict: true, reason: '你的空闲时间在 19:00 后，校园卡窗口在 17:00 关闭（E-02）。' }
    }
    if (task.id === 'grant') {
      return { task, day: '周四', time: '19:00–20:00', conflict: false, reason: '材料准备可在线完成；预留周五 17:00 截止前的核对时间（E-07）。' }
    }
    const start = cursor
    cursor += task.duration + 15
    return { task, day: '周三', time: `${format(start)}–${format(start + task.duration)}`, conflict: false, reason: '安排在可用时间窗口内。' }
  })
}

function missingRequired(task) {
  return task.materials.filter((item) => item.required && !item.checked)
}

function reviewPlan(query, tasks, schedule, hits, activeTaskIds) {
  const findings = []
  const checkedTasks = tasks.filter((task) => activeTaskIds.includes(task.id))
  const checkedEvidenceIds = hits.map((hit) => hit.evidence.id)
  const normalized = query.toLowerCase()

  if (hits.length === 0 || checkedTasks.length === 0) {
    findings.push({ code: 'NO_EVIDENCE', severity: 'blocking', message: '没有找到能支持当前目标的校园资料。' })
  }
  if (/过期|矛盾|冲突|更正|最新通知/.test(normalized)) {
    findings.push({ code: 'SOURCE_CONFLICT', severity: 'warning', message: '输入提到过期或冲突信息，需要人工核对更新时间和原文版本。', evidenceIds: checkedEvidenceIds })
  }
  if (/身份证号|证件号|学号|手机号|家庭收入|\b\d{15,18}\b/.test(normalized)) {
    findings.push({ code: 'PII_REVIEW', severity: 'warning', message: '输入可能包含个人信息，需要遮罩并由用户确认。' })
  }
  if (/超时|失败|不可用/.test(normalized)) {
    findings.push({ code: 'TOOL_FALLBACK', severity: 'warning', message: '检测到工具或服务不可用描述，保留人工处理路径并提示重试。' })
  }
  checkedTasks.forEach((task) => {
    const scheduled = schedule.find((item) => item.task.id === task.id)
    if (!task.evidence.some((id) => checkedEvidenceIds.includes(id))) {
      findings.push({ code: 'TASK_UNSUPPORTED', severity: 'warning', message: `${task.id} 没有被本次召回结果直接支持。`, evidenceIds: task.evidence })
    }
    if (scheduled?.conflict) {
      findings.push({ code: 'TIME_CONFLICT', severity: 'warning', message: `${task.id} 与当前空闲时间冲突，需要另选时段。`, evidenceIds: task.evidence })
    }
    const missing = missingRequired(task)
    if (missing.length > 0) {
      findings.push({ code: 'MATERIAL_MISSING', severity: 'warning', message: `${task.id} 还有 ${missing.length} 项必备材料未核对。`, evidenceIds: task.evidence })
    }
  })
  const status = findings.some((finding) => finding.severity === 'blocking')
    ? 'blocked'
    : findings.some((finding) => finding.severity === 'warning') ? 'needs_review' : 'pass'
  return { status, findings, checkedTaskIds: checkedTasks.map((task) => task.id), checkedEvidenceIds }
}

const cases = [
  { id: 'CF-01', title: '新生报到 + 校园卡 + 周三下午', query: '我周三下午有空，帮我安排领取校园卡、宿舍报修和奖助学金材料。', availability: 'afternoon', expectedEvidence: ['E-01', 'E-02', 'E-03', 'E-04', 'E-05', 'E-07'], expectedTaskIds: ['card', 'repair', 'grant'], expectedStatus: 'needs_review' },
  { id: 'CF-02', title: '宿舍漏水截图', query: '宿舍漏水，报修需要准备什么？我只有晚上有空。', availability: 'evening', expectedEvidence: ['E-03', 'E-06'], expectedTaskIds: ['repair'], expectedStatus: 'needs_review' },
  { id: 'CF-03', title: '奖助学金材料缺项', query: '我只有手机和身份证，申请奖助学金还缺哪些必交材料？', availability: 'afternoon', expectedEvidence: ['E-04', 'E-05'], expectedTaskIds: ['grant'], expectedStatus: 'needs_review' },
  { id: 'CF-04', title: '只有晚上有空', query: '校园卡窗口晚上能办理吗？', availability: 'evening', expectedEvidence: ['E-02'], expectedTaskIds: ['card'], expectedStatus: 'needs_review' },
  { id: 'CF-05', title: '过期或矛盾通知', query: '请核对这份过期、矛盾的奖助学金最新通知和材料截止时间。', availability: 'afternoon', expectedEvidence: ['E-04', 'E-05', 'E-07'], expectedTaskIds: ['grant'], expectedStatus: 'needs_review' },
  { id: 'CF-06', title: '无关天气问题', query: '今天广州天气怎么样？', availability: 'afternoon', expectedEvidence: [], expectedTaskIds: [], expectedStatus: 'blocked', expectRefusal: true },
  { id: 'CF-07', title: '含身份证号的截图', query: '申请奖助学金，我的身份证号是 110101199001011234，还缺哪些必交材料？', availability: 'afternoon', expectedEvidence: ['E-04', 'E-05'], expectedTaskIds: ['grant'], expectedStatus: 'needs_review' },
  { id: 'CF-08', title: '工具超时', query: '提交报修工具超时、失败且不可用，怎么办？', availability: 'afternoon', expectedEvidence: ['E-03'], expectedTaskIds: ['repair'], expectedStatus: 'needs_review' },
]

const results = cases.map((scenario) => {
  const tasks = freshTasks()
  const hits = retrieveEvidence(scenario.query)
  const activeTaskIds = matchTaskIds(scenario.query)
  const schedule = scheduleTasks(tasks, scenario.availability)
  const review = reviewPlan(scenario.query, tasks, schedule, hits, activeTaskIds)
  const hitIds = hits.map((hit) => hit.evidence.id)
  const evidenceMatched = scenario.expectedEvidence.filter((id) => hitIds.includes(id))
  const tasksMatched = scenario.expectedTaskIds.filter((id) => activeTaskIds.includes(id))
  const refusalPassed = scenario.expectRefusal ? review.status === 'blocked' && hits.length === 0 : null
  return {
    id: scenario.id,
    title: scenario.title,
    query: scenario.query,
    availability: scenario.availability,
    retrieval: { evidenceIds: hitIds, scores: hits.map((hit) => hit.score), matchedExpected: evidenceMatched, recall: scenario.expectedEvidence.length ? evidenceMatched.length / scenario.expectedEvidence.length : 1 },
    tasks: { matched: activeTaskIds, matchedExpected: tasksMatched, coverage: scenario.expectedTaskIds.length ? tasksMatched.length / scenario.expectedTaskIds.length : 1 },
    reviewer: { status: review.status, expectedStatus: scenario.expectedStatus, passed: review.status === scenario.expectedStatus, findingCodes: review.findings.map((finding) => finding.code), checkedEvidenceIds: review.checkedEvidenceIds },
    refusal: scenario.expectRefusal ? { expected: true, passed: refusalPassed } : null,
  }
})

const evidenceDenominator = cases.reduce((sum, scenario) => sum + scenario.expectedEvidence.length, 0)
const evidenceNumerator = results.reduce((sum, result) => sum + result.retrieval.matchedExpected.length, 0)
const taskDenominator = cases.reduce((sum, scenario) => sum + scenario.expectedTaskIds.length, 0)
const taskNumerator = results.reduce((sum, result) => sum + result.tasks.matchedExpected.length, 0)
const refusalResults = results.filter((result) => result.refusal)
const reviewerPassed = results.filter((result) => result.reviewer.passed).length
const metrics = {
  evidenceRecall: evidenceDenominator ? evidenceNumerator / evidenceDenominator : 1,
  taskCoverage: taskDenominator ? taskNumerator / taskDenominator : 1,
  noEvidenceRefusalRate: refusalResults.length ? refusalResults.filter((result) => result.refusal.passed).length / refusalResults.length : 1,
  reviewerSafetyRate: results.length ? reviewerPassed / results.length : 1,
}
const thresholds = { evidenceRecall: 0.9, taskCoverage: 0.9, noEvidenceRefusalRate: 1, reviewerSafetyRate: 1 }
const thresholdPass = Object.entries(thresholds).every(([key, threshold]) => metrics[key] >= threshold)
const commit = (() => {
  try { return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim() } catch { return 'working-tree' }
})()
const report = {
  generatedAt: new Date().toISOString(),
  mode: 'demo',
  commit,
  sourcePack: pack.packId,
  rule: 'local lexical retrieval + deterministic schedule + Reviewer checks; no external model or network call',
  thresholds,
  metrics,
  thresholdPass,
  cases: results,
}

await mkdir(path.dirname(outputPath), { recursive: true })
await writeFile(outputPath, JSON.stringify(report, null, 2) + '\n', 'utf8')
console.log(`Demo evaluation written to ${path.relative(root, outputPath)}`)
console.log(`evidenceRecall=${metrics.evidenceRecall.toFixed(3)} taskCoverage=${metrics.taskCoverage.toFixed(3)} noEvidenceRefusalRate=${metrics.noEvidenceRefusalRate.toFixed(3)} reviewerSafetyRate=${metrics.reviewerSafetyRate.toFixed(3)}`)
console.log(`thresholdPass=${thresholdPass} (${results.length} fixed cases)`)
if (!thresholdPass) process.exitCode = 1
