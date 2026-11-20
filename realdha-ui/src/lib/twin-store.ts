import { usePersistentState } from '../app/persist'
import { PLOT, PROOF } from '../data/fixtures/twin'

type Draft = Record<string, unknown>
const s = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : typeof v === 'number' ? String(v) : undefined)
const ANCHORED = /anchor|signed|confirm|done|complete|minted/i

/** Everything the Twin (GP-16..19) reads from earlier screens: saved plot, sign-off and anchor status. */
export function useTwinRecord() {
  const [draft] = usePersistentState<Draft | null>('property.draft', null)
  const [status] = usePersistentState<string | null>('anchor.status', null)
  const [tx] = usePersistentState<string | null>('anchor.txHash', null)
  const [at] = usePersistentState<string | null>('anchor.at', null)

  const d = draft ?? {}
  const gat = s(d.gat)
  const area = Number(String(d.area ?? '').replace(/[^\d.]/g, '')) || undefined
  const village = s(d.village)
  const taluka = s(d.taluka)
  const district = s(d.district)
  const gps = d.gps as { lat?: number; lng?: number } | undefined
  const gpsText = gps?.lat && gps?.lng ? `${gps.lat.toFixed(4)}° N, ${gps.lng.toFixed(4)}° E` : undefined

  const areaText = area ? `${area} sq m (${(area / 10000).toFixed(4)} ha)` : undefined
  const overview: { k: string; v: string; mono?: boolean }[] = PLOT.overview.map((o) => {
    if (o.k === 'Area' && areaText) return { k: o.k, v: areaText }
    if (o.k === 'Gat / survey no.' && gat) return { k: o.k, v: gat }
    if (o.k === 'Village' && village) return { k: o.k, v: village }
    if (o.k === 'Taluka · District' && (taluka || district)) return { k: o.k, v: `${taluka ?? 'Maval'} · ${district ?? 'Pune'}` }
    if (o.k === 'GPS' && gpsText) return { k: o.k, v: gpsText, mono: true }
    return 'mono' in o ? { k: o.k, v: o.v, mono: true } : { k: o.k, v: o.v }
  })

  const hasDraft = !!gat
  const plot = {
    recordId: s(d.recordId) ?? PLOT.recordId,
    title: hasDraft ? `NA plot, Gat ${gat}` : PLOT.title,
    titleCompact: hasDraft ? `NA plot · Gat ${gat}` : PLOT.titleCompact,
    location: hasDraft ? `Village ${village ?? 'Kusgaon'}, ${taluka ?? 'Maval'}, ${district ?? 'Pune'} · near Lonavala${area ? ` · ${area} sq m` : ''}` : PLOT.location,
    boundaryLabel: area ? `Boundary · ${area} sq m` : PLOT.boundaryLabel,
    overview,
    gat: gat ?? '112/2',
  }
  /** No anchor status saved yet = the sample record, which is signed off and anchored. */
  const anchored = status === null || ANCHORED.test(status)
  return {
    plot,
    anchored,
    signedOff: anchored,
    proof: { ...PROOF, txHash: tx ?? PROOF.txHash, anchored: at ?? PROOF.anchored },
  }
}

/** Copy text, returning whether it worked. */
export async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); return true } catch { return false }
}
