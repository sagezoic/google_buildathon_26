import { useSharedState } from './shared-state'

export type FindingId = 'A' | 'B' | 'C'
const EMPTY: unknown = {}

/**
 * What the owner did on GP-10 (`property.findings`). Tolerates a map { A: 'confirmed' } or
 * { A: { resolution } } or an array of { id, resolution }. "Not provided" (skipped) is not a resolution.
 */
export function normalizeResolutions(raw: unknown): Partial<Record<FindingId, string>> {
  const out: Partial<Record<FindingId, string>> = {}
  const put = (id: unknown, v: unknown) => {
    const s = typeof v === 'string' ? v : v && typeof v === 'object' ? ((v as Record<string, unknown>).resolution ?? (v as Record<string, unknown>).status) : undefined
    if ((id === 'A' || id === 'B' || id === 'C') && typeof s === 'string' && s !== 'skipped') out[id] = s
  }
  if (Array.isArray(raw)) raw.forEach((r) => r && typeof r === 'object' && put((r as Record<string, unknown>).id, r))
  else if (raw && typeof raw === 'object') Object.entries(raw).forEach(([k, v]) => put(k, v))
  return out
}
export const useOwnerResolutions = () => normalizeResolutions(useSharedState<unknown>('property.findings', EMPTY)[0])
