/** F20 government read-only sample data. Values from the F20 frames. */
export interface GovDoc { name: string; hash: string }
export interface GovRecord { id: string; title: string; short: string; place: string; gat?: string; overview: { k: string; v: string }[]; docs: GovDoc[]; signedOff: boolean; anchored: boolean; holder: string; signOff: string; anchoredOn: string; area: string }

export const GOV_RECORDS: readonly GovRecord[] = [
  {
    id: 'RA-LON-004-P-112-2', title: 'Kusgaon NA plot · Gat 112/2', short: 'NA plot, Gat 112/2', place: 'Kusgaon, Maval, Pune', gat: '112/2',
    overview: [{ k: 'Area', v: '0.0418 ha (418 sq m)' }, { k: 'Village', v: 'Kusgaon, Maval' }, { k: 'Use', v: 'Non-agricultural' }, { k: 'Status', v: 'Signed off' }],
    docs: [
      { name: '7/12 extract', hash: '0x9f3a…c21e' }, { name: 'Property card', hash: '0x21fd…9c03' }, { name: 'NA order', hash: '0xb6e8…01af' },
      { name: 'Mutation entry 2291', hash: '0x77c0…4d18' }, { name: 'Sale deed', hash: '0x03ab…ee52' },
    ],
    signedOff: true, anchored: true, holder: 'Prakash Kulkarni', signOff: 'Adv. Meera Joshi', anchoredOn: '18 Nov 2026', area: '0.0418 ha',
  },
  {
    id: 'RA-PUN-001-A-18-04', title: 'A-1804 · 3 BHK · Baner Heights', short: 'A-1804, 3 BHK', place: 'Baner Heights, Pune',
    overview: [{ k: 'Area', v: '1,180 sq ft carpet' }, { k: 'Project', v: 'Baner Heights' }, { k: 'Use', v: 'Residential' }, { k: 'Status', v: 'Anchoring pending' }],
    docs: [], signedOff: false, anchored: false, holder: '—', signOff: '—', anchoredOn: '—', area: '1,180 sq ft',
  },
]
export const DEFAULT_RECORD = 'RA-LON-004-P-112-2'
export const SEED_RECENT = ['RA-LON-004-P-112-2', 'RA-PUN-001-A-18-04']
export const OFFICER = 'Revenue Dept, officer R. Joshi'
export const RECORD_RE = /^RA-[A-Z]{3}-\d{3}-[A-Z]-\d{2}-\d{1,2}(-\d{1,2})?$/

export const findRecord = (q: string): GovRecord | undefined => {
  const t = q.trim().toUpperCase()
  return GOV_RECORDS.find((r) => r.id === t || (r.gat && r.gat === q.trim()))
}

export interface GovEvent { id: string; time: string; event: string; record: string; tx: string; actor: string; ts?: number }
export const GOV_EVENTS_BASE: GovEvent[] = [
  { id: 'g1', time: '20 Nov 15:12', event: 'Token minted', record: 'RA-LON-004-P-112-2', tx: '0x5b7d…e904', actor: 'Realdha' },
  { id: 'g2', time: '20 Nov 11:04', event: '5 fingerprints anchored', record: 'RA-LON-004-P-112-2', tx: '0x90cd…7e2a', actor: 'Realdha' },
  { id: 'g3', time: '20 Nov 10:50', event: 'Lawyer sign-off', record: 'RA-LON-004-P-112-2', tx: '—', actor: 'Adv. Meera Joshi' },
  { id: 'g4', time: '19 Nov 17:20', event: 'Documents checked', record: 'RA-LON-004-P-112-2', tx: '—', actor: 'Realdha' },
]
export const shortStamp = (ts: number) => {
  const d = new Date(ts)
  return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
}
