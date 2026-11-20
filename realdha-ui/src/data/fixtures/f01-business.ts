/** Business-details form definitions for F01-07, one per sub-role (K.businessRole values). Sample formats only. */
export type BizRole = 'developer' | 'broker' | 'lawyer' | 'gov'
export interface BizField {
  id: string
  /** Desktop label, and the 390 label when it differs. */
  label: string
  labelM?: string
  placeholder: string
  help?: string
  mono?: boolean
  type?: 'email'
  options?: readonly string[]
  /** Returns an error message or ''. */
  check: (v: string) => string
}

const req = (what: string) => (v: string) => (v.trim() ? '' : `Enter ${what}.`)
const pattern = (re: RegExp, msg: string) => (v: string) => (!v.trim() ? 'This field is required.' : re.test(v.trim()) ? '' : msg)

export interface BizForm { title: string; heading: string; fields: BizField[] }

export const BIZ: Record<BizRole, BizForm> = {
  developer: {
    title: 'Developer',
    heading: 'Your organisation',
    fields: [
      { id: 'org', label: 'Organisation name', placeholder: 'Sahyadri Developers Pvt Ltd', check: req('your organisation name') },
      { id: 'rera', label: 'MahaRERA promoter registration no.', labelM: 'MahaRERA project number', placeholder: 'P52100012345', mono: true, help: 'Sample format', check: pattern(/^P\d{11}$/, 'Use the format P followed by 11 digits, like P52100012345.') },
      { id: 'city', label: 'Office city', placeholder: 'Pune', check: req('your office city') },
      { id: 'role', label: 'Your role', placeholder: 'Director', check: req('your role') },
    ],
  },
  broker: {
    title: 'Channel partner / broker',
    heading: 'Your firm',
    fields: [
      { id: 'org', label: 'Firm or trade name', labelM: 'Firm name', placeholder: 'Kulkarni Realty Advisors', check: req('your firm name') },
      { id: 'rera', label: 'MahaRERA agent registration no.', labelM: 'MahaRERA agent number', placeholder: 'A52100067890', mono: true, help: 'Sample format', check: pattern(/^A\d{11}$/, 'Use the format A followed by 11 digits, like A52100067890.') },
      { id: 'city', label: 'Operating city', placeholder: 'Pune', check: req('your operating city') },
      { id: 'kind', label: 'Individual or firm', placeholder: '', options: ['Individual', 'Firm'], check: req('one option') },
    ],
  },
  lawyer: {
    title: 'Lawyer / valuer',
    heading: 'Your practice',
    fields: [
      { id: 'org', label: 'Name of practice or firm', labelM: 'Firm name', placeholder: 'Joshi & Associates', check: req('your practice name') },
      { id: 'kind', label: 'Profession', placeholder: '', options: ['Advocate', 'Valuer'], check: req('your profession') },
      { id: 'rera', label: 'Bar Council / valuer registration no.', labelM: 'Bar Council / valuer number', placeholder: 'MAH/1234/2009', mono: true, help: 'Sample format', check: pattern(/^[A-Z]{2,3}\/\d{1,6}\/\d{4}$/i, 'Use the format MAH/1234/2009.') },
      { id: 'city', label: 'City', placeholder: 'Pune', check: req('your city') },
    ],
  },
  gov: {
    title: 'Government body',
    heading: 'Your department',
    fields: [
      { id: 'org', label: 'Department or authority', labelM: 'Department', placeholder: 'Sub-Registrar Office, Maval', check: req('your department') },
      { id: 'email', label: 'Official email (gov.in / nic.in)', labelM: 'Official email', placeholder: 'name@maharashtra.gov.in', type: 'email', help: "We'll send a code to this address", check: pattern(/^[^\s@]+@([a-z0-9-]+\.)*(gov|nic)\.in$/i, 'Use an official address ending in gov.in or nic.in.') },
      { id: 'desig', label: 'Designation', placeholder: 'Sub-Registrar', check: req('your designation') },
    ],
  },
}
export const bizRole = (v: string): BizRole => (v in BIZ ? (v as BizRole) : 'developer')
