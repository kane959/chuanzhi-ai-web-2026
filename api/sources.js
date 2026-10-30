import { allowedHostsFromEnv, publicConfig, syncSource } from '../server/source-sync.mjs'

function cors(res, req) {
  const origin = req.headers.origin
  const allowed = [process.env.PUBLIC_WEB_ORIGIN, 'https://kane959.github.io', 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean)
  if (origin && allowed.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Headers', 'content-type, x-source-sync-token')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Vary', 'Origin')
}

export default async function handler(req, res) {
  cors(res, req)
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method === 'GET') return res.status(200).json(publicConfig())
  if (req.method !== 'POST') return res.status(405).json({ error: '只支持 GET 或 POST。' })
  if (process.env.SYNC_API_TOKEN && req.headers['x-source-sync-token'] !== process.env.SYNC_API_TOKEN) return res.status(401).json({ error: '同步接口需要服务端令牌。' })
  try {
    const rawUrl = typeof req.body?.url === 'string' ? req.body.url : ''
    if (!rawUrl) return res.status(400).json({ error: '缺少 url。' })
    const result = await syncSource(rawUrl, { allowedHosts: allowedHostsFromEnv() })
    return res.status(200).json({ ok: true, ...result })
  } catch (error) {
    return res.status(400).json({ ok: false, error: error instanceof Error ? error.message : '同步失败。' })
  }
}
