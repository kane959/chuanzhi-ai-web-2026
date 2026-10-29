const REQUEST_TIMEOUT_MS = 12_000

function providerConfig(env = process.env) {
  return {
    provider: String(env.MODEL_PROVIDER ?? 'demo').trim().toLowerCase() || 'demo',
    baseUrl: String(env.MODEL_BASE_URL ?? '').trim().replace(/\/$/, ''),
    model: String(env.MODEL_NAME ?? '').trim(),
    apiKey: String(env.MODEL_API_KEY ?? '').trim(),
  }
}

function demoPlan(input) {
  const sourceCount = Array.isArray(input.evidence) ? input.evidence.length : 0
  return {
    mode: 'demo',
    provider: 'deterministic-fallback',
    model: 'local-rules-v0.2',
    sourceCount,
    planner: '目标解析 → 证据召回 → 工具检查 → Reviewer',
    summary: sourceCount ? '已基于可核验资料生成候选行动计划。' : '没有足够依据，保留人工核对入口。',
    requiresApproval: true,
  }
}

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]
  const candidate = (fenced ?? text).trim()
  try { return JSON.parse(candidate) } catch { return null }
}

async function callCompatible(config, input, fetchImpl = fetch) {
  if (!config.baseUrl || !config.model || !config.apiKey) throw new Error('真实模型模式缺少 MODEL_BASE_URL、MODEL_NAME 或 MODEL_API_KEY。')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetchImpl(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: '你是 CampusFlow 的 Planner。只输出 JSON：summary、tasks、risks、requiresApproval。不得编造证据；每个 task 必须含 title、evidenceIds、requiresApproval。' },
          { role: 'user', content: JSON.stringify({ goal: input.goal, availability: input.availability, evidence: input.evidence }) },
        ],
      }),
    })
    if (!response.ok) throw new Error(`模型接口返回 HTTP ${response.status}。`)
    const payload = await response.json()
    const content = payload?.choices?.[0]?.message?.content
    const parsed = typeof content === 'string' ? extractJson(content) : null
    if (!parsed || !Array.isArray(parsed.tasks)) throw new Error('模型返回未通过结构化计划校验。')
    return { mode: 'provider', provider: config.provider, model: config.model, ...parsed, requiresApproval: true }
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('模型响应超时（12 秒）。')
    throw error
  } finally { clearTimeout(timer) }
}

export function publicModelConfig(env = process.env) {
  const config = providerConfig(env)
  return { configured: config.provider !== 'demo' && Boolean(config.baseUrl && config.model && config.apiKey), provider: config.provider, model: config.model || 'local-rules-v0.2', fallback: 'demo' }
}

export async function createPlan(input, { env = process.env, fetchImpl = fetch } = {}) {
  const config = providerConfig(env)
  if (config.provider === 'demo') return demoPlan(input)
  try { return await callCompatible(config, input, fetchImpl) } catch (error) {
    return { ...demoPlan(input), fallbackReason: error instanceof Error ? error.message : '模型不可用，已回退演示模式。' }
  }
}
