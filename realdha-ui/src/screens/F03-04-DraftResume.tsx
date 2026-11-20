import { Check } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { useDemoState } from '../app/useDemoState'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Pill } from '../components/ui/pill'
import { Modal } from '../components/ui/modal'
import { clock, useDrafts } from '../lib/f03-store'
import { cn } from '../lib/cn'

/** F03-04 · Draft saved and resume. State A: saved inside flow; State B: resume card on home. */
export default function DraftResumeScreen() {
  const [state, setState] = useDemoState(['saved', 'resume'] as const)
  const navigate = useNavigate()
  const [, setDrafts] = useDrafts()
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [now] = useState(() => Date.now())

  const handleDiscard = () => {
    setDrafts((prev) => prev.filter((d) => d.id !== 'untitled-plot'))
    setConfirmDiscard(false)
    navigate(path('F03-03'))
  }

  return (
    <Screen id="F03-04" back={path('F03-03')} title="Draft saved">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-4 py-6 xl:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <span className="text-label text-muted">F03 · 4 of 4</span>
            <h1 className="text-h1 font-semibold text-text">Draft saved and resume</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-label text-muted">View state:</span>
            <div className="flex rounded-control border border-line bg-surface p-0.5 text-chip font-medium">
              <button
                type="button"
                onClick={() => setState('saved')}
                className={cn('rounded-[4px] px-3 py-1 transition-colors', state === 'saved' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
              >
                A · Draft saved
              </button>
              <button
                type="button"
                onClick={() => setState('resume')}
                className={cn('rounded-[4px] px-3 py-1 transition-colors', state === 'resume' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
              >
                B · Resume
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* State A: Draft saved inside the flow */}
          <Card className={cn('flex flex-col gap-4 border', state === 'saved' ? 'border-primary ring-2 ring-primary-tint' : 'border-line')}>
            <div className="flex items-center justify-between">
              <span className="text-overline font-semibold uppercase tracking-wider text-muted">A · Draft saved (inside the flow)</span>
              {state === 'saved' && <Pill tone="info">Active demo state</Pill>}
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-h2 font-semibold">Upload documents</h2>
              <span className="inline-flex items-center gap-1.5 text-small font-medium text-success-ink">
                <Check className="size-4" aria-hidden />
                Draft saved at {clock(now)}
              </span>
            </div>

            <p className="text-body text-muted">
              Everything is saved as you go. You can close this page and come back any time.
            </p>

            <div className="flex flex-col gap-2 rounded-control border border-line bg-canvas p-3.5 text-small">
              <div className="flex items-center gap-2 text-success-ink">
                <Check className="size-4" />
                <span>7/12 extract</span>
              </div>
              <div className="flex items-center gap-2 text-success-ink">
                <Check className="size-4" />
                <span>NA order</span>
              </div>
              <div className="flex items-center gap-2 text-text">
                <span className="text-warning-ink font-bold">●</span>
                <span>Mutation entries · <span className="text-warning-ink">missing</span></span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2.5 rounded-control bg-text px-3.5 py-3 text-small text-canvas">
              <Check className="size-4 text-brand" />
              <span>Draft saved. Find it under My properties.</span>
            </div>

            <div className="mt-2 flex gap-3">
              <Button variant="secondary" to={path('F03-03')}>
                Go to My properties
              </Button>
              <Button to={path('GP-08')}>
                Continue uploading
              </Button>
            </div>
          </Card>

          {/* State B: Resume where you left off */}
          <Card className={cn('flex flex-col gap-4 border', state === 'resume' ? 'border-primary ring-2 ring-primary-tint' : 'border-line')}>
            <div className="flex items-center justify-between">
              <span className="text-overline font-semibold uppercase tracking-wider text-muted">B · Resume where you left off</span>
              {state === 'resume' && <Pill tone="info">Active demo state</Pill>}
            </div>

            <h2 className="text-h2 font-semibold">Welcome back, Prakash</h2>

            <div className="flex flex-col gap-3 rounded-card border-2 border-primary bg-primary-tint p-4.5">
              <div className="text-overline font-semibold uppercase tracking-wider text-primary">
                Continue where you left off
              </div>
              <div className="text-h3 font-semibold text-text">
                Plot · Gat 112/2 · Kusgaon
              </div>
              <div className="text-small text-text">
                Step 2 of 4 · Documents · 2 of 5 uploaded · last edited yesterday, 18:40
              </div>

              <div className="h-1.5 w-full rounded-full bg-surface">
                <div className="h-1.5 rounded-full bg-primary" style={{ width: '40%' }} />
              </div>

              <div className="mt-2 flex flex-wrap gap-2.5">
                <Button to={path('GP-08')}>
                  Resume
                </Button>
                <Button variant="secondary" onClick={() => setConfirmDiscard(true)}>
                  Discard draft
                </Button>
              </div>
            </div>

            <p className="text-small text-muted">
              Discarding a draft deletes uploaded files. You'll be asked to confirm.
            </p>
          </Card>
        </div>
      </div>

      <Modal open={confirmDiscard} onOpenChange={setConfirmDiscard} title="Discard this draft?">
        <div className="flex flex-col gap-4">
          <p className="text-body text-muted">
            Are you sure you want to discard your draft for <b>Plot · Gat 112/2 · Kusgaon</b>? All uploaded files and recorded details will be removed.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmDiscard(false)}>
              Keep draft
            </Button>
            <Button variant="danger" onClick={handleDiscard}>
              Discard draft
            </Button>
          </div>
        </div>
      </Modal>
    </Screen>
  )
}
