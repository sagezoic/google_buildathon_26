import { JOURNEYS, type JourneyRole } from '../app/journeys'
import { path } from '../app/nav'
import { readSession } from './auth-store'
import { K, type KycStatus } from './identity-flow'
import { readShared, useSharedState, writeShared } from './shared-state'

/**
 * Persona chosen on `/`. While set, sign-in, KYC and the DigiLocker fetch hand off to the next
 * unfinished step instead of their usual targets, and the last step lands on the persona's journey home.
 */
export const INTENT_KEY = 'onboard.intent'
/** Fetched DigiLocker documents, keyed by `<account>|<role>`. */
export const DIGILOCKER_KEY = 'digilocker.fetched'

export type OnboardStep = 'signin' | 'kyc' | 'docs' | 'home'
export const STEP_LABELS = ['Sign in', 'Verify identity', 'DigiLocker documents'] as const

export interface FetchedDoc { id: string; name: string; issuer: string; uri: string; at: number }
export type FetchedMap = Record<string, FetchedDoc[]>

const NONE = null as JourneyRole | null
const EMPTY: FetchedMap = {}

export const readIntent = () => readShared<JourneyRole | null>(INTENT_KEY, NONE)
export const useIntent = () => useSharedState<JourneyRole | null>(INTENT_KEY, NONE)[0]
export const setIntent = (r: JourneyRole | null) => writeShared<JourneyRole | null>(INTENT_KEY, r, NONE)

/** Who is signed in: the email session, or a verified phone (the phone path has no email account). */
export function accountKey(): string | null {
  const s = readSession()
  if (s) return s.email
  if (readShared<boolean>(K.phoneVerified, false)) return `phone:${readShared<string>(K.phone, '')}`
  return null
}

const docsKey = (role: JourneyRole) => `${accountKey() ?? 'guest'}|${role}`
export const readFetched = (role: JourneyRole) => readShared<FetchedMap>(DIGILOCKER_KEY, EMPTY)[docsKey(role)] ?? []
export const saveFetched = (role: JourneyRole, docs: FetchedDoc[]) =>
  writeShared<FetchedMap>(DIGILOCKER_KEY, (p) => ({ ...p, [docsKey(role)]: docs }), EMPTY)

export function pendingStep(role: JourneyRole): OnboardStep {
  if (!accountKey()) return 'signin'
  const kyc = readShared<KycStatus>(K.kycStatus, 'none')
  if (kyc !== 'verified' && kyc !== 'pending') return 'kyc'
  if (readFetched(role).length === 0) return 'docs'
  return 'home'
}

/** Where the persona should go next. Reaching home clears the intent. */
export function nextOnboardPath(role: JourneyRole): string {
  const step = pendingStep(role)
  if (step === 'home') return finishOnboarding(role)
  return path(step === 'signin' ? 'F01-01' : step === 'kyc' ? 'GP-04' : 'F02-04')
}

export function finishOnboarding(role: JourneyRole): string {
  setIntent(null)
  return JOURNEYS[role].home
}

export const STEP_INDEX: Record<Exclude<OnboardStep, 'home'>, number> = { signin: 1, kyc: 2, docs: 3 }
