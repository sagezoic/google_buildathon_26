import { Check } from 'lucide-react'
import { useState } from 'react'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { usePersistentState } from '../app/persist'
import { useDemoState } from '../app/useDemoState'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { RecordId } from '../components/ui/record-id'
import { cn } from '../lib/cn'

/** F18-02 · Register interest form and confirmation. */
export default function RegisterInterestScreen() {
  const [state, setState] = useDemoState(['form', 'confirmed'] as const)
  const [name, setName] = usePersistentState('f18.interestName', 'Prakash Kulkarni')
  const [phone, setPhone] = usePersistentState('f18.interestPhone', '+91 98220 11223')
  const [interestType, setInterestType] = useState<'updates' | 'contact'>('updates')
  const [acknowledged, setAcknowledged] = useState(true)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!acknowledged) {
      setError('Please acknowledge that this is a demo registration.')
      return
    }
    setState('confirmed')
  }

  return (
    <Screen id="F18-02" back={path('F18-01')} title="Register interest">
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6 px-4 py-6 xl:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <h1 className="text-h1 font-bold text-text">Register interest</h1>
          <div className="flex items-center gap-2">
            <span className="text-label text-muted">Demo state:</span>
            <div className="flex rounded-control border border-line bg-surface p-0.5 text-chip font-medium">
              <button
                type="button"
                onClick={() => setState('form')}
                className={cn('rounded-[4px] px-3 py-1 transition-colors', state === 'form' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
              >
                State A · Form
              </button>
              <button
                type="button"
                onClick={() => setState('confirmed')}
                className={cn('rounded-[4px] px-3 py-1 transition-colors', state === 'confirmed' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
              >
                State B · Confirmation
              </button>
            </div>
          </div>
        </div>

        {state === 'form' ? (
          <Card className="flex flex-col gap-5 p-6">
            <div className="flex items-center gap-3">
              <RecordId id="RA-LON-004-P-112-2" />
              <span className="text-body font-semibold text-text">Kusgaon NA plot</span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="interest-name" className="text-label font-medium text-text">
                    Name
                  </label>
                  <input
                    id="interest-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-control w-full rounded-control border border-line bg-surface px-3 text-body text-text outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="interest-phone" className="text-label font-medium text-text">
                    Phone
                  </label>
                  <input
                    id="interest-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-control w-full rounded-control border border-line bg-surface px-3 font-mono text-body text-text outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-label font-medium text-text">I am interested in</span>
                <div className="flex rounded-control border border-line bg-canvas p-0.5 text-chip font-medium">
                  <button
                    type="button"
                    onClick={() => setInterestType('updates')}
                    className={cn('flex-1 rounded-[4px] py-1.5 transition-colors', interestType === 'updates' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
                  >
                    Updates
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterestType('contact')}
                    className={cn('flex-1 rounded-[4px] py-1.5 transition-colors', interestType === 'contact' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
                  >
                    Being contacted
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-2.5 pt-2 text-small text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => {
                    setAcknowledged(e.target.checked)
                    setError('')
                  }}
                  className="size-4 mt-0.5 rounded border-line"
                />
                <span>I understand this is a demo. Registering interest is not an offer or an order.</span>
              </label>

              {error && <p className="text-small text-danger">{error}</p>}

              <div className="flex justify-end gap-3 border-t border-line pt-4">
                <Button variant="secondary" to={path('F18-01')}>
                  Cancel
                </Button>
                <Button type="submit">
                  Register interest
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Card className="flex flex-col items-start gap-4 p-6 xl:p-8">
            <div className="flex size-12 items-center justify-center rounded-full bg-success-tint text-success-ink">
              <Check className="size-6" />
            </div>
            <h2 className="text-h1 font-bold text-text">Interest registered</h2>
            <p className="text-body text-muted">
              We will share updates on this asset. You have not bought anything and nothing was charged.
            </p>
            <div className="pt-2">
              <Button to={path('GP-21')}>
                Back to Market
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Screen>
  )
}
