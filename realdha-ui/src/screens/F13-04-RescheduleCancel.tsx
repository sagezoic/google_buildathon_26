import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { useDemoState } from '../app/useDemoState'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { cn } from '../lib/cn'

const SLOTS = ['10:00', '11:30', '15:00']

/** F13-04 · Reschedule and cancel states. */
export default function RescheduleCancelScreen() {
  const [state, setState] = useDemoState(['reschedule', 'cancel'] as const)
  const navigate = useNavigate()
  const [selectedSlot, setSelectedSlot] = useState('11:30')
  const [reason, setReason] = useState('Changed my plans')

  const handleMove = () => {
    navigate(path('F13-03'))
  }

  const handleCancel = () => {
    navigate(path('F09-03'))
  }

  return (
    <Screen id="F13-04" back={path('F13-03')} title="Reschedule or Cancel">
      <div className="mx-auto flex w-full max-w-[700px] flex-col gap-6 px-4 py-6 xl:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <Link to={path('F13-03')} className="inline-flex items-center gap-1.5 text-small text-muted hover:text-text hover:underline">
            <ArrowLeft className="size-4" />
            <span>Back to call confirmation</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-label text-muted">Demo state:</span>
            <div className="flex rounded-control border border-line bg-surface p-0.5 text-chip font-medium">
              <button
                type="button"
                onClick={() => setState('reschedule')}
                className={cn('rounded-[4px] px-3 py-1 transition-colors', state === 'reschedule' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
              >
                State A · Reschedule
              </button>
              <button
                type="button"
                onClick={() => setState('cancel')}
                className={cn('rounded-[4px] px-3 py-1 transition-colors', state === 'cancel' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
              >
                State B · Cancel
              </button>
            </div>
          </div>
        </div>

        {state === 'reschedule' ? (
          <Card className="flex flex-col gap-5 p-6 xl:p-8">
            <div>
              <h2 className="text-h1 font-bold text-text">Reschedule call</h2>
              <p className="text-small text-muted">Currently Tue, 24 Nov, 11:00</p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-label font-medium text-text">Choose a new time</span>
              <div className="grid grid-cols-3 gap-2.5">
                {SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      'flex h-11 items-center justify-center rounded-control border text-body font-medium transition-colors',
                      selectedSlot === slot
                        ? 'border-primary bg-primary text-on-primary'
                        : 'border-line bg-surface text-text hover:border-line-hover'
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-line pt-4">
              <Button variant="secondary" to={path('F13-03')}>
                Keep current time
              </Button>
              <Button onClick={handleMove}>
                Move call
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="flex flex-col gap-5 p-6 xl:p-8">
            <div className="flex size-12 items-center justify-center rounded-full bg-danger-tint text-danger-ink">
              <AlertTriangle className="size-6" />
            </div>

            <div>
              <h2 className="text-h1 font-bold text-text">Cancel this call?</h2>
              <p className="text-body text-muted">The developer is told. You can book again anytime.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cancel-reason" className="text-label font-medium text-text">
                Reason (optional)
              </label>
              <select
                id="cancel-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-control w-full rounded-control border border-line bg-surface px-3 text-body text-text outline-none"
              >
                <option value="Changed my plans">Changed my plans</option>
                <option value="Found another property">Found another property</option>
                <option value="Timing does not suit">Timing does not suit</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 border-t border-line pt-4">
              <Button variant="secondary" to={path('F13-03')}>
                Keep call
              </Button>
              <Button variant="danger" onClick={handleCancel}>
                Cancel call
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Screen>
  )
}
