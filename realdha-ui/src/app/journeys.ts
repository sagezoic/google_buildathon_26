import { path } from './nav'

/** The three walk-throughs a first-time visitor can follow. Other roles are reached from the role menu. */
export type JourneyRole = 'owner' | 'developer' | 'buyer'

export interface Stage {
  label: string
  /** One plain sentence naming the capability this stage shows. */
  feature: string
  /** Where the stage starts. */
  to: string
  /** Every screen id that belongs to the stage. */
  ids: string[]
}

export interface Journey {
  role: JourneyRole
  /** Who the visitor is, in their own words. */
  name: string
  /** What they get out of it. */
  outcome: string
  cta: string
  /** First screen of the walk-through. */
  home: string
  /** Screens that belong to the journey but to no stage (the role's home). */
  homeIds: string[]
  stages: Stage[]
}

export const JOURNEYS: Record<JourneyRole, Journey> = {
  owner: {
    role: 'owner',
    name: 'I own a property',
    outcome: 'Turn a pile of title documents into a lawyer-signed record, anchored on-chain, that you can share.',
    cta: 'Start as owner',
    home: path('X-01'),
    homeIds: ['GP-06'],
    stages: [
      { label: 'Add property', feature: 'Plot or apartment, with its documents', to: path('GP-07'), ids: ['GP-07', 'GP-08', 'F03-01', 'F03-02', 'F03-03', 'F03-04'] },
      { label: 'AI check', feature: 'Reads Marathi 7/12 extracts and flags gaps', to: path('GP-10'), ids: ['GP-09', 'GP-10', 'GP-11', 'GP-12'] },
      { label: 'Lawyer sign-off', feature: 'A lawyer makes the legal call, not the AI', to: path('GP-13'), ids: ['GP-13', 'GP-14', 'F06-01', 'F06-02'] },
      { label: 'Anchor', feature: 'Document fingerprints go on a public testnet', to: path('GP-15'), ids: ['GP-15'] },
      { label: 'Digital twin', feature: 'Share it, check documents, ask the AI', to: path('GP-16'), ids: ['GP-16', 'GP-17', 'GP-18', 'F04-01', 'F04-02', 'F04-03', 'F07-01', 'F07-02'] },
      { label: 'Co-own', feature: 'Fractional units through a licensed partner', to: path('GP-19'), ids: ['GP-19', 'GP-20', 'GP-21', 'GP-22', 'F17-01', 'F17-02'] },
    ],
  },
  developer: {
    role: 'developer',
    name: 'I build and sell projects',
    outcome: 'Put every unit of a project on a verified record, then see which units buyers want.',
    cta: 'Start as developer',
    home: path('F15-01'),
    homeIds: ['F15-01'],
    stages: [
      { label: 'Create project', feature: 'Towers, floors and every unit on one record', to: path('F10-01'), ids: ['F10-01', 'F10-02', 'F10-03', 'F10-04', 'F10-05', 'F10-07', 'F10-08'] },
      { label: '3D twin', feature: 'Upload a model or request one', to: path('F14-01'), ids: ['F14-01', 'F14-02', 'F14-03', 'F14-04', 'F14-05'] },
      { label: 'Inventory', feature: 'Live availability and price history', to: path('F15-02'), ids: ['F15-02', 'F15-03'] },
      { label: 'Buyer interest', feature: 'Enquiries, calls and a demand heatmap', to: path('F15-04'), ids: ['F15-04', 'F15-05', 'F15-06', 'F15-07'] },
    ],
  },
  buyer: {
    role: 'buyer',
    name: 'I am buying',
    outcome: 'Check a title before you pay, then shortlist and talk to the seller.',
    cta: 'Start as buyer',
    home: path('X-01'),
    homeIds: ['X-01'],
    stages: [
      { label: 'Find', feature: 'Search by place or record ID', to: path('F08-01'), ids: ['F08-01', 'F08-02', 'F08-03', 'F08-04', 'F09-01', 'F09-02', 'F09-03', 'F10-06', 'F18-01', 'F18-02'] },
      { label: 'Verify', feature: 'Title check ends in Stop, Clarify or Proceed', to: path('F05-01'), ids: ['F05-01', 'F05-02', 'F05-03', 'F05-04', 'F05-05', 'F07-03'] },
      { label: 'Shortlist', feature: 'Compare units and ask the AI about the record', to: path('F11-01'), ids: ['F11-01', 'F11-02', 'F11-03'] },
      { label: 'Enquire', feature: 'Message the seller and book a call', to: path('F12-01'), ids: ['F12-01', 'F12-02', 'F12-03', 'F13-01', 'F13-02', 'F13-03', 'F13-04', 'F13-05'] },
    ],
  },
}

export function journeyFor(role: string): Journey | undefined {
  return role === 'owner' || role === 'developer' || role === 'buyer' ? JOURNEYS[role] : undefined
}

/** Where a screen sits in a journey. `stage` is -1 on the role's home; `null` when the screen is outside the journey. */
export function locate(journey: Journey, screenId: string): { stage: number } | null {
  if (journey.homeIds.includes(screenId)) return { stage: -1 }
  const stage = journey.stages.findIndex((s) => s.ids.includes(screenId))
  return stage === -1 ? null : { stage }
}
