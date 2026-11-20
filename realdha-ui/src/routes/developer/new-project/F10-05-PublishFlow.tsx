import { Check, FileText, Upload } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { useDemoState } from '../../../app/useDemoState'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Pill } from '../../../components/ui/pill'
import { StepPills } from '../../../components/ui/f10-parts'
import { cn } from '../../../lib/cn'

/** F10-05 · Attach plans and publish flow. */
export default function PublishFlowScreen() {
  const [state, setState] = useDemoState(['plans', 'publish'] as const)
  const navigate = useNavigate()
  const [confirmed, setConfirmed] = useState(false)
  const [publishing, setPublishing] = useState(false)

  const handlePublish = () => {
    setPublishing(true)
    setTimeout(() => {
      setPublishing(false)
      navigate(path('F10-06'))
    }, 800)
  }

  return (
    <Screen id="F10-05" role="developer" back={path('F10-04')} title="Attach plans and publish">
      <div className="mx-auto flex w-full max-w-[880px] flex-col gap-6 px-4 py-6 xl:py-8">
        <StepPills current={state === 'plans' ? 4 : 5} />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h1 className="text-h1 font-bold text-text">Attach plans and publish</h1>
            <p className="text-body text-muted">
              Attach architectural drawings and verify launch parameters before making units public.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-label text-muted">Demo state:</span>
            <div className="flex rounded-control border border-line bg-surface p-0.5 text-chip font-medium">
              <button
                type="button"
                onClick={() => setState('plans')}
                className={cn('rounded-[4px] px-3 py-1 transition-colors', state === 'plans' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
              >
                State A · Attach plans
              </button>
              <button
                type="button"
                onClick={() => setState('publish')}
                className={cn('rounded-[4px] px-3 py-1 transition-colors', state === 'publish' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
              >
                State B · Publish
              </button>
            </div>
          </div>
        </div>

        {state === 'plans' ? (
          <Card className="flex flex-col gap-5 p-6">
            <h2 className="text-h2 font-semibold text-text">Attach project assets</h2>

            <div className="flex flex-col divide-y divide-line rounded-control border border-line">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <FileText className="size-5 text-primary" />
                  <div>
                    <div className="font-semibold text-text">Floor plan · Tower A</div>
                    <div className="text-small text-muted">tower_a_floor_plan.pdf · 4.2 MB</div>
                  </div>
                </div>
                <Pill tone="success" icon={<Check className="size-3.5" />}>Uploaded</Pill>
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <FileText className="size-5 text-primary" />
                  <div>
                    <div className="font-semibold text-text">Brochure PDF</div>
                    <div className="text-small text-muted">baner_heights_brochure.pdf · 12.8 MB</div>
                  </div>
                </div>
                <Pill tone="success" icon={<Check className="size-3.5" />}>Uploaded</Pill>
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Upload className="size-5 text-muted" />
                  <div>
                    <div className="font-semibold text-text">3D model</div>
                    <div className="text-small text-muted">GLB file · Optional</div>
                  </div>
                </div>
                <Button variant="secondary" size="sm" to={path('F14-01')}>
                  Upload 3D
                </Button>
              </div>
            </div>

            <div className="flex justify-between border-t border-line pt-4">
              <Button variant="secondary" to={path('F10-04')}>
                Back to Grid
              </Button>
              <Button onClick={() => setState('publish')}>
                Review & Publish
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="flex flex-col gap-5 p-6">
            <h2 className="text-h2 font-semibold text-text">Ready to publish new launch</h2>

            <div className="flex flex-col gap-3 rounded-control border border-line bg-canvas p-4 text-small">
              <div className="flex justify-between">
                <span className="text-muted">Project:</span>
                <span className="font-semibold text-text">Baner Heights</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">RERA Number:</span>
                <span className="font-mono text-text">P52100012345</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Total Units:</span>
                <span className="font-semibold text-text">336 units across 3 towers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Starting Price:</span>
                <span className="font-semibold text-text">₹92 Lakh</span>
              </div>
            </div>

            <label className="flex items-start gap-2.5 pt-2 text-small text-text cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="size-4 mt-0.5 rounded border-line"
              />
              <span>
                I confirm that all uploaded unit dimensions, prices, and RERA registration details are accurate and ready for buyer discovery.
              </span>
            </label>

            <div className="flex justify-between border-t border-line pt-4">
              <Button variant="secondary" onClick={() => setState('plans')}>
                Back
              </Button>
              <Button
                disabled={!confirmed}
                loading={publishing}
                onClick={handlePublish}
              >
                Publish new launch
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Screen>
  )
}
