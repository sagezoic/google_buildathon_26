// Client for the Add Property API (/api/properties). Goes through the Vite / nginx proxy, never a hardcoded backend URL.

export type ServerDocStatus = 'uploaded' | 'processing' | 'processed' | 'failed'

export interface ExtractedFields {
  gat: string | null
  village: string | null
  taluka: string | null
  district: string | null
  owner: string | null
  ownerEn: string | null
  areaSqm: number | null
  landUse: string | null
  mutationNos: string[]
}

export interface ServerDoc {
  id: string
  slot: string
  filename: string
  mime: string
  size: number
  status: ServerDocStatus
  pages: number | null
  /** Detected language code, e.g. 'mr', 'en'. */
  lang: string | null
  fields: ExtractedFields | null
  error: string | null
}

export interface ServerDocDetail extends ServerDoc {
  originalText: string
  translatedText: string | null
}

export interface ServerProperty {
  id: string
  type: string
  stage: string
}

export interface PropertyPayload {
  type: 'apartment' | 'plot' | 'commercial'
  gat?: string
  village?: string
  taluka?: string
  district?: string
  address?: string
  lat?: number
  lng?: number
  area?: string
  area_unit?: string
  stage?: 'details' | 'documents' | 'checked'
}

/** Error bodies from the API are `{ error, message, code }`; surface `message`. */
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, { ...init, headers: { Accept: 'application/json', ...init?.headers } })
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.')
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message || `Request failed (${res.status})`)
  }
  return (await res.json()) as T
}

const json = (method: string, body: unknown): RequestInit => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

export const createProperty = (p: PropertyPayload) => request<ServerProperty>('/api/properties', json('POST', p))
export const updateProperty = (id: string, p: Partial<PropertyPayload>) => request<ServerProperty>(`/api/properties/${id}`, json('PUT', p))

export function uploadDocument(propertyId: string, slot: string, file: File) {
  const form = new FormData()
  form.set('slot', slot)
  form.set('file', file)
  return request<ServerDoc>(`/api/properties/${propertyId}/documents`, { method: 'POST', body: form })
}

export const deleteDocument = (propertyId: string, docId: string) =>
  request<{ success: boolean }>(`/api/properties/${propertyId}/documents/${docId}`, { method: 'DELETE' })

export const processDocument = (propertyId: string, docId: string, force = false) =>
  request<ServerDocDetail>(`/api/properties/${propertyId}/documents/${docId}/process${force ? '?force=true' : ''}`, { method: 'POST' })

/** URL of the original upload, served inline by the API. Used as an iframe / img source. */
export const documentFileUrl = (propertyId: string, docId: string) => `/api/properties/${propertyId}/documents/${docId}/file`

export const getDocument =(propertyId: string, docId: string) => request<ServerDocDetail>(`/api/properties/${propertyId}/documents/${docId}`)

/** 'mr' → 'Marathi'. Falls back to the code when the runtime does not know it. */
export function languageName(code: string): string {
  try { return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) ?? code } catch { return code }
}
