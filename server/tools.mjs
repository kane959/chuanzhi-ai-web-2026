const WINDOWS = {
  card: { tool: 'window_lookup', taskId: 'card', title: '领取校园卡窗口', open: '工作日 09:00–17:00', location: '学生活动中心 · 一层服务台', sourceId: 'E-02' },
  repair: { tool: 'window_lookup', taskId: 'repair', title: '宿舍报修入口', open: '全天线上提交；紧急情况联系值班人员', location: '线上办理 · 宿舍报修入口', sourceId: 'E-03' },
  grant: { tool: 'window_lookup', taskId: 'grant', title: '奖助材料提交', open: '截止前在线准备，具体时间以通知为准', location: '线上准备 · 学工系统', sourceId: 'E-07' },
}

export function callWindowTool({ taskIds = [], availability = 'afternoon', customTime = '16:00' } = {}) {
  const ids = [...new Set(taskIds.filter((id) => WINDOWS[id]))]
  const result = ids.map((id) => {
    const item = WINDOWS[id]
    const conflict = id === 'card' && (availability === 'evening' || (availability === 'custom' && customTime >= '17:00'))
    return { ...item, conflict, reason: conflict ? `当前 ${customTime} 已超过 17:00 关闭时间` : '当前时段可继续核对' }
  })
  return { name: 'window_lookup', status: 'success', input: { taskIds: ids, availability, customTime }, result }
}
