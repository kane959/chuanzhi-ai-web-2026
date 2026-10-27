export type TaskStatus = 'done' | 'doing' | 'todo' | 'blocked'

export type Task = {
  id: string
  title: string
  detail: string
  time: string
  location: string
  status: TaskStatus
  owner: string
  materials: { label: string; required: boolean; checked: boolean }[]
  evidence: string[]
  note: string
}

export type Evidence = {
  id: string
  title: string
  source: string
  locator: string
  updated: string
  score: number
  excerpt: string
}

export const initialTasks: Task[] = [
  {
    id: 'card',
    title: '领取校园卡',
    detail: '完成身份核验并领取校园卡，后续门禁与图书馆服务都依赖此步骤。',
    time: '周三 · 14:00–15:00',
    location: '学生活动中心 · 一层服务台',
    status: 'done',
    owner: '本人到场',
    materials: [
      { label: '录取通知书', required: true, checked: true },
      { label: '有效身份证件', required: true, checked: true },
    ],
    evidence: ['E-01', 'E-02'],
    note: '需本人到场；窗口开放时间由 E-02 支持。',
  },
  {
    id: 'repair',
    title: '提交宿舍报修',
    detail: '拍照上传漏水位置，填写宿舍号，生成可追踪的维修工单。',
    time: '周三 · 15:30–16:00',
    location: '宿舍 6 栋 · 线上报修',
    status: 'doing',
    owner: '线上办理',
    materials: [
      { label: '问题照片', required: true, checked: false },
      { label: '宿舍号', required: true, checked: true },
    ],
    evidence: ['E-03'],
    note: '拍照会在本地压缩并清除 EXIF；提交前仍需确认。',
  },
  {
    id: 'grant',
    title: '准备奖助学金材料',
    detail: '根据家庭情况选择对应材料包，先完成缺项检查，再导出清单。',
    time: '周四 · 晚上',
    location: '线上准备 · 学工系统',
    status: 'todo',
    owner: '本人准备',
    materials: [
      { label: '申请表', required: true, checked: false },
      { label: '家庭情况说明', required: true, checked: false },
      { label: '证明材料（按需）', required: false, checked: false },
    ],
    evidence: ['E-04', 'E-05'],
    note: '材料清单存在“按需”项，系统不会把它误判为必交。',
  },
]

export const evidence: Evidence[] = [
  {
    id: 'E-01',
    title: '新生报到服务指南',
    source: '校园服务中心 / 2026 新生材料包',
    locator: '第 2 页 · 领取校园卡',
    updated: '2026-09-01',
    score: 0.98,
    excerpt: '新生凭录取通知书和有效身份证件，在学生活动中心一层服务台领取校园卡。',
  },
  {
    id: 'E-02',
    title: '校园服务窗口时间表',
    source: '校园服务中心 / 服务时间公告',
    locator: '表 1 · 新生服务窗口',
    updated: '2026-09-03',
    score: 0.91,
    excerpt: '周一至周五 08:30–17:00，午间 12:00–13:30 轮值服务。',
  },
  {
    id: 'E-03',
    title: '宿舍维修线上办理说明',
    source: '后勤保障处 / 报修服务指引',
    locator: '第 1 页 · 图片与位置',
    updated: '2026-08-28',
    score: 0.88,
    excerpt: '报修需填写楼栋、房间号和问题描述；建议上传一张能看清问题位置的照片。',
  },
  {
    id: 'E-04',
    title: '奖助学金申请通知',
    source: '学生工作处 / 2026 秋季通知',
    locator: '第 3 页 · 申请材料',
    updated: '2026-09-08',
    score: 0.84,
    excerpt: '申请表和家庭情况说明为必备材料，其他证明根据申请类别准备。',
  },
  {
    id: 'E-05',
    title: '学工系统填报帮助',
    source: '学生工作处 / 系统帮助中心',
    locator: '步骤 4 · 导出前检查',
    updated: '2026-09-10',
    score: 0.79,
    excerpt: '提交前可在“材料检查”页面查看缺失项，系统会保留草稿。',
  },
]

export const quickPrompts = [
  '我周三下午有空，帮我安排新生报到和宿舍报修',
  '把这张通知里的截止时间和必交材料整理出来',
  '我只有手机和身份证，奖助学金还缺什么？',
]
