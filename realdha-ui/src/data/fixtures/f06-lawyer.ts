/** F06 · Lawyer send-back and sign-off history fixtures. */

export interface FindingComment {
  id: string
  findingTitle: string
  findingSub: string
  initialComment: string
}

export const LAWYER_COMMENTS_SEED: FindingComment[] = [
  {
    id: 'area-differs',
    findingTitle: 'Area differs',
    findingSub: 'Agreement vs Occupancy Certificate',
    initialComment: 'Carpet area in the agreement (1,180 sq ft) and the OC (1,145 sq ft) differ. Please upload the corrected OC or a developer letter.',
  },
  {
    id: 'mutation-entry',
    findingTitle: 'Mutation entry',
    findingSub: 'Ferfar entry 2291',
    initialComment: 'Entry 2291 is cited in 7/12 extract but not uploaded. Please provide certified Ferfar copy.',
  },
]

export interface SignOffHistoryItem {
  id: string
  title: string
  timestamp: string
  actor: string
  details: string
  statusTone: 'chain' | 'success' | 'info' | 'warning'
}

export const SIGN_OFF_HISTORY: SignOffHistoryItem[] = [
  {
    id: 's1',
    title: 'Signed off',
    timestamp: '18 Nov 2026, 10:42',
    actor: 'Adv. Meera Joshi · Bar Council no. MH/1234/2012 (sample)',
    details: 'Title investigation complete. Verified chain of title, RERA compliance, and municipal approvals without defects.',
    statusTone: 'success',
  },
  {
    id: 's2',
    title: 'Anchored on-chain',
    timestamp: '18 Nov 2026, 11:04',
    actor: 'System · 3 fingerprints on Sepolia testnet',
    details: 'Tx 0x90cd…7e2a · Merkle root anchored. Block 6,842,104.',
    statusTone: 'chain',
  },
  {
    id: 's3',
    title: 'Owner answered 2 questions',
    timestamp: '16 Nov 2026, 17:15',
    actor: 'Prakash Kulkarni',
    details: 'Uploaded corrected OC (dated 14 Oct 2026) and builder clarification letter explaining balcony inclusion.',
    statusTone: 'info',
  },
  {
    id: 's4',
    title: 'Sent back with comments',
    timestamp: '16 Nov 2026, 11:20',
    actor: 'Adv. Meera Joshi',
    details: 'Flagged carpet area difference (35 sq ft) and requested certified copy of Ferfar mutation entry 2291.',
    statusTone: 'warning',
  },
]
