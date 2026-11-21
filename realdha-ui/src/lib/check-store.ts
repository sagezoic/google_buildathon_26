import { usePersistentState } from '../app/persist'
import { INITIAL_CHECK, KINDS, REPORTS, type CheckReport, type CheckState } from '../data/fixtures/f05-check'
import { sourceLabel, useServerCheck, type ServerCheck } from './ai-api'

/** Live files must exist on the server; anything saved before uploads were real (no id) is dropped. */
const migrateCheck = (c: CheckState): CheckState => ({ ...INITIAL_CHECK, ...c, files: (c.files ?? []).filter((f) => f.id) })

/** F05 document check state shared by F05-01 to F05-05 (`f05.check`). */
export const useCheckState = () => usePersistentState<CheckState>('f05.check', INITIAL_CHECK, migrateCheck)

/** Property type stored on the server for each kind of check. */
export const PROPERTY_TYPE = { resale: 'apartment', 'under-construction': 'apartment', plot: 'plot', commercial: 'commercial' } as const

/** Maps a finished Gemini check to the report layout F05-03/04 render. */
export function toReport(c: ServerCheck): CheckReport | null {
  const r = c.report
  if (!r) return null
  const kind = KINDS.find((k) => k.id === c.kind)?.label ?? 'Property'
  const shortId = c.id.replace(/^chk_/, '').slice(0, 8).toUpperCase()
  const medium = r.findings.filter((f) => f.severity === 'medium')
  const date = new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  return {
    verdict: r.verdict,
    title: r.title.includes(kind) ? r.title : `${kind} · ${r.title}`,
    titleM: r.titleShort,
    checkId: `Not on Realdha · check #CK-${shortId}`,
    idM: `#CK-${shortId}`,
    headline: r.headline,
    headlineM: r.headlineShort,
    counts: r.counts,
    note: r.verdict === 'proceed' && medium.length
      ? { title: `${medium.length} medium note${medium.length === 1 ? '' : 's'}`, body: medium[0].body, bodyM: medium[0].bodyShort }
      : undefined,
    findings: r.findings.map((f) => ({
      title: f.title,
      titleM: f.titleShort,
      sev: f.severity,
      body: f.body,
      bodyM: f.bodyShort,
      quote: f.quoteEn,
      quoteM: f.quoteEn,
      quoteOrig: f.quote && f.quote !== f.quoteEn ? f.quote : undefined,
      source: sourceLabel(f.source),
    })),
    footer: `Checked by Gemini (${c.model}) on ${date}. AI-assisted check, not legal advice. A lawyer has not reviewed this report.`,
    footerM: 'AI-assisted check by Gemini, not legal advice. No lawyer has reviewed this.',
  }
}

/** The report for the current check: the stored Gemini report, or the sample for the chosen verdict when no check has run. */
export function useCheckReport(fallback: 'stop' | 'proceed') {
  const [check] = useCheckState()
  const { check: server, loading, error } = useServerCheck(check.propertyId, check.checkId)
  const real = server ? toReport(server) : null
  const hasCheck = !!(check.propertyId && check.checkId)
  return {
    report: real ?? (hasCheck ? null : REPORTS[check.verdict ?? fallback]),
    loading,
    error: error ?? (server && !real ? server.error ?? 'This check did not finish.' : undefined),
  }
}
