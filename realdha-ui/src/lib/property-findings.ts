import { useEffect, useState } from 'react'
import { slotLabel, type Finding, type StoredDoc } from '../data/fixtures/property-intake'
import { areaToSqm, type AreaUnit } from './plot-shape'
import { getDocument, languageName, type ServerDocDetail } from './property-api'

/** A field read cleanly from the documents (no conflict). */
export interface SettledField { k: string; v: string; confirmed: boolean; source?: string }

/** Display name of a document: its slot name, or the file name for "other documents". */
export const docLabel = (d: { slot: string; filename: string }) => (d.slot === 'extra' ? d.filename : slotLabel(d.slot))

export const langLabel = (code: string | null) => (code && code !== 'und' ? languageName(code) : 'Unknown language')

const fmtSqm = (n: number) => `${Math.round(n * 100) / 100} sq m`
const surname = (name: string) => name.trim().split(/\s+/).pop() ?? name

/** Loads the original and English text of every processed document. `loading` is true until the current set has arrived. */
export function useDocDetails(propertyId: string | undefined, docs: StoredDoc[]) {
  const ids = docs.filter((d) => d.id && d.status === 'processed').map((d) => d.id as string)
  const key = `${propertyId ?? ''}|${ids.join(',')}`
  const [loaded, setLoaded] = useState<{ key: string; details: ServerDocDetail[]; error?: string }>({ key: '', details: [] })

  useEffect(() => {
    if (!propertyId || !ids.length) return
    let cancelled = false
    Promise.all(ids.map((id) => getDocument(propertyId, id)))
      .then((details) => { if (!cancelled) setLoaded({ key, details }) })
      .catch((e: unknown) => { if (!cancelled) setLoaded({ key, details: [], error: e instanceof Error ? e.message : 'Could not load the documents.' }) })
    return () => { cancelled = true }
    // `ids` is derived from `key`, so the key alone decides when to reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const enabled = !!propertyId && ids.length > 0
  return { enabled, loading: enabled && loaded.key !== key, details: loaded.key === key ? loaded.details : [], error: loaded.key === key ? loaded.error : undefined }
}

/** Findings the owner must resolve, derived from what the documents say. Ids stay A, B, C so GP-11/12 can read the stored decisions. */
export function deriveFindings(details: ServerDocDetail[], draft: { area: string; areaUnit: AreaUnit }, hasMutationDoc: boolean): Finding[] {
  const out: Finding[] = []

  // A · Area: documents and the owner's own entry should agree to within 2%.
  const entered = areaToSqm(draft.area, draft.areaUnit)
  const readings = details.filter((d) => d.fields?.areaSqm).map((d) => ({ k: docLabel(d), sqm: d.fields!.areaSqm as number }))
  if (entered !== null && readings.length) readings.push({ k: 'You entered', sqm: Math.round(entered * 100) / 100 })
  if (readings.length > 1) {
    const sqms = readings.map((r) => r.sqm)
    if (Math.max(...sqms) / Math.min(...sqms) > 1.02) {
      const value = fmtSqm(readings[0].sqm)
      const compare = readings.map((r) => ({ k: r.k, v: fmtSqm(r.sqm) }))
      out.push({
        id: 'A', title: 'A · Area', mobileTitle: 'Area', value, tone: 'danger', badge: 'High · values differ', mobileBadge: 'Differs', compare,
        source: `Source: ${readings[0].k}`,
        actions: [{ label: `Confirm ${value}`, kind: 'confirm' }, { label: 'Correct', kind: 'correct' }, { label: 'Upload corrected document', kind: 'upload' }],
        mobile: { value, note: compare.slice(1).map((c) => `${c.k} says ${c.v}.`).join(' '), source: readings[0].k, actions: [{ label: `Confirm ${value}`, kind: 'confirm' }, { label: 'Correct', kind: 'correct' }] },
      })
    }
  }

  // B · Mutation entry referenced in a document but never uploaded.
  const mutation = details.flatMap((d) => (d.fields?.mutationNos ?? []).map((no) => ({ no, from: docLabel(d) })))[0]
  if (mutation && !hasMutationDoc) {
    out.push({
      id: 'B', title: `B · Mutation entry no. ${mutation.no}`, mobileTitle: 'Mutation entry', value: mutation.no, tone: 'warning', badge: 'Medium · not uploaded', mobileBadge: 'Missing',
      single: 'Referenced, but no document', source: `Source: ${mutation.from} · "फेरफार क्र. ${mutation.no}"`,
      actions: [{ label: 'Upload mutation entry', kind: 'upload', primary: true }, { label: "I don't have it", kind: 'skip' }],
      mobile: { value: `No. ${mutation.no}`, note: 'Referenced but not uploaded.', actions: [{ label: 'Upload mutation entry', kind: 'upload' }, { label: "I don't have it", kind: 'skip' }] },
    })
  }

  // C · The owner's surname spelled differently across documents.
  const owners = details.filter((d) => d.fields?.ownerEn).map((d) => ({ k: docLabel(d), v: surname(d.fields!.ownerEn as string) }))
  if (new Set(owners.map((o) => o.v.toLowerCase())).size > 1) {
    const value = owners[0].v
    out.push({
      id: 'C', title: 'C · Owner surname', mobileTitle: 'Owner surname', value, tone: 'warning', badge: 'Medium · spelling differs', mobileBadge: 'Spelling',
      compare: owners, source: `Source: ${owners.map((o) => o.k).join(', ')}`,
      actions: [{ label: `Confirm "${value}"`, kind: 'confirm' }, { label: 'Correct', kind: 'correct' }],
      mobile: { value, note: owners.slice(1).map((o) => `${o.k} says "${o.v}".`).join(' '), source: owners.map((o) => o.k).join(' · '), actions: [{ label: `Confirm ${value}`, kind: 'confirm' }] },
    })
  }
  return out
}

/** Fields read cleanly from the documents, first document that has each one wins. */
export function deriveSettled(details: ServerDocDetail[], draft: { gat: string; village: string }, areaConflict: boolean): SettledField[] {
  const first = <T,>(pick: (d: ServerDocDetail) => T | null | undefined) => {
    for (const d of details) { const v = pick(d); if (v) return { v, from: docLabel(d) } }
    return null
  }
  const out: SettledField[] = []
  const owner = first((d) => d.fields?.ownerEn ?? d.fields?.owner)
  if (owner) out.push({ k: 'Owner name', v: owner.v, confirmed: true, source: owner.from })
  const gat = first((d) => d.fields?.gat)
  const village = first((d) => d.fields?.village)
  if (gat || village) out.push({ k: 'Gat number · Village', v: [gat?.v ?? draft.gat, village?.v ?? draft.village].filter(Boolean).join(' · '), confirmed: !!gat && gat.v.replace(/\s/g, '') === draft.gat.replace(/\s/g, ''), source: (gat ?? village)!.from })
  const area = first((d) => d.fields?.areaSqm)
  if (area && !areaConflict) out.push({ k: 'Area', v: fmtSqm(area.v as number), confirmed: true, source: area.from })
  const use = first((d) => d.fields?.landUse)
  if (use) out.push({ k: 'Land use', v: use.v, confirmed: false, source: use.from })
  return out
}
