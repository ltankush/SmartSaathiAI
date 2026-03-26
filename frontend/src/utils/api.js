import axios from 'axios'

// In Docker production:  frontend IS the backend (same origin, port 8000)
//                        so /api/... works with no base URL needed.
// In local dev:          Vite proxies /api → localhost:8000 automatically.
// Either way: baseURL = '/api' is correct in both environments.

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.detail || err.message || 'Something went wrong'
    return Promise.reject(new Error(msg))
  }
)

export default api

// SSE streaming for AI chat
export async function streamChat(messages, context, onToken, onDone, onError) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, context }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()                  // keep incomplete last line

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const payload = line.slice(6).trim()
        if (payload === '[DONE]') { onDone?.(); return }
        try {
          const parsed = JSON.parse(payload)
          if (parsed.error) { onError?.(parsed.error); return }
          if (parsed.token) onToken(parsed.token)
        } catch { /* skip malformed chunk */ }
      }
    }
    onDone?.()
  } catch (err) {
    onError?.(err.message)
  }
}

// Helper: format numbers as Indian currency
export function formatINR(amount) {
  if (amount == null) return '—'
  const n = Number(amount)
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(2)} L`
  if (n >= 1_000)      return `₹${(n / 1_000).toFixed(1)} K`
  return `₹${n.toFixed(0)}`
}
