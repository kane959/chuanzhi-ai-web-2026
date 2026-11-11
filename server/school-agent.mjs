import { syncSource } from './source-sync.mjs'
const decode = (s) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
export function schoolUrl(value) {
  const u = new URL(value)
  if (u.protocol !== 'https:' || u.port || u.username || u.password || !/^[a-z0-9.-]+\.edu\.cn$/i.test(u.hostname)) throw new Error('当前自动发现仅支持 HTTPS 的中国高校 edu.cn 官网；请使用学校全称。')
  return u
}
export async function discoverSchool(name, { fetchImpl = fetch } = {}) {
  if (typeof name !== 'string' || name.trim().length < 4 || name.length > 80) throw new Error('请输入学校全称（4–80 字）。')
  const response = await fetchImpl(`https://cn.bing.com/search?format=rss&q=${encodeURIComponent(name.trim() + ' 官网')}`, { signal: AbortSignal.timeout(8000), redirect: 'follow' })
  if (!response.ok) throw new Error('学校搜索服务暂不可用，请稍后重试。')
  const xml = await response.text()
  if (xml.length > 512000) throw new Error('搜索结果过大。')
  const candidates = []
  for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const title = decode(match[1].match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '')
    const link = decode(match[1].match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? '')
    try {
      const u = schoolUrl(link)
      if (!title.includes(name.trim()) || candidates.some(c => c.url === u.origin + '/')) continue
      candidates.push({ title, url: u.origin + '/', reason: '搜索标题包含学校全称，域名为 edu.cn；仍需核对是否为学校主站。' })
    } catch { /* Ignore third-party or insecure results. */ }
  }
  return { candidates: candidates.slice(0, 5), status: candidates.length ? 'needs_confirmation' : 'no_match', message: candidates.length ? '请选择并确认学校官网。' : '未找到可核对的官网候选；请检查学校全称，勿据此判断学校没有官网。' }
}
export async function crawlSchool(url, { sync = syncSource } = {}) {
  const root = schoolUrl(url)
  const documents = [], errors = [], events = []
  const queue = [root.href], seen = new Set()
  // Bounded same-origin crawl: homepage plus at most two public notice pages.
  while (queue.length && seen.size < 3) {
    const next = queue.shift()
    if (seen.has(next)) continue
    seen.add(next)
    events.push({ type: 'tool_call', url: next })
    try {
      const result = await sync(next, { allowedHosts: [root.hostname] })
      documents.push({ ...result.document, updated: `抓取于 ${result.fetchedAt}；发布时间请核对原文` })
      events.push({ type: 'tool_result', url: next, status: 'success' })
      for (const item of result.links ?? []) {
        const link = schoolUrl(item.url)
        if (link.origin === root.origin && !seen.has(link.href)) queue.push(link.href)
      }
    } catch (e) { errors.push({ url: next, error: e.message }); events.push({ type: 'tool_result', url: next, status: 'failed' }) }
  }
  return { documents, errors, events, status: errors.length ? 'partial_or_failed' : 'completed', boundary: '仅抓取公开 HTML 的有限摘要；未覆盖全站、登录页、PDF 或动态加载内容，资料仍待人工核对。' }
}
export async function schoolAgent(body) {
  if (body?.action === 'search') return discoverSchool(body.schoolName)
  if (body?.action === 'crawl') return crawlSchool(body.url)
  throw new Error('不支持的学校 Agent 操作。')
}


