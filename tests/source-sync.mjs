import assert from 'node:assert/strict'
import { syncSource } from '../server/source-sync.mjs'

const html = '<html><head><title>测试通知</title></head><body><h1>校园卡办理</h1><p>校园卡窗口工作日开放，领取校园卡请携带录取通知书。</p></body></html>'
const fakeFetch = async () => new Response(html, { status: 200, headers: { 'content-type': 'text/html', 'content-length': String(Buffer.byteLength(html)) } })

const publicLookup = async () => ({ address: '93.184.216.34', family: 4 })
const result = await syncSource('https://example.edu.cn/notice', { allowedHosts: ['example.edu.cn'], fetchImpl: fakeFetch, lookupImpl: publicLookup })
assert.equal(result.document.title, '测试通知')
assert.equal(result.document.domain, 'example.edu.cn')
assert.ok(result.document.keywords.includes('校园卡'))
assert.deepEqual(result.document.taskIds, ['card'])

await assert.rejects(
  () => syncSource('http://127.0.0.1:8787/internal', { allowedHosts: ['127.0.0.1'], fetchImpl: fakeFetch }),
  /内网|回环/,
)
await assert.rejects(
  () => syncSource('https://other.example.org/notice', { allowedHosts: ['example.edu.cn'], fetchImpl: fakeFetch }),
  /白名单/,
)
await assert.rejects(
  () => syncSource('https://example.edu.cn/notice', { allowedHosts: [], fetchImpl: fakeFetch }),
  /白名单域名/,
)

console.log('Source sync checks passed: extraction, allowlist and SSRF guard verified.')
