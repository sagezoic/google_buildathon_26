import { usePersistentState } from './persist'
import type { Role } from './screens'

export type SharedRole = 'owner' | 'buyer'

/** Owner and buyer share one UI; this persisted choice decides which of the two the shell renders. */
export function useActiveRole() {
  const [raw, setRole] = usePersistentState<SharedRole>('session.role', 'owner')
  const role: SharedRole = raw === 'buyer' ? 'buyer' : 'owner'
  return [role, setRole] as const
}

/** Owner/buyer screens render for whichever of the two is active; other roles keep their own. */
export function resolveRole(r: Role, active: SharedRole): Role {
  return r === 'owner' || r === 'buyer' ? active : r
}
