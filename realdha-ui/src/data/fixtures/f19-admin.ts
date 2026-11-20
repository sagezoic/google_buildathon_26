/** F19 admin sample data. Values from the F19 frames; the audit backlog is deterministic sample data behind the 128 events. */
export interface Contract { name: string; address: string; network: string; version: string; deployed: string; status: 'Active' | 'Pending' }
export const CONTRACTS: readonly Contract[] = [
  { name: 'Anchor registry', address: '0x7e10…b3c4', network: 'Sepolia', version: 'v1.2', deployed: '12 Nov 2026', status: 'Active' },
  { name: 'Plot token · RA-LON-004-P-112-2', address: '0x4c2e…a91f', network: 'Sepolia', version: 'v1.0', deployed: '20 Nov 2026', status: 'Active' },
  { name: 'Apartment token · RA-PUN-001-A-18-04', address: '0x1d05…77ab', network: 'Sepolia', version: 'v1.0', deployed: '20 Nov 2026', status: 'Pending' },
]

export interface TxRow { record: string; kind: string; hash: string; status: 'confirmed' | 'failed' | 'pending'; time: string; reason?: string; attempts?: number; submitted?: string }
export const TX_ROWS: readonly TxRow[] = [
  { record: 'RA-LON-004-P-112-2', kind: 'Mint', hash: '0x5b7d…e904', status: 'confirmed', time: '15:12', submitted: '20 Nov 2026, 15:12', attempts: 1 },
  { record: 'RA-PUN-001-A-18-04', kind: 'Anchor', hash: '0x90cd…7e2a', status: 'confirmed', time: '11:04', submitted: '20 Nov 2026, 11:04', attempts: 1 },
  { record: 'RA-PUN-011-C-02-03', kind: 'Mint', hash: '0xaa31…02de', status: 'failed', reason: 'gas limit too low', time: '10:41', submitted: '20 Nov 2026, 10:41', attempts: 2 },
]
export const FAILED_HASH = '0xaa31…02de'

export interface AuditEvent { id: string; day: string; time: string; actor: string; action: string; record: string; tx: string; cat: 'approvals' | 'mints' | 'access' | 'anchors'; tone: 'success' | 'danger' | 'warning' | 'chain' }
const R = 'RA-LON-004-P-112-2'
const FRAME: AuditEvent[] = [
  { id: 'a1', day: '20 Nov', time: '15:12', actor: 'Admin Rahul K.', action: 'Minted token', record: R, tx: '0x5b7d…e904', cat: 'mints', tone: 'success' },
  { id: 'a2', day: '20 Nov', time: '11:04', actor: 'System', action: 'Anchored 5 fingerprints', record: R, tx: '0x90cd…7e2a', cat: 'anchors', tone: 'chain' },
  { id: 'a3', day: '20 Nov', time: '10:50', actor: 'Adv. Meera Joshi', action: 'Signed off', record: R, tx: '—', cat: 'approvals', tone: 'success' },
  { id: 'a4', day: '20 Nov', time: '10:41', actor: 'Admin Rahul K.', action: 'Re-approval requested', record: 'RA-PUN-011-C-02-03', tx: '0xaa31…02de', cat: 'approvals', tone: 'warning' },
]
const ACTIONS: Pick<AuditEvent, 'actor' | 'action' | 'cat' | 'tone'>[] = [
  { actor: 'System', action: 'Anchored 3 fingerprints', cat: 'anchors', tone: 'chain' },
  { actor: 'Admin Rahul K.', action: 'Minted token', cat: 'mints', tone: 'success' },
  { actor: 'Prakash Kulkarni', action: 'Owner approved mint', cat: 'approvals', tone: 'success' },
  { actor: 'Adv. Meera Joshi', action: 'Signed off', cat: 'approvals', tone: 'success' },
  { actor: 'System', action: 'Mint failed', cat: 'mints', tone: 'danger' },
  { actor: 'Admin Rahul K.', action: 'Opened admin console', cat: 'access', tone: 'chain' },
  { actor: 'Admin Rahul K.', action: 'Re-approval requested', cat: 'approvals', tone: 'warning' },
]
const RECORDS = [R, 'RA-PUN-001-A-18-04', 'RA-PUN-011-C-02-03']
const hex = (n: number) => ((n * 2654435761) >>> 0).toString(16).padStart(8, '0')
const BACKLOG: AuditEvent[] = Array.from({ length: 124 }, (_, i) => {
  const mins = 10 * 60 + 41 - (i + 1) * 23
  const dayIdx = Math.floor(mins < 0 ? (Math.abs(mins) + 1439) / 1440 : 0)
  const m = ((mins % 1440) + 1440) % 1440
  const a = ACTIONS[(i * 5 + 3) % ACTIONS.length]
  const hasTx = a.cat === 'mints' || a.cat === 'anchors'
  return {
    id: `b${i}`,
    day: `${20 - dayIdx} Nov`,
    time: `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`,
    ...a,
    record: RECORDS[i % 3],
    tx: hasTx ? `0x${hex(i + 7).slice(0, 4)}…${hex(i + 11).slice(-4)}` : '—',
  }
})
export const AUDIT_BASE: readonly AuditEvent[] = [...FRAME, ...BACKLOG]
export const AUDIT_TOTAL = AUDIT_BASE.length
export const AUDIT_ACTORS = ['Admin Rahul K.', 'System', 'Adv. Meera Joshi', 'Prakash Kulkarni']
export const AUDIT_ACTIONS = [...new Set(AUDIT_BASE.map((e) => e.action))]
export const AUDIT_DAYS = ['20 Nov', '19 Nov', '18 Nov', '17 Nov']
export const AUDIT_CATS = [
  { value: 'all', label: 'All' },
  { value: 'approvals', label: 'Approvals' },
  { value: 'mints', label: 'Mints' },
  { value: 'access', label: 'Access' },
] as const
