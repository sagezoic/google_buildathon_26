/** F14 · 3D Visualisation fixtures. */

export interface ThreeDRequest {
  id: string
  project: string
  target: string
  deadline: string
  files: string[]
  notes: string
  status: 'In progress' | 'Completed' | 'Pending review'
  currentStep: number
  timeline: { title: string; date: string; status: 'done' | 'active' | 'waiting' }[]
}

export const SAMPLE_3D_REQUEST: ThreeDRequest = {
  id: '#3D-0042',
  project: 'Baner Heights',
  target: 'Tower A, floors 1 to 24',
  deadline: '30 Nov 2026',
  files: ['tower_a_plan.pdf', 'typical_floor.pdf'],
  notes: 'Please model East-facing balconies and the 18th-floor clubhouse connection.',
  status: 'In progress',
  currentStep: 3,
  timeline: [
    { title: 'Request received', date: '20 Nov 2026', status: 'done' },
    { title: 'Floor plans reviewed', date: '21 Nov 2026', status: 'done' },
    { title: 'Modelling in progress', date: 'Est. 26 Nov 2026', status: 'active' },
    { title: 'Review render', date: 'Est. 28 Nov 2026', status: 'waiting' },
    { title: 'Published to record', date: 'Est. 30 Nov 2026', status: 'waiting' },
  ],
}
