/** Shared rules and keys for the sign-up flow (GP-01 to GP-05). Values live in usePersistentState under these keys. */
export const K = {
  signupMethod: 'identity.signupMethod',
  phone: 'identity.phone',
  phoneVerified: 'identity.phoneVerified',
  otpPhase: 'identity.otp.phase',
  otpSentAt: 'identity.otp.sentAt',
  otpAttempts: 'identity.otp.attempts',
  accountType: 'identity.accountType',
  businessRole: 'identity.businessRole',
  pan: 'identity.pan',
  panConsent: 'identity.panConsent',
  name: 'identity.name',
  kycStatus: 'identity.kycStatus',
  kycAttempts: 'identity.kycAttempts',
  kycCheckedAt: 'identity.kycCheckedAt',
  kycConsentDate: 'identity.kycConsentDate',
} as const

export type KycStatus = 'none' | 'verified' | 'pending' | 'failed'

/** Demo one-time code; a real build would check this server-side. */
export const DEMO_CODE = '123456'
export const OTP_TTL_MS = 5 * 60 * 1000
export const OTP_RESEND_MS = 30 * 1000
export const OTP_MAX_ATTEMPTS = 3
export const KYC_MAX_ATTEMPTS = 3
/** A pending KYC check resolves after this long. */
export const KYC_PENDING_MS = 10 * 1000

export const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/
export const maskPan = (pan: string) => (pan.length === 10 ? `${pan.slice(0, 5)}••${pan.slice(7)}` : pan)

/** "98765 43210" from any digits. */
export const formatPhone = (raw: string) => {
  const d = raw.replace(/\D/g, '').slice(0, 10)
  return d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d
}
export const phoneError = (v: string) => {
  const d = v.replace(/\D/g, '')
  if (!d) return 'Enter your mobile number.'
  if (d.length !== 10) return 'Enter all 10 digits of your mobile number.'
  if (!/^[6-9]/.test(d)) return 'Indian mobile numbers start with 6, 7, 8 or 9.'
  return ''
}
export const panError = (v: string) => {
  if (!v) return 'Enter your PAN.'
  if (!PAN_RE.test(v)) return 'PAN is 5 letters, 4 digits, 1 letter, like ABCDE1234F.'
  return ''
}
/** Demo rule for the mocked DigiLocker result, from the last PAN letter: X fails, Y stays pending, anything else verifies. */
export const kycOutcome = (pan: string): Exclude<KycStatus, 'none'> => {
  const last = pan.slice(-1)
  return last === 'X' ? 'failed' : last === 'Y' ? 'pending' : 'verified'
}
export const fmtMmSs = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
export const today = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
