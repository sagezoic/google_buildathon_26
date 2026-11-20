import { CircleCheck, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Modal } from '../../../components/ui/modal'
import { Pill } from '../../../components/ui/pill'
import { RecordId, SampleData } from '../../../components/ui/record-id'
import { REPLY_TEXT, SEED_ENQUIRIES, unitById, type Enquiry, type EnquiryStatus } from '../../../data/fixtures/f11-buyer'
import { BK, sentDate } from '../../../lib/buyer-store'
import { useSharedState } from '../../../lib/shared-state'
import { useSearchParams } from 'react-router'

const TONE = { sent: 'info', seen: 'warning', responded: 'success' } as const
const LABEL: Record<EnquiryStatus, string> = { sent: 'Sent', seen: 'Seen', responded: 'Responded' }
const MOBILE_LABEL: Record<EnquiryStatus, string> = { sent: 'Sent', seen: 'Seen', responded: 'Replied' }

/** New enquiries move Sent, Seen, Responded over about a minute (demo). Sample rows keep their saved status. */
const statusOf = (e: Enquiry, now: number): EnquiryStatus => {
  if (!e.live) return e.status
  const age = now - e.sentAt
  return age < 15000 ? 'sent' : age < 40000 ? 'seen' : 'responded'
}

/** F12-03 · My enquiries. Reads `f12.enquiries`. */
export default function MyEnquiries() {
  const [list] = useSharedState<Enquiry[]>(BK.enquiries, SEED_ENQUIRIES)
  const [params] = useSearchParams()
  const [now, setNow] = useState(Date.now())
  const [open, setOpen] = useState<string>()
  useEffect(() => { const t = window.setInterval(() => setNow(Date.now()), 5000); return () => window.clearInterval(t) }, [])
  const empty = list.length === 0 || params.get('state') === 'empty'
  const rows = empty ? [] : list
  const cur = rows.find((e) => e.id === open)
  const curStatus = cur ? statusOf(cur, now) : 'sent'
  const cu = cur && unitById(cur.unitId)

  return (
    <Screen id="F12-03" back={path('F12-02')} title="My enquiries">
      <div className="flex flex-col gap-4 px-4 py-4 xl:px-12 xl:py-8">
        <h1 className="text-h1 font-semibold max-xl:text-h2">My enquiries</h1>
        {rows.length === 0 ? (
          <Card className="flex flex-col items-start gap-3">
            <h2 className="text-h3">No enquiries yet</h2>
            <p className="text-small text-muted">Enquire about a property and it appears here.</p>
            <Button to={path('F08-01')} icon={<Search className="size-4" aria-hidden />}>Find a property</Button>
          </Card>
        ) : (
          <Card className="overflow-hidden p-0" role="table" aria-label="My enquiries">
            <div role="row" className="grid grid-cols-[1.2fr_1.4fr_1fr_1fr_auto] gap-x-4 border-b border-line bg-sunken px-4 py-3 text-label font-semibold text-muted max-xl:hidden">
              <span role="columnheader">Property</span><span role="columnheader">Project and unit</span><span role="columnheader">Sent</span><span role="columnheader">Status</span><span className="w-24" aria-hidden />
            </div>
            {rows.map((e) => {
              const u = unitById(e.unitId)
              const st = statusOf(e, now)
              const reply = st === 'responded'
              return (
                <div role="row" key={e.id} className="grid items-center gap-x-4 gap-y-1.5 border-b border-line px-4 py-3.5 text-small last:border-0 max-xl:grid-cols-[1fr_auto] xl:grid-cols-[1.2fr_1.4fr_1fr_1fr_auto]">
                  <span role="cell" className="max-xl:order-2 max-xl:col-span-2"><RecordId id={e.unitId} className="max-xl:w-full" /></span>
                  <span role="cell" className="max-xl:order-1 max-xl:font-semibold"><span className="max-xl:hidden">{u?.project} · {u?.unit}</span><span className="xl:hidden">{u?.unit} · {u?.bhk}</span><span className="block text-chip font-normal text-muted xl:hidden">{u?.project}</span></span>
                  <span role="cell" className="max-xl:order-3 max-xl:col-span-2 max-xl:text-chip max-xl:text-muted"><span className="xl:hidden">Sent </span>{sentDate(e.sentAt)}</span>
                  <span role="cell" aria-live="polite" className="max-xl:order-1 max-xl:justify-self-end"><Pill tone={TONE[st]} icon={<CircleCheck className="size-3.5" />}><span className="max-xl:hidden">{LABEL[st]}</span><span className="xl:hidden">{MOBILE_LABEL[st]}</span></Pill></span>
                  <span role="cell" className="max-xl:order-4 max-xl:col-span-2"><Button size="sm" variant="secondary" className="max-xl:h-11 max-xl:w-full" onClick={() => setOpen(e.id)}>{reply ? 'Read reply' : 'Open'}</Button></span>
                </div>
              )
            })}
          </Card>
        )}
        <p className="text-chip font-medium text-muted">Status moves Sent → Seen → Responded. <SampleData className="align-middle" /></p>
      </div>
      <Modal open={!!cur} onOpenChange={(o) => !o && setOpen(undefined)} title={cu ? `${cu.project} · ${cu.unit}` : 'Enquiry'}>
        {cur && (
          <div className="flex flex-col gap-3 text-small">
            <div className="flex items-center gap-2"><RecordId id={cur.unitId} /><Pill tone={TONE[curStatus]} icon={<CircleCheck className="size-3.5" />}>{LABEL[curStatus]}</Pill></div>
            <div><div className="text-label font-semibold text-muted">Your message · {sentDate(cur.sentAt)}</div><p>{cur.message}</p></div>
            {curStatus === 'responded' && <div className="rounded-control bg-sunken p-3"><div className="text-label font-semibold text-muted">Reply from {cu?.developer}</div><p>{REPLY_TEXT}</p></div>}
            <div className="flex gap-2"><Button to={`${path('F13-01')}?unit=${cur.unitId}`} variant="secondary">Book a call</Button></div>
          </div>
        )}
      </Modal>
    </Screen>
  )
}
