import { Check, Mail, Phone, Send } from 'lucide-react'
import { useState } from 'react'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { DEV_ENQUIRIES } from '../../../data/fixtures/f15-devconsole'
import { cn } from '../../../lib/cn'

/** F15-04 · Enquiries inbox and detail with reply thread. */
export default function EnquiryInboxScreen() {
  const [selectedId, setSelectedId] = useState('de1')
  const [replyText, setReplyText] = useState('')
  const [sent, setSent] = useState(false)

  const active = DEV_ENQUIRIES.find((e) => e.id === selectedId) ?? DEV_ENQUIRIES[0]

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim()) return
    setSent(true)
    setTimeout(() => {
      setReplyText('')
      setSent(false)
    }, 1500)
  }

  return (
    <Screen id="F15-04" role="developer" back={path('F15-01')} title="Enquiries inbox">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 py-6 xl:py-8">
        <div className="border-b border-line pb-4">
          <h1 className="text-h1 font-bold text-text">Enquiries · 17</h1>
          <p className="text-body text-muted">Incoming buyer questions and callback requests.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Left: Enquiries list */}
          <div className="flex flex-col divide-y divide-line rounded-card border border-line bg-surface xl:col-span-5">
            {DEV_ENQUIRIES.map((enq) => {
              const isSelected = enq.id === active.id
              return (
                <button
                  key={enq.id}
                  type="button"
                  onClick={() => setSelectedId(enq.id)}
                  className={cn(
                    'flex flex-col gap-1.5 p-4 text-left transition-colors',
                    isSelected ? 'bg-primary-tint/60 border-l-4 border-l-primary' : 'hover:bg-canvas'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text">{enq.name}</span>
                    <span className="font-mono text-overline text-muted">{enq.time}</span>
                  </div>
                  <div className="text-small font-medium text-primary">
                    {enq.unit} · {enq.subject}
                  </div>
                  <p className="line-clamp-2 text-small text-muted">{enq.message}</p>
                </button>
              )
            })}
          </div>

          {/* Right: Message Detail & Thread */}
          <div className="flex flex-col gap-4 xl:col-span-7">
            <Card className="flex flex-col gap-5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                <div>
                  <h2 className="text-h2 font-bold text-text">{active.name}</h2>
                  <div className="text-small text-muted">{active.unit} · {active.subject}</div>
                </div>
                <div className="flex items-center gap-2 text-small text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Phone className="size-3.5" /> {active.phone}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Mail className="size-3.5" /> {active.email}
                  </span>
                </div>
              </div>

              {/* Thread messages */}
              <div className="flex flex-col gap-3 min-h-[180px]">
                {active.thread.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex max-w-[85%] flex-col gap-1 rounded-card p-3.5 text-small',
                      msg.from === 'buyer'
                        ? 'self-start bg-canvas text-text border border-line'
                        : 'self-end bg-primary text-on-primary'
                    )}
                  >
                    <p>{msg.text}</p>
                    <span className="font-mono text-overline opacity-80">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Reply form */}
              <form onSubmit={handleSendReply} className="flex flex-col gap-3 border-t border-line pt-4">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a message to the buyer..."
                  rows={3}
                  className="w-full rounded-control border border-line bg-surface p-3 text-small text-text outline-none focus:border-focus"
                />
                <div className="flex items-center justify-between">
                  {sent && (
                    <span className="flex items-center gap-1.5 text-small font-medium text-success-ink">
                      <Check className="size-4" /> Reply sent!
                    </span>
                  )}
                  <div className="ml-auto">
                    <Button type="submit" icon={<Send className="size-3.5" />}>
                      Send reply
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </Screen>
  )
}
