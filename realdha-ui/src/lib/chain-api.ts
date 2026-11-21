// Client for the property token API (/api/chain). Goes through the Vite / nginx proxy, never a hardcoded backend URL.

/** The seeded demo plot (Gat 112/2, Kusgaon). `bun run chain:seed-demo` in backend/ mints its token. */
export const DEMO_PLOT_ID = 'prop_demo_kusgaon_112_2'

export interface ChainToken {
  propertyId: string
  tokenId: string
  status: string
  version: number
  docRoot: string
  docCount: number
  documents: { slot: string; filename: string; size: number; sha256: string }[]
  approvedBy: string
  approvedAt: string
  network: string
  contract: string
  txHash: string | null
  explorerUrl: string | null
  history: { kind: string; version: number; txHash: string; at: string; explorerUrl: string | null }[]
}

export interface VerifyResult {
  verdict: 'match' | 'changed' | 'unknown'
  sha256: string
  message: string
  slot?: string
  anchoredAt?: string
  explorerUrl?: string | null
}

/** The token for a property, or null when there is none yet, the ledger is not configured, or the API is unreachable. */
export async function fetchToken(propertyId: string): Promise<ChainToken | null> {
  try {
    const res = await fetch(`/api/chain/properties/${propertyId}`, { headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    return ((await res.json()) as { token: ChainToken }).token
  } catch {
    return null
  }
}

/** Hashes the file on the server and checks it against the anchored documents. Throws with the API's message. */
export async function verifyFile(file: File, propertyId: string): Promise<VerifyResult> {
  const form = new FormData()
  form.set('file', file)
  form.set('propertyId', propertyId)
  const res = await fetch('/api/chain/verify', { method: 'POST', body: form })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message || `Verification failed (${res.status})`)
  }
  return (await res.json()) as VerifyResult
}

export const shortHash = (h: string) => (h.length > 14 ? `${h.slice(0, 6)}…${h.slice(-4)}` : h)

const NETWORKS: Record<string, string> = { sepolia: 'Sepolia testnet', ganache: 'Local chain' }
export const networkLabel = (n: string) => NETWORKS[n] ?? n

/** True when the backend has a configured ledger (so approvals really anchor). */
export async function chainEnabled(): Promise<boolean> {
  try {
    const res = await fetch('/api/chain/status')
    return res.ok && ((await res.json()) as { configured: boolean }).configured
  } catch {
    return false
  }
}

/** Lawyer approval: anchors the property's documents on-chain. `accessToken` is the lawyer's token, held only in this tab. */
export async function approveProperty(propertyId: string, approvedBy: string, accessToken: string): Promise<ChainToken> {
  const res = await fetch(`/api/chain/properties/${propertyId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
    body: JSON.stringify({ approvedBy }),
  })
  const body = (await res.json().catch(() => null)) as { message?: string; token?: ChainToken } | null
  if (!res.ok || !body?.token) throw new Error(body?.message || `Approval failed (${res.status})`)
  return body.token
}
