import { useSearchParams } from 'react-router'
import type { Role } from '../app/screens'
import { usePersistentState } from '../app/persist'

const ROLES: readonly Role[] = ['public', 'owner', 'buyer', 'developer', 'partner', 'lawyer', 'admin', 'government']

/**
 * The role the visitor is acting as. Reads `?as=<role>` (demo override) first, then the persisted `session.role`
 * (sign-in writes it). Null means no role has been chosen yet, so admin screens stay open for review.
 */
export function useSessionRole(): Role | null {
  const [params] = useSearchParams()
  const [saved] = usePersistentState<string | null>('session.role', null)
  const as = params.get('as')
  const pick = as ?? saved
  return pick && (ROLES as readonly string[]).includes(pick) ? (pick as Role) : null
}

export const ROLE_LABEL: Partial<Record<Role, string>> = {
  owner: 'retail owner', buyer: 'buyer', developer: 'developer', partner: 'channel partner', lawyer: 'lawyer', government: 'government body', public: 'visitor',
}
