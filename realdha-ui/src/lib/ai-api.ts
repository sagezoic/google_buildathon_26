// Client for the Gemini endpoints (/api/properties/:id/checks and /chat). Goes through the Vite / nginx proxy.
import { useEffect, useRef, useState } from 'react'

export type Severity = 'high' | 'medium' | 'clear'
export type CheckKindId = 'resale' | 'under-construction' | 'plot' | 'commercial'

export interface DocSource { documentId: string; filename: string; slot: string; page: number | null }

export interface ServerFinding {
  title: string
  titleShort: string
  severity: Severity
  body: string
  bodyShort: string
  /** Exact words from the document, in its own language. */
  quote: string
  quoteEn: string
  source: DocSource & { location: string | null }
}

export interface ServerReport {
  verdict: 'stop' | 'proceed'
  title: string
  titleShort: string
  headline: string
  headlineShort: string
  counts: Record<Severity, number>
  findings: ServerFinding[]
}

export interface ServerCheck {
  id: string
  propertyId: string
  kind: string
  status: 'running' | 'done' | 'failed' | string
  verdict: 'stop' | 'proceed' | null
  report: ServerReport | null
  docIds: string[]
  model: string
  error: string | null
  createdAt: string
}

export interface ChatCitation extends DocSource { quote: string }

export interface ChatMessage {
  id: string
  role: 'user' | 'model'
  text: string
  found: boolean | null
  citations: ChatCitation[]
  createdAt: string
}

/** Error bodies from the API are `{ error, message, code }`; surface `message`. */
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, { ...init, headers: { Accept: 'application/json', ...init?.headers } })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new Error('Could not reach the server. Check your connection and try again.')
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message || `Request failed (${res.status})`)
  }
  return (await res.json()) as T
}

const post = (body: unknown, signal?: AbortSignal): RequestInit => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal })

export const runCheck = (propertyId: string, kind: CheckKindId, signal?: AbortSignal) =>
  request<ServerCheck>(`/api/properties/${propertyId}/checks`, post({ kind }, signal))
export const getCheck = (propertyId: string, checkId: string) => request<ServerCheck>(`/api/properties/${propertyId}/checks/${checkId}`)
export const getChat = (propertyId: string) => request<{ messages: ChatMessage[] }>(`/api/properties/${propertyId}/chat`)
export const askChat = (propertyId: string, message: string) =>
  request<{ question: ChatMessage; answer: ChatMessage }>(`/api/properties/${propertyId}/chat`, post({ message }))
export const clearChat = (propertyId: string) => request<{ success: boolean }>(`/api/properties/${propertyId}/chat`, { method: 'DELETE' })

/** "Agreement.pdf · page 3, clause 2" */
export const sourceLabel = (s: DocSource & { location?: string | null }, name = s.filename) =>
  [name, [s.page ? `page ${s.page}` : '', s.location ?? ''].filter(Boolean).join(', ')].filter(Boolean).join(' · ')

/** A stored check, loaded once per id. `check` stays null while there is no id. */
export function useServerCheck(propertyId: string | undefined, checkId: string | null | undefined) {
  const key = propertyId && checkId ? `${propertyId}/${checkId}` : ''
  const [state, setState] = useState<{ key: string; check: ServerCheck | null; error?: string }>({ key: '', check: null })
  useEffect(() => {
    if (!propertyId || !checkId) return
    let cancelled = false
    getCheck(propertyId, checkId)
      .then((check) => { if (!cancelled) setState({ key, check }) })
      .catch((e: unknown) => { if (!cancelled) setState({ key, check: null, error: e instanceof Error ? e.message : 'Could not load the report.' }) })
    return () => { cancelled = true }
  }, [key, propertyId, checkId])
  const current = state.key === key ? state : { key, check: null, error: undefined }
  return { check: current.check, error: current.error, loading: !!key && state.key !== key }
}

/**
 * Chat with Gemini about one property. Messages live on the server; the question shows at once
 * and its answer replaces the "thinking" row when it arrives.
 */
export function usePropertyChat(propertyId: string | undefined) {
  // Loaded state is tagged with its property, so switching property shows nothing stale.
  const [data, setData] = useState<{ key: string; messages: ChatMessage[]; error: string }>({ key: '', messages: [], error: '' })
  const [pending, setPending] = useState<string | null>(null)
  const key = propertyId ?? ''
  const live = useRef(key)
  const current = data.key === key ? data : { key, messages: [] as ChatMessage[], error: '' }
  const setMessages = (fn: (m: ChatMessage[]) => ChatMessage[]) => setData((d) => ({ ...d, messages: fn(d.messages) }))
  const setError = (error: string) => setData((d) => ({ ...d, error }))

  useEffect(() => {
    live.current = key
    if (!key) return
    let cancelled = false
    getChat(key)
      .then((r) => { if (!cancelled) setData({ key, messages: r.messages, error: '' }) })
      .catch((e: unknown) => { if (!cancelled) setData({ key, messages: [], error: e instanceof Error ? e.message : 'Could not load the conversation.' }) })
    return () => { cancelled = true }
  }, [key])
  const loading = !!key && data.key !== key
  const { messages, error } = current

  const ask = async (text: string) => {
    const q = text.trim()
    if (!propertyId || !q || pending) return false
    setError(''); setPending(q)
    try {
      const { question, answer } = await askChat(propertyId, q)
      if (live.current === propertyId) setMessages((m) => [...m, question, answer])
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not get an answer. Try again.')
      return false
    } finally {
      setPending(null)
    }
  }

  const clear = async () => {
    if (!propertyId) return
    try { await clearChat(propertyId); setData({ key: propertyId, messages: [], error: '' }) } catch (e) { setError(e instanceof Error ? e.message : 'Could not clear the conversation.') }
  }

  return { messages, loading, pending, error, ask, clear }
}
