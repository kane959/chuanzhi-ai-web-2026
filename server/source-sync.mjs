import { createHash } from 'node:crypto'
import { lookup } from 'node:dns/promises'

const MAX_BYTES = 512 * 1024
const REQUEST_TIMEOUT_MS = 8_000
const DEFAULT_TERMS = [
  '校园卡', '报到', '入学', '新生', '窗口', '开放时间', '报修', '宿舍', '漏水', '漏电',
  '楼栋', '房间号', '奖助学金', '奖助', '资助', '申请表', '家庭情况', '截止', '材料', '通知',
]

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
}

function cleanText(value) {
  return decodeEntities(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
}

function extractTitle(html, fallback) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
  return cleanText(title ?? '') || fallback
}

function extractParagraphs(html) {
  const matches = [...html.matchAll(/<(?:h1|h2|h3|p|li|td)[^>]*>([\s\S]*?)<\/(?:h1|h2|h3|p|li|td)>/gi)]
  const paragraphs = matches.map((match) => cleanText(match[1]))
    .filter((item) => item.length >= 8 && !/^首页|登录|搜索|导航$/.test(item))
  if (paragraphs.length >= 2) return [...new Set(paragraphs)].slice(0, 12)
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html
  const fallback = cleanText(body)
  return fallback ? [fallback.slice(0, 800)] : []
}

function inferKeywords(text, title) {
  const haystack = `${title} ${text}`
  return DEFAULT_TERMS.filter((term) => haystack.includes(term)).slice(0, 12)
}

function inferTaskIds(text) {
  return [
    /校园卡|报到|入学|新生/.test(text) ? 'card' : null,
    /宿舍|报修|漏水|漏电|维修/.test(text) ? 'repair' : null,
    /奖助|奖学金|助学金|资助|家庭情况|申请表/.test(text) ? 'grant' : null,
  ].filter(Boolean)
}

function isPrivateAddress(hostname) {
  const host = hostname.toLowerCase()
  if (host === 'localhost' || host.endsWith('.localhost') || host === '::1') return true
  if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host)) return true
  const private172 = host.match(/^172\.(\d{1,3})\./)
  return Boolean(private172 && Number(private172[1]) >= 16 && Number(private172[1]) <= 31)
}

function isPrivateIp(address) {
  const value = address.toLowerCase()
  if (value.includes(':')) {
    return value === '::1' || value.startsWith('fc') || value.startsWith('fd') || value.startsWith('fe8') || value.startsWith('fe9') || value.startsWith('fea') || value.startsWith('feb') || value.startsWith('::ffff:127.') || value.startsWith('::ffff:10.') || value.startsWith('::ffff:192.168.')
  }
  const octets = value.split('.').map(Number)
  if (octets.length !== 4 || octets.some((octet) => Number.isNaN(octet))) return true
  return octets[0] === 0 || octets[0] === 10 || octets[0] === 127 || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) || (octets[0] === 192 && octets[1] === 168) || (octets[0] === 169 && octets[1] === 254)
}

function validateUrl(rawUrl, allowedHosts = []) {
  let url
  try { url = new URL(rawUrl) } catch { throw new Error('请输入完整的 http(s) 官网地址。') }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('只允许访问 http(s) 地址。')
  if (url.username || url.password || isPrivateAddress(url.hostname)) throw new Error('出于安全原因，不能访问内网、回环地址或带凭据的 URL。')
  if (url.port && !['80', '443'].includes(url.port)) throw new Error('只允许访问标准 Web 端口。')
  if (allowedHosts.length > 0 && !allowedHosts.some((allowed) => url.hostname === allowed || url.hostname.endsWith(`.${allowed}`))) {
    throw new Error(`该域名不在同步白名单中：${allowedHosts.join('、')}`)
  }
  return url
}

function responseSizeGuard(response) {
  const declared = Number(response.headers.get('content-length') ?? 0)
  if (declared > MAX_BYTES) throw new Error('页面超过 512 KB 大小限制。')
}

export function allowedHostsFromEnv(env = process.env) {
  return String(env.SYNC_ALLOWED_HOSTS ?? '').split(',').map((host) => host.trim().toLowerCase()).filter(Boolean)
}

export async function syncSource(rawUrl, { allowedHosts = allowedHostsFromEnv(), fetchImpl = fetch, lookupImpl = lookup } = {}) {
  if (allowedHosts.length === 0) throw new Error('官网同步尚未配置白名单域名。请先设置 SYNC_ALLOWED_HOSTS。')
  const url = validateUrl(rawUrl, allowedHosts)
  const resolved = await lookupImpl(url.hostname)
  if (isPrivateIp(resolved.address)) throw new Error('该域名解析到了内网或回环地址，已拒绝访问。')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetchImpl(url, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers: { 'user-agent': 'CampusFlow-SourceSync/0.1 (+https://campusflow.example)' },
    })
    responseSizeGuard(response)
    if (!response.ok) throw new Error(`官网返回 HTTP ${response.status}。`)
    const contentType = response.headers.get('content-type') ?? ''
    if (!/text\/html|application\/xhtml\+xml|text\/plain/i.test(contentType)) throw new Error('只支持 HTML 或纯文本网页。')
    const reader = response.body?.getReader()
    let bytes = 0
    const chunks = []
    if (reader) {
      while (true) {
        const part = await reader.read()
        if (part.done) break
        bytes += part.value.byteLength
        if (bytes > MAX_BYTES) throw new Error('页面超过 512 KB 大小限制。')
        chunks.push(part.value)
      }
    } else {
      const text = await response.text()
      bytes = Buffer.byteLength(text)
      if (bytes > MAX_BYTES) throw new Error('页面超过 512 KB 大小限制。')
      chunks.push(new TextEncoder().encode(text))
    }
    const html = new TextDecoder().decode(Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))))
    const paragraphs = extractParagraphs(html)
    if (paragraphs.length === 0) throw new Error('页面没有提取到可读正文。')
    const title = extractTitle(html, url.hostname)
    const text = paragraphs.join(' ')
    const hash = createHash('sha1').update(`${url.href}\n${text}`).digest('hex').slice(0, 10).toUpperCase()
    const document = {
      id: `LIVE-${hash}`,
      title,
      domain: url.hostname,
      source: url.href,
      locator: '网页正文 · 单页同步摘要',
      updated: new Date().toISOString().slice(0, 10),
      text: text.slice(0, 900),
      paragraphs: paragraphs.slice(0, 6),
      keywords: inferKeywords(text, title),
      taskIds: inferTaskIds(text),
    }
    return { document, fetchedBytes: bytes, fetchedAt: new Date().toISOString() }
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('官网响应超时（8 秒），请稍后重试。')
    throw error
  } finally {
    clearTimeout(timer)
  }
}

export function publicConfig(env = process.env) {
  const allowedHosts = allowedHostsFromEnv(env)
  return {
    enabled: allowedHosts.length > 0,
    allowedHosts,
    maxBytes: MAX_BYTES,
    timeoutMs: REQUEST_TIMEOUT_MS,
    mode: 'single-page-preview',
  }
}
