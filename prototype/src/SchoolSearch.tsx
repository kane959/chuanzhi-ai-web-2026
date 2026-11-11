import { useState } from 'react'
import { fetchApi } from './lib/api'
import type { Evidence } from './types'
type Candidate = { title: string; url: string; reason: string }
export function SchoolSearch({ onImport }: { onImport: (documents: Evidence[]) => void }) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [message, setMessage] = useState('')
  const [events, setEvents] = useState<{ type: string; url: string; status?: string }[]>([])
  async function run(url?: string) {
    setBusy(true); setMessage(url ? '正在抓取官网公开页面，请稍候…' : '正在搜索学校官网…'); setEvents([])
    if (!url) setCandidates([])
    try {
      const response = await fetchApi('/api/school', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(url ? { action: 'crawl', url } : { action: 'search', schoolName: name }) }, 35000)
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.error || '学校搜索失败。')
      if (url) {
        onImport(data.documents ?? []); setEvents(data.events ?? [])
        setMessage(`已加入 ${data.documents?.length ?? 0} 条官网摘要，${data.errors?.length ?? 0} 页失败。${(data.errors ?? []).map((item: { error: string }) => item.error).join("；")} ${data.boundary}`)
      } else { setCandidates(data.candidates ?? []); setMessage(data.message) }
    } catch (e) { setMessage(e instanceof Error ? e.message : '请求失败。') }
    finally { setBusy(false) }
  }
  return <section className="source-sync-card" aria-label="学校官网搜索">
    <h3>告诉我你的学校</h3><p>搜索学校官网，确认后自动采集公开通知摘要，加入本次资料库。</p>
    <div className="source-sync-row"><label htmlFor="school-name">学校全称</label><input id="school-name" value={name} maxLength={80} disabled={busy} placeholder="例如：广州航海学院" onChange={e => setName(e.target.value)} /><button type="button" className="secondary-button" disabled={busy || name.trim().length < 4} onClick={() => void run()}>搜索官网</button></div>
    {candidates.map(c => <div key={c.url}><p><strong>{c.title}</strong> · <a href={c.url} target="_blank" rel="noreferrer">{c.url}</a></p><p>{c.reason}</p><button type="button" className="secondary-button" disabled={busy} onClick={() => void run(c.url)}>确认这是我的学校，开始采集</button></div>)}
    <p role="status">{message}</p>
    {events.length > 0 && <details><summary>查看采集过程</summary>{events.map((e, i) => <p key={i}>{e.type} · {e.url} · {e.status ?? '请求公开页面'}</p>)}</details>}
  </section>
}

