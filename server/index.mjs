import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { allowedHostsFromEnv, publicConfig, syncSource } from './source-sync.mjs'
import { createPlan, publicModelConfig } from './model-adapter.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const distRoot = join(root, 'prototype', 'dist')
const port = Number(process.env.PORT ?? 8787)
const host = process.env.HOST ?? '0.0.0.0'

const json = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' })
  res.end(JSON.stringify(body))
}
const readBody = async (req) => {
  let body = ''
  for await (const chunk of req) {
    body += chunk
    if (Buffer.byteLength(body) > 16 * 1024) throw new Error('请求体超过 16 KB 限制。')
  }
  return body ? JSON.parse(body) : {}
}
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon' }

const server = createServer(async (req, res) => {
  const requestUrl = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
  if (requestUrl.pathname === '/api/health') return json(res, 200, { ok: true, service: 'campusflow-api', sourceSync: publicConfig(), model: publicModelConfig() })
  if (requestUrl.pathname === '/api/plan') {
    if (req.method !== 'POST') return json(res, 405, { error: '只支持 POST。' })
    try {
      const body = await readBody(req)
      if (typeof body.goal !== 'string' || !body.goal.trim()) return json(res, 400, { ok: false, error: '缺少 goal。' })
      return json(res, 200, { ok: true, plan: await createPlan(body) })
    } catch (error) { return json(res, 400, { ok: false, error: error instanceof Error ? error.message : '规划失败。' }) }
  }
  if (requestUrl.pathname === '/api/sources') {
    if (req.method === 'GET') return json(res, 200, publicConfig())
    if (req.method === 'OPTIONS') { res.writeHead(204, { allow: 'GET,POST,OPTIONS' }); return res.end() }
    if (req.method !== 'POST') return json(res, 405, { error: '只支持 GET 或 POST。' })
    try {
      const body = await readBody(req)
      if (!body.url) return json(res, 400, { error: '缺少 url。' })
      const result = await syncSource(body.url, { allowedHosts: allowedHostsFromEnv() })
      return json(res, 200, { ok: true, ...result })
    } catch (error) {
      return json(res, 400, { ok: false, error: error instanceof Error ? error.message : '同步失败。' })
    }
  }
  if (requestUrl.pathname.startsWith('/api/')) return json(res, 404, { error: '接口不存在。' })
  const requested = requestUrl.pathname === '/' ? 'index.html' : requestUrl.pathname.replace(/^\/+/, '')
  const candidate = resolve(normalize(join(distRoot, requested)))
  const safePath = (candidate === distRoot || candidate.startsWith(distRoot + sep)) && existsSync(candidate) && statSync(candidate).isFile() ? candidate : join(distRoot, 'index.html')
  if (!existsSync(safePath)) return json(res, 503, { error: '前端尚未构建，请先运行 pnpm build。' })
  res.writeHead(200, { 'content-type': mime[extname(safePath)] ?? 'application/octet-stream', 'x-content-type-options': 'nosniff', 'referrer-policy': 'strict-origin-when-cross-origin' })
  createReadStream(safePath).pipe(res)
})

server.listen(port, host, () => console.log(`CampusFlow server listening on http://${host === '0.0.0.0' ? '127.0.0.1' : host}:${port}`))
