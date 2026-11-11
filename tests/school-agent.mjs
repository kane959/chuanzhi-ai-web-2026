import assert from 'node:assert/strict'
import { schoolUrl, discoverSchool, crawlSchool } from '../server/school-agent.mjs'
for (const url of ['http://x.edu.cn','https://127.0.0.1','https://x.edu.cn.evil.com','https://u:p@x.edu.cn','https://x.edu.cn:8443']) assert.throws(() => schoolUrl(url))
const result = await discoverSchool('测试大学', { fetchImpl: async () => new Response('<rss><item><title>测试大学官网</title><link>https://www.test.edu.cn/</link></item><item><title>测试大学招生</title><link>https://evil.com/</link></item></rss>') })
assert.equal(result.candidates.length, 1)
assert.equal(result.status, 'needs_confirmation')
const calls = []
const crawl = await crawlSchool('https://www.test.edu.cn/', { sync: async (url) => {
  calls.push(url)
  if (url.endsWith('/broken')) throw new Error('页面不存在')
  return { document: { id: url, source: url }, fetchedAt: '2026-11-10T00:00:00Z', links: [{ url: 'https://www.test.edu.cn/notice' }, { url: 'https://www.test.edu.cn/broken' }, { url: 'https://other.edu.cn/' }] }
} })
assert.equal(calls.length, 3)
assert.equal(crawl.documents.length, 2)
assert.equal(crawl.errors.length, 1)
assert.equal(crawl.events.length, 6)
assert.ok(calls.every(url => new URL(url).hostname === 'www.test.edu.cn'))
console.log('School Agent fixtures passed: discovery, domain restriction, bounded crawl, partial failure. No live search asserted.')
