const configuredBase = String(import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '')

export const apiBaseUrl = configuredBase
export const apiUrl = (path: string) => `${configuredBase}${path}`

export async function fetchApi(path: string, init: RequestInit = {}, timeoutMs = 10000) {
  if (!configuredBase) throw new Error('后端地址尚未配置。')
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(apiUrl(path), { ...init, signal: controller.signal })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw new Error('后端请求超时，请稍后重试。')
    throw new Error('后端暂时不可用，请检查后端服务状态。')
  } finally {
    window.clearTimeout(timer)
  }
}
