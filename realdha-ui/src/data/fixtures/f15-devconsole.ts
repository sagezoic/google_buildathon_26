/** F15 · Developer Console fixtures. */

export interface DevStats {
  available: number
  total: number
  booked: number
  sold: number
  newEnquiries: number
  enquiriesChange: string
}

export const DEV_STATS: DevStats = {
  available: 214,
  total: 336,
  booked: 58,
  sold: 64,
  newEnquiries: 17,
  enquiriesChange: '+5 vs last week',
}

export interface PriceHistoryEntry {
  id: string
  when: string
  unit: string
  fromPrice: string
  toPrice: string
  change: string
  changeTone: 'up' | 'down'
  by: string
}

export const PRICE_HISTORY: PriceHistoryEntry[] = [
  { id: 'ph1', when: '20 Nov 2026, 10:14', unit: 'A-1704', fromPrice: '₹1,38,00,000', toPrice: '₹1,45,00,000', change: '+₹7,00,000', changeTone: 'up', by: 'Rahul Kale' },
  { id: 'ph2', when: '12 Nov 2026, 16:30', unit: 'A-1704', fromPrice: '₹1,35,00,000', toPrice: '₹1,38,00,000', change: '+₹3,00,000', changeTone: 'up', by: 'Rahul Kale' },
  { id: 'ph3', when: '01 Nov 2026, 09:00', unit: 'A-1704', fromPrice: '—', toPrice: '₹1,35,00,000', change: 'Base launch price', changeTone: 'up', by: 'Sahyadri Dev' },
]

export interface DevEnquiry {
  id: string
  name: string
  time: string
  unit: string
  subject: string
  phone: string
  email: string
  message: string
  status: 'new' | 'seen' | 'replied'
  thread: { from: 'buyer' | 'dev'; text: string; time: string }[]
}

export const DEV_ENQUIRIES: DevEnquiry[] = [
  {
    id: 'de1',
    name: 'Priya Deshmukh',
    time: '10:12',
    unit: 'A-1804',
    subject: 'Payment schedule?',
    phone: '+91 98765 43210',
    email: 'priya@example.com',
    message: 'Hello, could you share the construction-linked payment schedule and whether bank loans are pre-approved with HDFC / SBI?',
    status: 'new',
    thread: [
      { from: 'buyer', text: 'Hello, could you share the construction-linked payment schedule and whether bank loans are pre-approved with HDFC / SBI?', time: '10:12' },
    ],
  },
  {
    id: 'de2',
    name: 'Kunal Mehta',
    time: '09:40',
    unit: 'B-0902',
    subject: 'Possession date',
    phone: '+91 98111 22334',
    email: 'kunal@example.com',
    message: 'Is possession for Tower B committed for Dec 2027 or 2028?',
    status: 'seen',
    thread: [
      { from: 'buyer', text: 'Is possession for Tower B committed for Dec 2027 or 2028?', time: '09:40' },
    ],
  },
  {
    id: 'de3',
    name: 'Sneha Iyer',
    time: 'Yesterday',
    unit: 'A-1204',
    subject: 'Parking',
    phone: '+91 98222 33445',
    email: 'sneha@example.com',
    message: 'Does unit A-1204 include covered parking or open parking slot?',
    status: 'replied',
    thread: [
      { from: 'buyer', text: 'Does unit A-1204 include covered parking or open parking slot?', time: 'Yesterday 14:10' },
      { from: 'dev', text: 'Unit A-1204 includes one covered basement parking slot (P-104).', time: 'Yesterday 16:30' },
    ],
  },
]

export interface ChannelPartnerRecord {
  id: string
  name: string
  email: string
  status: 'Active' | 'Pending'
  access: string
  leads: number
  commission: string
}

export const CHANNEL_PARTNERS: ChannelPartnerRecord[] = [
  { id: 'cp1', name: 'Disha Realty (sample)', email: 'disha@example.com', status: 'Active', access: 'All towers · view and share', leads: 12, commission: '2.0%' },
  { id: 'cp2', name: 'Pune Prime Brokers', email: 'contact@puneprime.com', status: 'Active', access: 'Tower A only', leads: 8, commission: '2.0%' },
  { id: 'cp3', name: 'Apex Property Advisory', email: 'info@apexrealty.in', status: 'Pending', access: 'View only', leads: 0, commission: '1.8%' },
]
