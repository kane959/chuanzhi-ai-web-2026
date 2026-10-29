import assert from 'node:assert/strict'
import { createPlan, publicModelConfig } from '../server/model-adapter.mjs'

const demo = await createPlan({ goal: '领取校园卡', evidence: [{ id: 'E-01' }] }, { env: { MODEL_PROVIDER: 'demo' } })
assert.equal(demo.mode, 'demo')
assert.equal(demo.requiresApproval, true)
assert.equal(publicModelConfig({ MODEL_PROVIDER: 'demo' }).configured, false)

const fakeFetch = async (_url, options) => {
  const body = JSON.parse(options.body)
  assert.equal(body.response_format.type, 'json_object')
  return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ summary: 'ok', tasks: [{ title: '领取校园卡', evidenceIds: ['E-01'], requiresApproval: true }], risks: [] }) } }] }), { status: 200, headers: { 'content-type': 'application/json' } })
}
const provider = await createPlan({ goal: '领取校园卡', evidence: [{ id: 'E-01' }] }, { env: { MODEL_PROVIDER: 'openai-compatible', MODEL_BASE_URL: 'https://model.example', MODEL_NAME: 'demo', MODEL_API_KEY: 'test' }, fetchImpl: fakeFetch })
assert.equal(provider.mode, 'provider')
assert.equal(provider.tasks.length, 1)
console.log('Model adapter checks passed: demo fallback and structured provider response verified.')
