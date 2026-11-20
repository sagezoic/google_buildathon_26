export type Slot = 'B' | 'A'
export interface Upload { name: string; size: string }

/** The two fix uploads drawn in the GP-12 frames (finding B, finding A). */
export const slots: { id: Slot; note: string; noteM: string; titleM: string; initial: Upload }[] = [
  { id: 'B', note: 'Fixes finding B · Mutation entry · 1 page', noteM: 'mutation_2291.pdf · 1 page', titleM: 'Mutation entry 2291', initial: { name: 'mutation-2291.pdf', size: '1 page' } },
  { id: 'A', note: 'Fixes finding A · says 418 sq m · replaces the draft', noteM: 'agreement_v2.pdf · 14 pages', titleM: 'Corrected agreement', initial: { name: 'agreement-corrected.pdf', size: '14 pages' } },
]

export const results = {
  A: { title: 'A · Area', ok: 'Corrected agreement now matches the 7/12 at 418 sq m', open: 'Upload the corrected agreement that says 418 sq m' },
  B: { title: 'B · Mutation entry 2291', ok: 'Found in mutation-2291.pdf · transfers plot to Prakash Kulkarni', open: 'Upload mutation entry 2291' },
  C: { title: 'C · Surname', ok: 'Confirmed by owner · variant spelling recorded', open: 'Confirm the surname spelling on the review step' },
} as const
