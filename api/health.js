import { publicConfig } from '../server/source-sync.mjs'

export default function handler(_req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.status(200).json({ ok: true, service: 'campusflow-api', sourceSync: publicConfig() })
}
