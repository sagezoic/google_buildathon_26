import { Bell, Check, FileText, House, MapPin, Pencil, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { usePersistentState } from '../../app/persist'
import { propertyPlace, propertyTitle, usePropertyDocuments, usePropertyDraft, usePropertyFindings, type Stage } from '../../lib/property-store'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Pill } from '../../components/ui/pill'
import { prakash } from '../../data/fixtures/identity'
import { useDemoState } from '../../app/useDemoState'
import { cn } from '../../lib/cn'

const STEPS = [
  { t: 'Add and upload', d: 'Location, survey number and your documents.', chain: false },
  { t: 'Check and sign off', d: 'AI reads each document; a lawyer signs off.', chain: false },
  { t: 'Anchor the proof', d: 'Fingerprints go on a public testnet.', chain: true },
]

/** GP-06 · Home, empty state for a verified owner with no properties. */
const STAGE: Record<Stage, { label: string; to: string; cta: string; tone: 'neutral' | 'info' | 'warning'; Icon: typeof Pencil }> = {
  details: { label: 'Draft · details saved', to: path('GP-08'), cta: 'Continue to documents', tone: 'neutral', Icon: Pencil },
  documents: { label: 'Documents added', to: path('GP-09'), cta: 'Check documents', tone: 'info', Icon: FileText },
  checked: { label: 'Checked · review needed', to: path('GP-10'), cta: 'Review details', tone: 'warning', Icon: TriangleAlert },
}

export default function HomeEmpty() {
  const [view] = useDemoState(['auto', 'empty'] as const)
  const [name] = usePersistentState('identity.name', prakash.firstName)
  const first = name.trim().split(/\s+/)[0] || prakash.firstName
  const [draft, , resetDraft] = usePropertyDraft()
  const [docs, , resetDocs] = usePropertyDocuments()
  const [, , resetFindings] = usePropertyFindings()
  const [, , resetCheck] = usePersistentState('property.check', { pct: 0 })
  const [confirming, setConfirming] = useState(false)
  const has = view === 'auto' && draft.saved
  const st = STAGE[draft.stage]
  const remove = () => { resetDraft(); resetDocs(); resetFindings(); resetCheck(); setConfirming(false) }
  return (
    <Screen id="GP-06" layout="app">
      <div className="flex flex-1 flex-col gap-4 p-4 xl:gap-6 xl:px-12 xl:py-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-h2 xl:text-h1"><span className="xl:hidden">Hello, {first}</span><span className="max-xl:hidden">Namaste, {first}</span></h1>
            <p className="text-control text-muted max-xl:hidden">{has ? '1 property' : 'Your properties will appear here.'}</p>
          </div>
          <span className="max-xl:hidden"><Pill tone="success" icon={<Check className="size-3.5" />} className="px-3 py-1 text-chip">KYC verified</Pill></span>
          <a href={path('X-02')} aria-label="Notifications, 1 unread" className="relative flex size-11 items-center justify-center text-text xl:hidden">
            <Bell className="size-5" aria-hidden /><span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-danger" />
          </a>
        </div>
        <div className="xl:hidden"><Pill tone="success" icon={<Check className="size-3.5" />}>KYC verified</Pill></div>

        {has ? (
          <Card className="flex flex-col gap-4 p-4 xl:flex-row xl:items-center xl:p-5">
            <div aria-hidden className="flex size-12 flex-none items-center justify-center rounded-lg bg-primary-tint text-on-primary-tint"><MapPin className="size-6" /></div>
            <div className="min-w-0 flex-1">
              <h2 className="text-h3">{propertyTitle(draft)}</h2>
              <p className="text-small text-muted">{propertyPlace(draft)} · {docs.length} document{docs.length === 1 ? '' : 's'}</p>
              <div className="mt-2"><Pill tone={st.tone} icon={<st.Icon className="size-3.5" />}>{st.label}</Pill></div>
            </div>
            {confirming ? (
              <div role="alert" className="flex flex-wrap items-center gap-2">
                <span className="text-small">Remove this property and its documents?</span>
                <Button size="sm" variant="danger" onClick={remove}>Yes, remove</Button>
                <Button size="sm" variant="secondary" onClick={() => setConfirming(false)}>Keep</Button>
              </div>
            ) : (
              <div className="flex gap-2 max-xl:flex-col">
                <Button to={st.to} className="max-xl:h-12">{st.cta}</Button>
                <Button variant="ghost" className="max-xl:h-12" onClick={() => setConfirming(true)}>Remove</Button>
              </div>
            )}
          </Card>
        ) : (
        <Card className="flex flex-col items-center gap-3 p-4 text-center xl:px-6 xl:py-14">
          <div aria-hidden className="flex size-16 items-center justify-center rounded-full bg-primary-tint text-on-primary-tint max-xl:hidden"><House className="size-7" /></div>
          <h2 className="text-h3 xl:text-h2"><span className="xl:hidden">Add your first property</span><span className="max-xl:hidden">Add your first property</span></h2>
          <p className="max-w-[460px] text-small text-muted xl:text-control">
            <span className="xl:hidden">Get it checked, signed off and given a permanent ID.</span>
            <span className="max-xl:hidden">Upload its documents, get them checked and signed off, and receive a permanent Realdha record.</span>
          </p>
          <Button to={path('GP-07')} block className="xl:mt-2 xl:w-auto max-xl:h-12">Add property</Button>
        </Card>
        )}

        {!has && <div className="grid grid-cols-3 gap-4 max-xl:hidden">
          {STEPS.map((s, i) => (
            <Card key={s.t} className="flex gap-3.5 p-5">
              <span aria-hidden className={cn('flex size-8 flex-none items-center justify-center rounded-full font-semibold', s.chain ? 'bg-chain-tint text-chain-ink' : 'bg-primary-tint text-on-primary-tint')}>{i + 1}</span>
              <div><h3 className="text-control font-semibold">{s.t}</h3><p className="text-small text-muted">{s.d}</p></div>
            </Card>
          ))}
        </div>}
      </div>
    </Screen>
  )
}
