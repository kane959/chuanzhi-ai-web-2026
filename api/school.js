import { schoolAgent } from '../server/school-agent.mjs'
export default async function handler(req, res) {
  const allowed = [process.env.PUBLIC_WEB_ORIGIN, 'https://kane959.github.io', 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean)
  if (allowed.includes(req.headers.origin)) res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Headers', 'content-type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: '只支持 POST。' })
  try { return res.status(200).json({ ok: true, ...await schoolAgent(req.body) }) }
  catch (e) { return res.status(400).json({ ok: false, error: e.message }) }
}
