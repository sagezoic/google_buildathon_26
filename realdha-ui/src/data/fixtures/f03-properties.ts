/** Sample data for F03 (add apartment / commercial, upload errors, My properties, drafts). Values are verbatim from the frames. */
export type PropKind = 'plot' | 'apartment' | 'commercial'

export interface ApartmentForm { project: string; rera: string; tower: string; floor: string; unit: string; config: string; carpet: string; facing: string; view: string }
export interface CommercialForm { building: string; rera: string; unitType: string; floor: string; unit: string; carpet: string; use: string; address: string }
export interface AddForm { type: PropKind; apartment: ApartmentForm; commercial: CommercialForm }

export const APARTMENT_DEFAULT: ApartmentForm = { project: 'Baner Heights', rera: 'P52100012345', tower: 'A', floor: '18', unit: '04', config: '3 BHK', carpet: '1,180', facing: 'East', view: 'Hill' }
export const COMMERCIAL_DEFAULT: CommercialForm = { building: 'Kothrud Arcade', rera: 'P52100054321', unitType: 'Shop', floor: 'Ground', unit: '03', carpet: '420', use: 'Retail', address: 'Karve Road, Kothrud, Pune' }
export const ADD_DEFAULT: AddForm = { type: 'apartment', apartment: APARTMENT_DEFAULT, commercial: COMMERCIAL_DEFAULT }

export const CONFIGS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK'] as const
export const FACINGS = ['East', 'West', 'North', 'South'] as const
export const UNIT_TYPES = ['Shop', 'Office', 'Showroom'] as const
export const USES = ['Retail', 'Office', 'Showroom'] as const

export type PropStatus = 'anchored' | 'signed' | 'review' | 'clarify' | 'checked' | 'draft'

export interface PropRow {
  id: string
  title: string
  sub: string
  mTitle: string
  mSub: string
  recordId: string | null
  type: 'Plot' | 'Apartment' | 'Commercial'
  status: PropStatus
  updated: string
  /** Sort key: larger = more recent. */
  rank: number
  action: { label: string; to: string; primary?: boolean }
}

/** The frame's six rows. The plot row (first) is rebuilt from the saved GP-07 draft; the draft row comes from `f03.drafts`. */
export const SEED_ROWS: PropRow[] = [
  {
    id: 'plot',
    title: 'NA plot, Gat 112/2',
    sub: 'Kusgaon, Lonavala',
    mTitle: 'NA plot, Gat 112/2',
    mSub: 'Kusgaon, Lonavala',
    recordId: 'RA-LON-004-P-112-2',
    type: 'Plot',
    status: 'anchored',
    updated: 'Today',
    rank: 100,
    action: { label: 'Open', to: '/properties/RA-LON-004-P-112-2' },
  },
  {
    id: 'a1804',
    title: 'A-1804 · 3 BHK',
    sub: 'Baner Heights, Pune',
    mTitle: 'A-1804 · 3 BHK',
    mSub: 'Baner Heights, Pune',
    recordId: 'RA-PUN-001-A-18-04',
    type: 'Apartment',
    status: 'signed',
    updated: '2 d ago',
    rank: 80,
    action: { label: 'Open', to: '/properties/RA-PUN-001-A-18-04/apartment' },
  },
  {
    id: 'shop03',
    title: 'Shop 03, Kothrud Arcade',
    sub: 'Karve Road, Pune',
    mTitle: 'Shop 03',
    mSub: 'Kothrud Arcade',
    recordId: 'RA-PUN-008-S-03-00',
    type: 'Commercial',
    status: 'review',
    updated: '1 d ago',
    rank: 90,
    action: { label: 'Open', to: '/properties/RA-PUN-008-S-03-00' },
  },
  {
    id: 'alibag',
    title: 'Plot 45, Alibag',
    sub: 'Alibag, Raigad',
    mTitle: 'Plot 45',
    mSub: 'Alibag, Raigad',
    recordId: 'RA-ALI-001-P-45-1',
    type: 'Plot',
    status: 'clarify',
    updated: '3 d ago',
    rank: 70,
    action: { label: 'Resolve', to: '/properties/new/resolve', primary: true },
  },
  {
    id: 'flat902',
    title: 'Flat 902, Wakad',
    sub: 'Wakad, Pune',
    mTitle: 'Flat 902',
    mSub: 'Wakad, Pune',
    recordId: 'RA-PUN-006-D-09-02',
    type: 'Apartment',
    status: 'checked',
    updated: '4 d ago',
    rank: 60,
    action: { label: 'Open', to: '/properties/RA-PUN-006-D-09-02' },
  },
]

export const STATUS_LABEL: Record<PropStatus, string> = {
  anchored: 'Anchored on-chain',
  signed: 'Signed off',
  review: 'Lawyer review',
  clarify: 'Needs clarification',
  checked: 'Documents checked',
  draft: 'Draft',
}
export const SIGNED_STATUSES: PropStatus[] = ['anchored', 'signed']

export interface DraftEntry {
  id: string
  kind: PropKind
  /** My properties row. */
  title: string
  mTitle: string
  sub: string
  step: 1 | 2
  /** Last saved time; null = the frame's sample ("5 d ago"). */
  savedAt: number | null
  /** Where Resume goes. */
  to: string
}

export const SEED_DRAFTS: DraftEntry[] = [
  { id: 'untitled-plot', kind: 'plot', title: 'Untitled plot', mTitle: 'Untitled plot', sub: 'Step 2 of 4 · Documents', step: 2, savedAt: null, to: '/properties/new/upload' },
]

export const STEP_LABEL = { 1: 'Property details', 2: 'Documents' } as const

export type IssueId = 'unsupported' | 'unreadable' | 'wrong-type' | 'duplicate'
export interface Issue {
  id: IssueId
  cap: string
  doc: string
  file: string
  tone: 'danger' | 'warning'
  /** 1440 copy */
  msg: string
  /** 390 copy */
  mTitle: string
  mMsg: string
}
export const ISSUES: Issue[] = [
  { id: 'unsupported', cap: 'A · Unsupported file', doc: '7/12 extract', file: '7-12.heic', tone: 'danger', msg: "This file type isn't supported. Use PDF, JPG or PNG.", mTitle: 'Unsupported file', mMsg: 'scan.heic is not supported. Use PDF, JPG or PNG.' },
  { id: 'unreadable', cap: 'B · Unreadable scan', doc: 'NA order', file: 'na-order.jpg', tone: 'warning', msg: "We can't read this scan clearly. Retake it in good light, flat, with all four corners visible.", mTitle: 'Unreadable scan', mMsg: 'Page 2 is too blurry to read.' },
  { id: 'wrong-type', cap: 'C · Wrong document type', doc: 'Property card', file: 'sale-deed-2015.pdf', tone: 'warning', msg: 'This looks like a sale deed, not a property card. Detected language: मराठी.', mTitle: 'Wrong document type', mMsg: 'This looks like a sale deed, not a property card.' },
  { id: 'duplicate', cap: 'D · Duplicate', doc: 'Sale deed', file: 'sale-deed-copy.pdf', tone: 'warning', msg: 'This is identical to sale-deed-2015.pdf, already uploaded on 20 Nov 2026.', mTitle: 'Duplicate', mMsg: '7_12_extract.pdf is already uploaded.' },
]
