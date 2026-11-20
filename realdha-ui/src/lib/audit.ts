import { readShared, useSharedState, writeShared } from './shared-state'

export interface AuditEntry { ts: number; actor: string; action: string }
const KEY = 'audit.log'
const EMPTY: AuditEntry[] = []

/** Append to the persisted audit trail (`audit.log`). Safe to call right before navigating. */
export function logAudit(actor: string, action: string) {
  writeShared<AuditEntry[]>(KEY, (p) => [...p, { ts: Date.now(), actor, action }].slice(-200), EMPTY)
}
export const useAudit = () => useSharedState<AuditEntry[]>(KEY, EMPTY)[0]
export const auditSnapshot = () => readShared<AuditEntry[]>(KEY, EMPTY)

/** "20 Nov 2026, 14:31 IST" */
export function stamp(ts: number) {
  const f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
  return `${f.format(ts).replace(',', ',')} IST`
}
export function dayStamp(ts: number) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' }).format(ts)
}
