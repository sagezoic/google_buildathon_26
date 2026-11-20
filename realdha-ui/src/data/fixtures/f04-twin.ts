/** F04 · Apartment Twin and Ownership History fixtures. */

export interface OwnerHistoryEntry {
  id: string
  name: string
  role: string
  period: string
  note: string
  docName: string
  docPages: string
  hash: string
  verified: boolean
  isCurrent?: boolean
}

export const OWNERSHIP_HISTORY: OwnerHistoryEntry[] = [
  {
    id: 'h1',
    name: 'Prakash Kulkarni',
    role: 'Current owner',
    period: '14 Mar 2022 to present',
    note: 'Resale by registered sale deed.',
    docName: 'Sale deed',
    docPages: 'p1–6',
    hash: '0x7a12…44be',
    verified: true,
    isCurrent: true,
  },
  {
    id: 'h2',
    name: 'Meena Deshpande',
    role: 'Previous owner',
    period: '9 Aug 2019 to 14 Mar 2022',
    note: 'First buyer from the developer.',
    docName: 'Agreement for sale',
    docPages: 'p1–12',
    hash: '0x21fd…9c03',
    verified: true,
  },
  {
    id: 'h3',
    name: 'Sahyadri Developers Pvt Ltd',
    role: 'Original developer',
    period: 'Until 9 Aug 2019',
    note: 'RERA registration P52100012345 · Allotment letter and possession certificate.',
    docName: 'Possession letter',
    docPages: 'p1–3',
    hash: '0x38e1…8b19',
    verified: true,
  },
]

export interface MarathiExtractLine {
  mr: string
  en: string
  highlight?: boolean
}

export const MARATHI_EXTRACT_RECORD = {
  id: 'RA-LON-004-P-112-2',
  titleMr: 'गाव नमुना सात – अधिकार अभिलेख पत्रक',
  titleEn: 'Village Form 7 – Record of Rights',
  villageMr: 'कुसगाव',
  villageEn: 'Kusgaon',
  talukaMr: 'मावळ',
  talukaEn: 'Maval',
  districtMr: 'पुणे',
  districtEn: 'Pune',
  gatMr: 'गट नं. ११२/२',
  gatEn: 'Gat No. 112/2',
  areaMr: '०.०४१८ हे.आर',
  areaEn: '0.0418 hectare (= 4,500 sq ft)',
  ownerMr: 'प्रकाश कुलकर्णी',
  ownerEn: 'Prakash Kulkarni',
  useMr: 'बिनशेती (NA)',
  useEn: 'Non-Agricultural (NA)',
  fingerprint: '0x9f3a…c21e',
  anchoredTx: '0x90cd…7e2a',
}
