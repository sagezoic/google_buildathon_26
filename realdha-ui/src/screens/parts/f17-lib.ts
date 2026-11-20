import type { MintStatus } from '../../lib/chain'
export type TokState = 'minted' | 'pending' | 'failed'
/** The plot token follows GP-20's saved mint (mint.status): a mint in review has not started, so the sample token shows as minted. */
export const plotState = (m: MintStatus): TokState => (m === 'pending' ? 'pending' : m === 'failed' ? 'failed' : 'minted')

