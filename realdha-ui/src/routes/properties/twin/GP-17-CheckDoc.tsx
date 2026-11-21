import { CircleAlert, FileUp, ShieldCheck } from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { usePersistentState } from '../../../app/persist'
import { useDemoState } from '../../../app/useDemoState'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { Button } from '../../../components/ui/button'
import { Modal } from '../../../components/ui/modal'
import { CHECK, compareFile, type CheckRecord } from '../../../data/fixtures/twin'
import { useTwinRecord } from '../../../lib/twin-store'
import { DEMO_PLOT_ID, shortHash, verifyFile } from '../../../lib/chain-api'
import { cn } from '../../../lib/cn'
import { TwinPage } from '../../parts/TwinPage'

const STATES = ['drop', 'matches', 'changed'] as const

function Rows({ rows }: { rows: { k: string; v: ReactNode; mono?: boolean; chain?: boolean }[] }) {
  return (
    <dl className="flex flex-col gap-2 rounded-control border border-line bg-sunken px-3.5 py-3 text-chip">
      {rows.map((r) => (
        <div key={r.k} className="flex justify-between gap-2">
          <dt className="text-muted">{r.k}</dt>
          <dd className={cn(r.mono && 'font-mono', r.chain && 'text-chain-ink')}>{r.v}</dd>
        </div>
      ))}
    </dl>
  )
}

/** GP-17 · Check a document modal over the Twin. States: drop, matches, changed. */
export default function CheckDoc() {
  const [forced] = useDemoState(STATES)
  const [params, setParams] = useSearchParams()
  const [checks, setChecks] = usePersistentState<CheckRecord[]>('twin.checks', [])
  const { proof, token } = useTwinRecord()
  const [current, setCurrent] = useState<{ file: string; size: number; result: 'matches' | 'changed'; doc: string; fingerprint: string; anchoredHash: string }>()
  const [error, setError] = useState('')
  // An explicit ?state= shows the drawn frame state; otherwise the state follows the real check.
  const state = params.has('state') ? forced : (current?.result ?? 'drop')
  const fileName = params.has('state') ? undefined : current?.file
  const input = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const close = () => void navigate(path('GP-16'))

  const SLOT_DOC: Record<string, string> = { extract: '7/12 extract', card: 'Property card', na: 'NA order', mutation: 'Mutation entry 2291', deed: 'Sale deed' }
  const pick = async (f?: File) => {
    if (!f) return
    if (!/\.(pdf|jpe?g|png)$/i.test(f.name)) return setError('Use a PDF, JPG or PNG file.')
    if (f.size > 20 * 1024 * 1024) return setError('This file is over 20 MB.')
    if (f.size === 0) return setError('This file is empty.')
    setError('')
    const at = new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    let rec: { result: 'matches' | 'changed'; doc: string; fingerprint: string; anchoredHash: string }
    if (token) {
      // Real check: the server hashes the file and compares it with the on-chain record.
      try {
        const v = await verifyFile(f, DEMO_PLOT_ID)
        rec = { result: v.verdict === 'match' ? 'matches' : 'changed', doc: (v.slot && SLOT_DOC[v.slot]) || 'Anchored documents', fingerprint: shortHash(v.sha256), anchoredHash: shortHash(token.docRoot) }
      } catch (e) {
        return setError(e instanceof Error ? e.message : 'The check could not be completed.')
      }
    } else {
      const c = compareFile(f.name, f.size)
      rec = { result: c.result, doc: c.doc.name, fingerprint: c.yourFingerprint, anchoredHash: c.doc.hash }
    }
    setCurrent({ file: f.name, size: f.size, ...rec })
    setChecks((prev) => [{ id: `${Date.now()}`, file: f.name, size: f.size, doc: rec.doc, result: rec.result, fingerprint: rec.fingerprint, at }, ...prev].slice(0, 20))
    setParams((p) => { const n = new URLSearchParams(p); n.delete('state'); return n }, { replace: true })
  }
  const again = () => {
    setCurrent(undefined)
    setParams((p) => { const n = new URLSearchParams(p); n.delete('state'); return n }, { replace: true })
  }

  return (
    <Screen id="GP-17">
      <TwinPage />
      <Modal open onOpenChange={(o) => !o && close()} title="Check a document">
        {state === 'drop' && (
          <>
            <p className="text-small text-muted">Drop a copy of a document. We compare its fingerprint with the one anchored on-chain. The file is not stored.</p>
            <input ref={input} type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only" tabIndex={-1} aria-label="Choose a file" onChange={(e) => void pick(e.target.files?.[0])} />
            <button
              type="button"
              onClick={() => input.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); void pick(e.dataTransfer.files[0]) }}
              className="flex min-h-[220px] flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-card border-[1.5px] border-dashed border-line-strong bg-sunken px-4 text-center hover:bg-primary-tint"
            >
              <FileUp className="size-7 text-muted" aria-hidden />
              <span className="text-small font-medium">Drag a file here or <span className="text-primary-text underline">browse</span></span>
              <span className="text-label text-muted">PDF, JPG, PNG · 20 MB</span>
            </button>
            {error && <p role="alert" className="flex items-center gap-1.5 text-label text-danger-ink"><CircleAlert className="size-3.5" aria-hidden />{error}</p>}
            {checks.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <h3 className="text-small font-semibold">Previous checks</h3>
                <ul className="flex flex-col gap-1 text-chip">
                  {checks.slice(0, 3).map((c) => (
                    <li key={c.id} className="flex justify-between gap-2"><span className="min-w-0 truncate">{c.file}</span><span className={c.result === 'matches' ? 'text-success-ink' : 'text-danger-ink'}>{c.result === 'matches' ? 'Matches' : 'Changed'}</span></li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {state === 'matches' && (
          <div role="status" className="contents">
            <div className="flex items-start gap-3 rounded-card border border-success bg-success-tint px-4 py-3.5 text-success-ink">
              <ShieldCheck className="mt-0.5 size-6 flex-none" aria-hidden />
              <div>
                <div className="text-h3">Matches the verified version</div>
                <div className="text-chip text-text">This file is identical to the one signed off on {CHECK.verifiedOn}.</div>
              </div>
            </div>
            <Rows rows={[
              { k: 'File', v: fileName ?? CHECK.match.file },
              { k: 'Matched', v: current?.doc ?? CHECK.match.matched },
              { k: 'Fingerprint', v: current?.fingerprint ?? CHECK.match.fingerprint, mono: true, chain: true },
              { k: 'Anchored', v: current ? `${proof.network} · ${proof.anchored}` : CHECK.match.anchored },
            ]} />
            <a href={proof.explorerUrl ?? 'https://sepolia.etherscan.io/'} target="_blank" rel="noopener noreferrer" className="text-small font-medium text-chain-ink underline">View on explorer ↗</a>
            <div className="flex-1" />
            <Button to={path('GP-16')}>Done</Button>
          </div>
        )}

        {state === 'changed' && (
          <div role="alert" className="contents">
            <div className="flex items-start gap-3 rounded-card border border-danger bg-danger-tint px-4 py-3.5 text-danger-ink">
              <CircleAlert className="mt-0.5 size-6 flex-none" aria-hidden />
              <div>
                <div className="text-h3">Changed since verification on {CHECK.verifiedOn}</div>
                <div className="text-chip text-text">This file is not the same as the verified document.</div>
              </div>
            </div>
            <Rows rows={[
              { k: 'File', v: fileName ?? CHECK.changed.file },
              { k: 'Compared with', v: current?.doc ?? CHECK.changed.comparedWith },
              { k: 'Your file', v: current?.fingerprint ?? CHECK.changed.yourFile, mono: true },
              { k: 'Anchored', v: current?.anchoredHash ?? CHECK.changed.anchored, mono: true, chain: true },
            ]} />
            <p className="text-label text-muted">A change can be harmless (a rescan) or serious (an edit). Ask the owner for the verified copy.</p>
            <div className="flex-1" />
            <div className="flex gap-2.5">
              <Button variant="secondary" onClick={again}>Try another file</Button>
              <Button to={path('GP-16')}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </Screen>
  )
}
