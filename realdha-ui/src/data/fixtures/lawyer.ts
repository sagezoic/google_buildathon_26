export interface QueueRow {
  recordId: string
  property: string
  owner: string
  status: 'review' | 'aged' | 'signed' | 'sent-back'
  statusLabel: string
  ageLabel: string
  ageHours: number
  flags: string
}

export const lawyer = { name: 'Adv. Meera Joshi', city: 'Pune' }

export const queue: QueueRow[] = [
  { recordId: 'RA-LON-004-P-112-2', property: 'Plot · Gat 112/2 · Kusgaon', owner: 'Prakash Kulkarni', status: 'review', statusLabel: 'Lawyer review', ageLabel: '2 h', ageHours: 2, flags: '3 resolved, 0 open' },
  { recordId: 'RA-PUN-002-B-07-02', property: 'Apartment · B-0702 · Baner', owner: 'Anita Deshpande', status: 'review', statusLabel: 'Lawyer review', ageLabel: '1 d', ageHours: 24, flags: '1 open' },
  { recordId: 'RA-PUN-003-C-02-01', property: 'Shop · C-0201 · Kothrud', owner: 'Rahul Patil', status: 'review', statusLabel: 'Lawyer review', ageLabel: '3 d', ageHours: 72, flags: '0' },
  { recordId: 'RA-PUN-005-A-11-03', property: 'Apartment · A-1103 · Hinjewadi', owner: 'Sunita Joshi', status: 'aged', statusLabel: 'Aged · over 5 d', ageLabel: '6 d', ageHours: 144, flags: '2 open' },
]

const owners = ['Neha Kulkarni', 'Vikram Shinde', 'Anita Deshpande', 'Rahul Patil', 'Sunita Joshi', 'Amit Bhosale', 'Pooja Jadhav', 'Sanjay More', 'Kavita Pawar', 'Mahesh Gaikwad', 'Rekha Kale', 'Ravi Chavan']
const props = ['Apartment · A-0904 · Wakad', 'Plot · Gat 54/1 · Mulshi', 'Shop · C-0105 · Aundh', 'Apartment · B-1202 · Kharadi', 'Plot · Gat 31/4 · Lonavala', 'Apartment · A-0301 · Pashan', 'Shop · D-0102 · Camp', 'Apartment · C-0807 · Hadapsar', 'Plot · Gat 77/3 · Talegaon', 'Apartment · B-0505 · Viman Nagar', 'Shop · A-0103 · Deccan', 'Apartment · A-1406 · Bavdhan']

/** Sample archive: 12 earlier sign-offs (the tab says 12) and 1 file sent back. Marked as sample data on screen. */
export const signedArchive: QueueRow[] = owners.map((owner, i) => ({
  recordId: `RA-PUN-${String(10 + i).padStart(3, '0')}-S-${String(i + 1).padStart(2, '0')}-0${(i % 4) + 1}`,
  property: props[i],
  owner,
  status: 'signed',
  statusLabel: 'Signed off',
  ageLabel: `${i + 1} d ago`,
  ageHours: (i + 1) * 24,
  flags: '0 open',
}))
export const sentBackArchive: QueueRow[] = [
  { recordId: 'RA-PUN-006-A-09-01', property: 'Apartment · A-0901 · Balewadi', owner: 'Deepak Salunkhe', status: 'sent-back', statusLabel: 'Sent back', ageLabel: '2 d ago', ageHours: 48, flags: '1 open' },
]

export interface SignedOff { recordId: string; by: string; at: number }
export interface SentBack { recordId: string; by: string; at: number; comments: string[] }

export type Decision = 'accept' | 'reject' | 'comment' | null

export interface ReviewFinding {
  id: string
  title: string
  detail: string
  original?: string
  translation?: string
  initial: Decision
  comment?: string
}

export const reviewFindings: ReviewFinding[] = [
  { id: 'A', title: 'A · Area', detail: '7/12 extract p.1 and corrected agreement both state 418 sq m', original: 'एकूण क्षेत्र: ०.०४१८ हे.आर', translation: '= 0.0418 hectare', initial: 'accept' },
  { id: 'B', title: 'B · Mutation entry 2291', detail: 'mutation-2291.pdf · transfer to Prakash Kulkarni by sale, 2015', original: 'फेरफार क्र. २२९१ — विक्री', translation: '= Mutation no. 2291 — sale', initial: 'accept' },
  { id: 'C', title: 'C · Surname spelling', detail: 'Kulkarni (7/12) vs Kulkarny (NA order)', initial: 'comment', comment: 'Ask owner for an affidavit of name variance? Otherwise accept.' },
]

export const reviewDocs = [
  { name: '7/12 extract', meta: '2 pages · मराठी' },
  { name: 'Property card', meta: '1 page · मराठी' },
  { name: 'NA order', meta: '3 pages · मराठी' },
  { name: 'Mutation entry 2291', meta: '1 page · मराठी' },
  { name: 'Sale deed', meta: '6 pages · मराठी, EN' },
]
