import { path } from '../../app/nav'

export interface Listing { id: string; title: string; price: string; to: string }
export interface Launch { id: string; title: string; sub: string; to: string }

export const RECENT: Listing[] = [
  { id: 'RA-PUN-001-A-18-04', title: 'A-1804 · 3 BHK · Baner', price: '₹1,42,00,000', to: path('F09-03') },
  { id: 'RA-PUN-001-A-17-04', title: 'A-1704 · 3 BHK · Baner', price: '₹1,38,00,000', to: path('F09-03') },
]
export const SHORTLIST: Listing[] = [
  { id: 'RA-PUN-007-B-09-02', title: 'B-0902 · 2 BHK · Skyline', price: '₹1,02,00,000', to: path('F09-03') },
  { id: 'RA-PUN-003-A-07-01', title: 'A-0701 · 3 BHK · Balewadi', price: '₹1,31,00,000', to: path('F09-03') },
]
export const LAUNCHES: Launch[] = [
  { id: 'RA-PUN-007', title: 'Skyline Residency', sub: 'Baner · from ₹92 L', to: path('F10-07') },
  { id: 'RA-PUN-012', title: 'Green Arcade', sub: 'Wakad · from ₹85 L', to: path('F10-07') },
]

export type NotifTone = 'danger' | 'success' | 'warning'
export interface WideNotif { id: string; tag: string; title: string; body: string; at: string; to: string }
export const WIDE_NOTIFS: WideNotif[] = [
  { id: 'w1', tag: 'KYC', title: 'KYC verified', body: 'Your identity check passed.', at: '20 Nov, 10:02', to: path('F02-03') },
  { id: 'w2', tag: 'Sign-off', title: 'Lawyer sign-off', body: 'Adv. Meera Joshi signed off RA-LON-004-P-112-2.', at: '20 Nov, 10:50', to: path('GP-16') },
  { id: 'w3', tag: 'Reply', title: 'Enquiry reply', body: 'Sahyadri Developers replied about A-1804.', at: '20 Nov, 12:30', to: path('F12-03') },
  { id: 'w4', tag: 'Reminder', title: 'Call reminder', body: 'Video call at 11:00 tomorrow.', at: '20 Nov, 15:00', to: path('X-01') },
  { id: 'w5', tag: 'Mint', title: 'Mint confirmed', body: '1,000 units minted on Sepolia testnet.', at: '20 Nov, 15:12', to: path('GP-22') },
]
export interface NarrowNotif { id: string; tag: string; title: string; at: string; tone: NotifTone; status: string; to: string; action?: string }
export const NARROW_NOTIFS: NarrowNotif[] = [
  { id: 'm1', tag: 'Check ready', title: 'Report #CK-2026-0412 is ready', at: '10 min ago', tone: 'danger', status: 'STOP', to: path('F05-03') },
  { id: 'm2', tag: 'Call confirmed', title: 'Sat 21 Nov, 10:30', at: '1 h ago', tone: 'success', status: 'Confirmed', to: path('X-01') },
  { id: 'm3', tag: 'Sign-off', title: 'A-1804 was signed off', at: 'Yesterday', tone: 'success', status: 'Signed off', to: path('F09-03') },
  { id: 'm4', tag: 'Needs approval', title: 'Approve mint for RA-LON-004', at: '2 days ago', tone: 'warning', status: 'Action needed', to: path('GP-20'), action: 'Review' },
]

export interface Profile { name: string; phone: string; email: string; emailOn: boolean; smsOn: boolean; saved: boolean }
export const PROFILE_DEFAULT: Profile = { name: 'Prakash Kulkarni', phone: '+91 98220 11223', email: 'prakash@example.com', emailOn: true, smsOn: false, saved: false }

export const ERRORS = {
  notfound: { code: '404', wideTitle: 'Page not found', narrowTitle: 'We cannot find that page', body: 'The link may be old, or the record ID may be wrong.', narrowBody: '', wideAction: 'Go to Home', narrowAction: 'Go to home' },
  denied: { code: '403', wideTitle: 'You do not have permission', narrowTitle: 'You do not have access', body: 'Your role cannot open this page. Ask the owner for access.', narrowBody: '', wideAction: 'Request access', narrowAction: 'Go back' },
  offline: { code: 'Offline', wideTitle: 'You are offline', narrowTitle: 'You are offline', body: 'We cannot reach Realdha. Your draft is saved on this device.', narrowBody: 'Your draft is saved on this device.', wideAction: 'Try again', narrowAction: 'Try again' },
  error: { code: 'Error', wideTitle: 'Something went wrong', narrowTitle: 'Something went wrong on our side', body: 'This was not your fault. Error ref RA-ERR-7K2M.', narrowBody: 'Reference 7F2A-91C0', wideAction: 'Reload page', narrowAction: 'Try again' },
} as const
export type ErrorKind = keyof typeof ERRORS

export interface TwinCopy {
  lang: 'hi' | 'mr'; tabLabel: string; chip: string; title: string; place: string
  facts: { k: string; v: string }[]; docsTitle: string; docs: { n: string; h: string }[]
  actions: string[]; note: string
  apt: { title: string; lines: string[]; share: string }
}
export const TWIN_COPY: Record<'hi' | 'mr', TwinCopy> = {
  hi: {
    lang: 'hi', tabLabel: 'हिं · Hindi', chip: 'हस्ताक्षरित · ऑन-चेन', title: 'कुसगाव एनए प्लॉट · गट 112/2', place: 'मावळ, पुणे · नमूना डेटा',
    facts: [{ k: 'क्षेत्रफल', v: '0.0418 ha' }, { k: 'उपयोग', v: 'गैर-कृषि' }], docsTitle: 'दस्तावेज़',
    docs: [{ n: '7/12 उतारा', h: '0x9f3a…c21e' }, { n: 'संपत्ति कार्ड', h: '0x21fd…9c03' }],
    actions: ['लिंक साझा करें', 'दस्तावेज़ जाँचें', 'AI से पूछें', 'टोकनाइज़ करें'], note: 'आधिकारिक भूमि रजिस्टर ही कानूनी रिकॉर्ड है।',
    apt: { title: 'ए-1804 · 3 बीएचके', lines: ['बानेर हाइट्स, पुणे', 'कारपेट क्षेत्र: 1,180 वर्ग फुट', 'दिशा: पूर्व'], share: 'लिंक साझा करें' },
  },
  mr: {
    lang: 'mr', tabLabel: 'मरा · Marathi', chip: 'स्वाक्षरीत · ऑन-चेन', title: 'कुसगाव एनए प्लॉट · गट 112/2', place: 'मावळ, पुणे · नमुना डेटा',
    facts: [{ k: 'क्षेत्रफळ', v: '0.0418 ha' }, { k: 'वापर', v: 'बिनशेती' }], docsTitle: 'कागदपत्रे',
    docs: [{ n: '7/12 उतारा', h: '0x9f3a…c21e' }, { n: 'मिळकत पत्रिका', h: '0x21fd…9c03' }],
    actions: ['लिंक शेअर करा', 'कागदपत्र तपासा', 'AI ला विचारा', 'टोकनाइज करा'], note: 'अधिकृत जमीन नोंदणी हाच कायदेशीर अभिलेख आहे.',
    apt: { title: 'ए-1804 · ३ बीएचके', lines: ['बाणेर हाइट्स, पुणे', 'कार्पेट क्षेत्र: १,१८० चौरस फूट', 'दिशा: पूर्व'], share: 'लिंक शेअर करा' },
  },
}
