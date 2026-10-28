import pack from '../public/data/synthetic-campus-pack.json'
import type { Evidence, Task } from './types'

export const evidence: Evidence[] = pack.documents
export const evidenceById = new Map(evidence.map((item) => [item.id, item]))
export const packNotice = pack.notice

export const initialTasks: Task[] = [
  {
    id: 'card', title: '领取校园卡', kind: 'onsite', duration: 45, status: 'todo',
    detail: '带好身份证件和录取通知书，到服务窗口完成身份核验。',
    location: '学生活动中心 · 一层服务台', evidence: ['E-01', 'E-02'],
    materials: [
      { id: 'offer', label: '录取通知书', required: true, checked: true },
      { id: 'identity', label: '有效身份证件', required: true, checked: true },
    ],
    note: '需要本人到场。工作日窗口在 17:00 关闭，晚间不能办理。',
  },
  {
    id: 'repair', title: '提交宿舍报修', kind: 'online', duration: 30, status: 'todo',
    detail: '整理问题照片和位置说明，核对后自行提交报修。',
    location: '线上办理 · 宿舍报修入口', evidence: ['E-03', 'E-06'],
    materials: [
      { id: 'photo', label: '问题照片', required: false, checked: false },
      { id: 'room', label: '楼栋与房间号', required: true, checked: true },
      { id: 'description', label: '问题描述', required: true, checked: false },
    ],
    note: '照片是建议项，不是必交项。涉及漏电或持续大量漏水时，应优先联系值班人员。',
  },
  {
    id: 'grant', title: '准备奖助学金材料', kind: 'online', duration: 60, status: 'todo',
    detail: '先备齐申请表与家庭情况说明，其他证明按申请类别准备。',
    location: '线上准备 · 学工系统', evidence: ['E-04', 'E-05', 'E-07'],
    materials: [
      { id: 'application', label: '申请表', required: true, checked: false },
      { id: 'family', label: '家庭情况说明', required: true, checked: false },
      { id: 'supporting', label: '其他证明材料', required: false, checked: false },
    ],
    note: '样例申请截止为 10 月 30 日 17:00。其他证明按需准备，不能统一当作必交材料。',
  },
]

export const quickPrompts = [
  { label: '安排入学这几件事', text: '我周三下午有空，帮我安排领取校园卡、宿舍报修和奖助学金材料。' },
  { label: '宿舍漏水怎么处理', text: '宿舍漏水，报修需要准备什么？我只有晚上有空。' },
  { label: '检查奖助材料缺项', text: '我只有手机和身份证，申请奖助学金还缺哪些必交材料？' },
]

export { retrieveEvidence } from './lib/planner'
export type { Task, TaskStatus, Evidence } from './types'
