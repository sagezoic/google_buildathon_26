/** F16 channel partner sample data. Values from the F16 frames. */
export type UnitStatus = 'Available' | 'Booked' | 'Sold'
export interface Unit { record: string; unit: string; type: string; project: string; carpet: string; facing: string; price: string; status: UnitStatus }

export const UNITS: readonly Unit[] = [
  { record: 'RA-PUN-001-A-18-04', unit: 'A-1804', type: '3 BHK', project: 'Baner Heights', carpet: '1,180 sq ft', facing: 'East', price: '₹1,42,00,000', status: 'Available' },
  { record: 'RA-PUN-001-A-17-10', unit: 'A-1710', type: '2 BHK', project: 'Baner Heights', carpet: '860 sq ft', facing: '—', price: '₹98,00,000', status: 'Available' },
  { record: 'RA-PUN-001-B-09-02', unit: 'B-0902', type: '—', project: 'Baner Heights', carpet: '—', facing: '—', price: '—', status: 'Booked' },
  { record: 'RA-PUN-001-A-12-04', unit: 'A-1204', type: '—', project: 'Baner Heights', carpet: '—', facing: '—', price: '—', status: 'Sold' },
]
export const DEFAULT_UNIT = 'RA-PUN-001-A-18-04'
export const PROJECT_TALLY = { project: 'Baner Heights', available: 61, booked: 18, sold: 105, updated: '15:48' }

export const findUnit = (q: string): Unit | undefined => {
  const t = q.trim().toLowerCase()
  return UNITS.find((u) => u.record.toLowerCase() === t || u.unit.toLowerCase() === t || u.unit.replace('-', '').toLowerCase() === t)
}

export type LeadStatus = 'Enquiry sent' | 'Call booked' | 'Site visit done' | 'No response'
export interface Client { id: string; name: string; phone: string; unit: string; status: LeadStatus; last: string; note?: string; source?: string }

export const SEED_CLIENTS: Client[] = [
  { id: 'c1', name: 'Priya Deshmukh', phone: '+91 98765 43210', unit: 'A-1804', status: 'Enquiry sent', last: '20 Nov' },
  { id: 'c2', name: 'Rohan Shah', phone: '+91 98111 22233', unit: 'B-0902', status: 'Call booked', last: '19 Nov' },
  { id: 'c3', name: 'Anita Rao', phone: '+91 99200 55511', unit: 'A-1204', status: 'Site visit done', last: '15 Nov' },
  { id: 'c4', name: 'Vivek Joshi', phone: '+91 90090 12345', unit: 'A-0801', status: 'No response', last: '10 Nov' },
]

export const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'Enquiry sent', label: 'Enquiry sent' },
  { value: 'Call booked', label: 'Call booked' },
  { value: 'Site visit done', label: 'Site visit' },
  { value: 'closed', label: 'Closed' },
] as const
export type ClientFilter = (typeof FILTERS)[number]['value']

export const SOURCES = ['Phone', 'Walk-in', 'WhatsApp', 'Referral'] as const
export const CHANNELS = ['WhatsApp', 'SMS', 'Email', 'Copy link'] as const

export interface Hours { label: string; closed: boolean; from: string; to: string }
export interface CallAvail { length: string; window: string; hours: Hours[]; offer: boolean }
export const DEFAULT_AVAIL: CallAvail = {
  length: '30 minutes',
  window: '14 days ahead',
  hours: [
    { label: 'Mon to Fri', closed: false, from: '10:00', to: '17:00' },
    { label: 'Saturday', closed: false, from: '10:00', to: '13:00' },
    { label: 'Sunday', closed: true, from: '10:00', to: '13:00' },
  ],
  offer: true,
}
export const CALL_LENGTHS = ['15 minutes', '30 minutes', '45 minutes', '60 minutes']
export const BOOKING_WINDOWS = ['7 days ahead', '14 days ahead', '30 days ahead']

export const shortDate = (ts = Date.now()) => new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
