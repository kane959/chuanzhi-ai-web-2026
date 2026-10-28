import pack from '../../public/data/synthetic-campus-pack.json'
import type { Availability, Evidence, RetrievalHit, ScheduledTask, Task } from '../types'

const documents: Evidence[] = pack.documents
const normalize = (value: string) => value.toLowerCase().replace(/[\s，。！？、；：,.!?;:（）()]/g, '')

/** Lexical demonstration retrieval. Score is relevance, never model confidence. */
export function retrieveEvidence(query: string, limit = 8): RetrievalHit[] {
  const normalized = normalize(query)
  if (!normalized) return []
  return documents.flatMap((item) => {
    const matchedTerms = item.keywords.filter((term) => normalized.includes(normalize(term)))
    if (!matchedTerms.length) return []
    const score = matchedTerms.length * 2 + (normalized.includes(normalize(item.title)) ? 4 : 0)
    return [{ evidence: item, score, matchedTerms }]
  }).sort((a, b) => b.score - a.score || a.evidence.id.localeCompare(b.evidence.id)).slice(0, limit)
}

/** Broad matches (time/material) may find evidence but must not choose a task on their own. */
export function matchTaskIds(query: string): string[] {
  const groups = [
    ['card', /校园卡|报到|入学|新生/],
    ['repair', /宿舍|报修|漏水|漏电|维修/],
    ['grant', /奖助|奖学金|助学金|资助|家庭情况|申请表/],
  ] as const
  return groups.filter(([, pattern]) => pattern.test(query)).map(([id]) => id)
}

export function scheduleTasks(tasks: Task[], availability: Availability): ScheduledTask[] {
  let cursor = availability === 'evening' ? 19 * 60 : 14 * 60
  const format = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
  return tasks.map((task) => {
    if (task.kind === 'onsite' && availability === 'evening') {
      return { task, day: '待协调', time: '需要白天时段', conflict: true, reason: '你的空闲时间在 19:00 后，校园卡窗口在 17:00 关闭（E-02）。请另选白天时段。' }
    }
    if (task.id === 'grant') {
      return { task, day: '周四', time: '19:00–20:00', conflict: false, reason: '材料准备可在线完成；预留周五 17:00 截止前的核对时间（E-07）。' }
    }
    const start = cursor
    cursor += task.duration + 15
    return { task, day: '周三', time: `${format(start)}–${format(start + task.duration)}`, conflict: false,
      reason: task.kind === 'onsite' ? '安排在窗口开放期间；额外预留 15 分钟缓冲。' : '线上工单可全天填写，不受现场窗口限制（E-03）。' }
  })
}

export function missingRequired(task: Task) {
  return task.materials.filter((item) => item.required && !item.checked)
}

export function createChecklist(schedule: ScheduledTask[], availability: Availability): string {
  return [
    '# CampusFlow 行动清单', '',
    '通用合成校园资料，仅供体验，不代表任何学校官方通知。',
    '样例周：2026-10-28 至 2026-10-30。',
    `空闲约束：${availability === 'evening' ? '仅晚上有空' : '周三下午有空'}。`, '',
    ...schedule.flatMap(({ task, day, time, conflict, reason }, index) => [
      `## ${index + 1}. ${task.title}${task.status === 'done' ? '（本地已完成）' : ''}`, '',
      `安排：${day} ${time}（建议排期）`, `地点：${task.location}`,
      ...(conflict ? [`注意：${reason}`] : []),
      ...task.materials.map((item) => `- [${item.checked ? 'x' : ' '}] ${item.label}${item.required ? '（必备）' : '（按需 / 建议）'}`),
      `依据：${task.evidence.join('、')}`, '',
    ]),
    '此文件由本地规则演示生成，未调用语言模型，未向外部系统提交。请自行核对真实通知。',
  ].join('\n')
}
