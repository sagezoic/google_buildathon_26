import type { AdminTx } from '../data/fixtures/market'

/** A transaction created in this browser (a mint the visitor started). Shown first in the admin console. */
export interface ChainTx extends AdminTx {
  ts: number
}

export type MintStatus = 'review' | 'pending' | 'confirmed' | 'failed'

/** The mint in flight or settled. Persisted as `mint.tx`. */
export interface MintTx {
  hash: string
  submittedAt: number
  settledAt?: number
  units: number
  attempt: number
  fail: boolean
}

export const MINT_RECORD = 'RA-LON-004-P-112-2'
export const MINT_DURATION_MS = 4000

export const randomHash = () => {
  const hex = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  return `0x${hex(4)}…${hex(4)}`
}

const num = (v: unknown): number | null => {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v.replace(/[^0-9.]/g, '')) : NaN
  return Number.isFinite(n) && n > 0 ? n : null
}

export interface Structure { units: number; unitPrice: number; fundPartner?: string }

/** Reads whatever GP-19 saved as `tokenise.structure`, tolerating its field names. Null when nothing valid is saved. */
export function readStructure(raw: unknown): Structure | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const units = num(r.units ?? r.totalUnits)
  const unitPrice = num(r.unitPrice ?? r.price)
  if (!units || !unitPrice) return null
  const fp = r.fundPartner
  return { units, unitPrice, fundPartner: typeof fp === 'string' ? fp : undefined }
}

export const inr = (n: number, frac = 2) => n.toLocaleString('en-IN', { minimumFractionDigits: frac, maximumFractionDigits: frac })

export const clock = (ts: number) => new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
export const stamp = (ts: number) => {
  const d = new Date(ts)
  const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${date}, ${clock(ts)}`
}
