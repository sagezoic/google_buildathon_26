/** F05 · Document check for a property not on Realdha. Sample data only. */

export type CheckKind = 'resale' | 'under-construction' | 'plot' | 'commercial'
export interface KindOption { id: CheckKind; label: string; desc: string; descM: string; needed: string }

export const KINDS: KindOption[] = [
  { id: 'resale', label: 'Resale flat', desc: 'Apartment someone is selling on to you', descM: 'Someone is selling on to you', needed: 'agreement, share certificate, society NOC' },
  { id: 'under-construction', label: 'Under-construction flat', desc: 'Booked from a developer', descM: 'Booked from a developer', needed: 'allotment letter, RERA registration, builder agreement' },
  { id: 'plot', label: 'Plot or land', desc: '7/12, mutation, agreement', descM: '7/12, mutation, agreement', needed: '7/12 extract, mutation entry, agreement' },
  { id: 'commercial', label: 'Shop or office', desc: 'Commercial unit', descM: 'Commercial unit', needed: 'agreement, occupancy certificate, society NOC' },
]

export type FileStatus = 'uploading' | 'uploaded'
/** Name, size and progress only. File objects are never stored. */
export interface CheckFile { name: string; pages: number; size: string; status: FileStatus; pct: number }

export interface CheckState {
  kind: CheckKind
  files: CheckFile[]
  /** 0 to 100, advanced by a timer on F05-02. */
  pct: number
  /** Set when the check starts; decides which report opens. */
  verdict: 'stop' | 'proceed' | null
}

const up = (name: string, pages: number, size: string): CheckFile => ({ name, pages, size, status: 'uploaded', pct: 100 })
/** The frame's upload list: two uploaded, the society NOC still uploading. */
export const FRAME_FILES: CheckFile[] = [
  up('Agreement for sale.pdf', 18, '2.4 MB'),
  up('Share certificate.pdf', 2, '310 KB'),
  { name: 'Society NOC.jpg', pages: 1, size: '1.1 MB', status: 'uploading', pct: 64 },
]
export const SAMEER_FILES: CheckFile[] = [up('Agreement for sale.pdf', 18, '2.4 MB'), up('Share certificate.pdf', 2, '310 KB'), up('Society NOC.jpg', 1, '1.1 MB')]
export const LAKEVIEW_FILES: CheckFile[] = [up('Agreement for sale - Lake View.pdf', 20, '2.8 MB'), up('Share certificate - Lake View.pdf', 2, '290 KB'), up('Society NOC - Lake View.pdf', 1, '420 KB')]

export const INITIAL_CHECK: CheckState = { kind: 'resale', files: FRAME_FILES, pct: 0, verdict: null }

/** Sample rule: documents from the Lake View sample set (all three heirs sign) get PROCEED; every other set is Sameer's, with one heir missing, and gets STOP. */
export const decideVerdict = (files: CheckFile[]): 'stop' | 'proceed' => (files.some((f) => /lake view/i.test(f.name)) ? 'proceed' : 'stop')

export const sizeLabel = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`)

export const STAGES = [
  { label: 'Files received', labelM: 'Files received' },
  { label: 'Reading text (Marathi and English)', labelM: 'Reading Marathi and English' },
  { label: 'Cross-checking names, areas, dates', labelM: 'Cross-checking names and dates' },
  { label: 'Looking for missing links in the chain', labelM: 'Looking for gaps in the chain' },
  { label: 'Preparing your report', labelM: 'Preparing report' },
] as const
/** Overall percentage at which each stage (after "Files received") starts. */
export const STAGE_START = [0, 0, 50, 70, 90] as const

export type Sev = 'high' | 'medium' | 'clear'
export interface CheckFinding { title: string; titleM: string; sev: Sev; body: string; bodyM: string; quote: string; quoteM: string; source: string }
export interface CheckReport {
  verdict: 'stop' | 'proceed'
  title: string
  titleM: string
  checkId: string
  idM: string
  headline: string
  headlineM: string
  counts: { high: number; medium: number; clear: number }
  note?: { title: string; body: string; bodyM: string }
  findings: CheckFinding[]
  footer: string
  footerM: string
}

export const STOP_REPORT: CheckReport = {
  verdict: 'stop',
  title: 'Resale flat · Flat 702, Sai Residency, Wakad',
  titleM: 'Resale flat · Flat 702, Sai Residency',
  checkId: 'Not on Realdha · check #CK-2026-0412',
  idM: 'Not on Realdha · #CK-2026-0412',
  headline: 'A co-owner has not released their share. A sale without them can be challenged later. Ask your lawyer to review before any payment.',
  headlineM: 'A co-owner has not released their share. Do not pay or sign yet.',
  counts: { high: 1, medium: 1, clear: 4 },
  findings: [
    { title: 'One legal heir has not signed a release', titleM: 'One legal heir has not signed a release', sev: 'high', body: "The share certificate names Sameer's seller as one of three heirs of the late owner. Only two heirs signed the agreement, and no release deed from the third was uploaded.", bodyM: 'Two of three heirs signed. No release deed from the third was uploaded.', quote: '"…Smt. Lata M. Patil and Shri Anil M. Patil, being two of the three legal heirs…"', quoteM: '“…being two of the three legal heirs…”', source: 'Agreement for sale · page 3, clause 2' },
    { title: 'Society NOC is dated before the agreement', titleM: 'Society NOC is dated before the agreement', sev: 'medium', body: 'The NOC pre-dates the agreement by 14 months. Societies usually reissue it for the current buyer.', bodyM: 'The NOC is 14 months older than the agreement.', quote: '"This NOC is issued on 12 September 2025."', quoteM: '“This NOC is issued on 12 September 2025.”', source: 'Society NOC · page 1' },
    { title: 'Seller name matches across documents', titleM: 'Seller name matches', sev: 'clear', body: 'Name, flat number and area are consistent in all 3 documents.', bodyM: 'Name, flat number and area match in all 3 documents.', quote: '"Flat No. 702, Sai Residency, Wakad, 1,020 sq ft carpet."', quoteM: '“Flat No. 702, Sai Residency, Wakad.”', source: 'Agreement for sale · page 1' },
  ],
  footer: 'Prepared for Sameer (sample). AI-assisted check, not legal advice. A lawyer has not reviewed this report.',
  footerM: 'Prepared for Sameer (sample). AI-assisted, not legal advice. No lawyer has reviewed this.',
}

export const PROCEED_REPORT: CheckReport = {
  verdict: 'proceed',
  title: 'Resale flat · Flat 1103, Lake View, Hinjewadi',
  titleM: 'Resale flat · Flat 1103, Lake View',
  checkId: 'Not on Realdha · check #CK-2026-0431',
  idM: 'Not on Realdha · #CK-2026-0431',
  headline: 'Nothing in these documents stops the purchase. A lawyer should still confirm before you pay.',
  headlineM: 'No blocking issues. A lawyer should still confirm before you pay.',
  counts: { high: 0, medium: 1, clear: 7 },
  note: { title: '1 medium note', body: 'Parking is mentioned in the agreement but not on the society NOC. Worth asking, not a blocker.', bodyM: 'Parking is in the agreement but not on the NOC.' },
  findings: [
    { title: 'Seller name matches across documents', titleM: 'Seller name matches across documents', sev: 'clear', body: 'Name, flat number and area are consistent in all 3 documents.', bodyM: 'Name, flat number and area are consistent in all 3 documents.', quote: '"Flat No. 702, Sai Residency, Wakad, 1,020 sq ft carpet."', quoteM: '“Flat No. 702, Sai Residency, Wakad, 1,020 sq ft carpet.”', source: 'Agreement for sale · page 1' },
    { title: 'Society NOC is current', titleM: 'Society NOC is current', sev: 'clear', body: 'The NOC is dated within 90 days and names the current buyer.', bodyM: 'NOC dated within 90 days.', quote: '"This NOC is issued on 3 November 2026."', quoteM: '“This NOC is issued on 3 November 2026.”', source: 'Society NOC · page 1' },
    { title: 'All heirs have signed', titleM: 'All heirs have signed', sev: 'clear', body: 'All three legal heirs appear as signatories, so the title chain is complete.', bodyM: 'All three legal heirs appear as signatories.', quote: '"…being all three legal heirs of the late Shri M. Patil…"', quoteM: '“…being all three legal heirs…”', source: 'Agreement for sale · page 3, clause 2' },
  ],
  footer: 'Sample data. AI-assisted check, not legal advice.',
  footerM: 'Sample data. AI-assisted check, not legal advice.',
}

export const REPORTS = { stop: STOP_REPORT, proceed: PROCEED_REPORT } as const

export interface ReviewPlan { id: 'standard' | 'priority'; label: string; reply: string; replyM: string; price: string }
export const REVIEW_PLANS: ReviewPlan[] = [
  { id: 'standard', label: 'Standard review', reply: 'Reply in 2 working days', replyM: '2 working days', price: '₹1,500' },
  { id: 'priority', label: 'Priority review', reply: 'Reply in 24 hours', replyM: '24 hours', price: '₹3,000' },
]
