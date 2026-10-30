import { createPlan, publicModelConfig } from '../server/model-adapter.mjs'

export default async function handler(req, res) {
  const origin = req.headers.origin
  const allowed = [process.env.PUBLIC_WEB_ORIGIN, 'https://kane959.github.io', 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean)
  if (origin && allowed.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Headers', 'content-type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Vary', 'Origin')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: '只支持 POST。' })
  if (typeof req.body?.goal !== 'string' || !req.body.goal.trim()) return res.status(400).json({ ok: false, error: '缺少 goal。' })
  try { return res.status(200).json({ ok: true, plan: await createPlan(req.body), model: publicModelConfig() }) }
  catch (error) { return res.status(400).json({ ok: false, error: error instanceof Error ? error.message : '规划失败。' }) }
}
