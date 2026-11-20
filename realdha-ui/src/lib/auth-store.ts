import { readShared, useSharedState, writeShared } from './shared-state'

/** Demo account store for the F01 flow. Persisted under `rd:auth.accounts` and `rd:auth.session` (localStorage). */
export type AuthMethod = 'email' | 'google' | 'phone'
export interface Account { email: string; name: string; method: AuthMethod; pw: string; verified: boolean; createdAt: number }
export interface Session { email: string; name: string; method: AuthMethod; at: number }

export const AUTH_KEYS = {
  accounts: 'auth.accounts',
  session: 'auth.session',
  pendingEmail: 'auth.pendingEmail',
  verify: 'auth.verify',
  reset: 'auth.reset',
  signup: 'auth.signup',
  business: 'auth.business',
} as const

/** Demo-only digest so passwords are not stored as readable text. Not real security. */
export const hashPw = (pw: string) => {
  let h = 5381
  for (let i = 0; i < pw.length; i++) h = ((h << 5) + h + pw.charCodeAt(i)) | 0
  return `d${(h >>> 0).toString(36)}`
}

export const SAMPLE_LOGIN = { email: 'priya@example.com', password: 'Realdha@2026' }
const SEEDS: Account[] = [
  { email: 'prakash@example.com', name: 'Prakash Kulkarni', method: 'google', pw: '', verified: true, createdAt: 0 },
  { email: SAMPLE_LOGIN.email, name: 'Priya Deshmukh', method: 'email', pw: hashPw(SAMPLE_LOGIN.password), verified: true, createdAt: 0 },
]
const EMPTY: Account[] = []
const NO_SESSION = null as Session | null

export const normEmail = (e: string) => e.trim().toLowerCase()

/** Stored accounts win over the seeded sample accounts. */
export function readAccounts(): Account[] {
  const stored = readShared<Account[]>(AUTH_KEYS.accounts, EMPTY)
  return [...SEEDS.filter((s) => !stored.some((a) => a.email === s.email)), ...stored]
}
export const findAccount = (email: string) => readAccounts().find((a) => a.email === normEmail(email))
export function saveAccount(acc: Account) {
  writeShared<Account[]>(AUTH_KEYS.accounts, (p) => [...p.filter((a) => a.email !== acc.email), acc], EMPTY)
}

export const readSession = () => readShared<Session | null>(AUTH_KEYS.session, NO_SESSION)
export const useSession = () => useSharedState<Session | null>(AUTH_KEYS.session, NO_SESSION)[0]
export function startSession(a: Account) {
  writeShared<Session | null>(AUTH_KEYS.session, { email: a.email, name: a.name, method: a.method, at: Date.now() }, NO_SESSION)
}
/** Sign out clears only the session: accounts, drafts, KYC and property data stay. */
export const endSession = () => writeShared<Session | null>(AUTH_KEYS.session, null, NO_SESSION)

export const methodLabel = (m: AuthMethod) => (m === 'google' ? 'Google' : m === 'phone' ? 'phone' : 'email')

export const emailError = (v: string) => {
  const e = v.trim()
  if (!e) return 'Enter your email.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) return 'Enter a valid email, like name@example.com.'
  return ''
}
export const nameError = (v: string) => (v.trim().length < 2 ? 'Enter your full name.' : '')

export const PW_RULES = [
  { id: 'len', label: 'At least 10 characters', test: (p: string) => p.length >= 10 },
  { id: 'alnum', label: 'A letter and a number', test: (p: string) => /[A-Za-z]/.test(p) && /\d/.test(p) },
  { id: 'upper', label: 'An uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'sym', label: 'A symbol (! @ # ?)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const
export const pwScore = (p: string) => PW_RULES.filter((r) => r.test(p)).length
export const PW_LABEL = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'] as const
export const pwError = (p: string) => (!p ? 'Enter a password.' : pwScore(p) < 4 ? 'Password does not meet all the rules yet.' : '')
