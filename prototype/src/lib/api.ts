const configuredBase = String(import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '')

export const apiBaseUrl = configuredBase
export const apiUrl = (path: string) => `${configuredBase}${path}`
