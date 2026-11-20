/** Business KYC document slots (F02-01). Stored per slot as name/size/status only, never File objects. */
export interface KycDoc { name: string; size: number; startedAt: number; status: 'uploading' | 'uploaded'; fixedPct?: number }
export type KycDocs = Record<string, KycDoc>
export const KYC_SLOTS = [
  { id: 'gst', title: 'GST certificate' },
  { id: 'coi', title: 'Certificate of incorporation' },
  { id: 'rera', title: 'MahaRERA registration certificate', titleM: 'RERA certificate', hintM: 'Required for developers and brokers' },
] as const
export const UPLOAD_MS = 7000
export const MAX_BYTES = 20 * 1024 * 1024
export const ACCEPT = '.pdf,.jpg,.jpeg,.png'
export const fmtSize = (b: number) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)
export const kycFileError = (f: { name: string; size: number }) => {
  if (!/\.(pdf|jpe?g|png)$/i.test(f.name)) return 'Choose a PDF, JPG or PNG file.'
  if (f.size > MAX_BYTES) return 'That file is over 20 MB. Choose a smaller one.'
  return ''
}
/** The three states drawn in the frame, as `?state=` seeds. */
export const kycSeed = (now: number): Record<string, KycDocs> => ({
  empty: {},
  progress: {
    gst: { name: 'gst-certificate.pdf', size: 420 * 1024, startedAt: now - 60_000, status: 'uploaded' },
    coi: { name: 'certificate-of-incorporation.pdf', size: 1_800_000, startedAt: now, status: 'uploading', fixedPct: 58 },
  },
  ready: {
    gst: { name: 'gst-certificate.pdf', size: 420 * 1024, startedAt: now - 60_000, status: 'uploaded' },
    coi: { name: 'certificate-of-incorporation.pdf', size: 1_800_000, startedAt: now - 60_000, status: 'uploaded' },
    rera: { name: 'mahrera-registration.pdf', size: 650 * 1024, startedAt: now - 60_000, status: 'uploaded' },
  },
})
