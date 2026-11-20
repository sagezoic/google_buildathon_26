import { FileUp, Sparkles } from 'lucide-react'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'

/** F14-01 · Choose route for 3D visualisation. */
export default function ChooseRouteScreen() {
  return (
    <Screen id="F14-01" role="developer" back={path('F10-05')} title="3D Visualisation">
      <div className="mx-auto flex w-full max-w-[880px] flex-col gap-6 px-4 py-6 xl:py-10">
        <div className="flex flex-col gap-1 border-b border-line pb-4">
          <div className="text-small text-muted">Projects › Baner Heights › 3D visualisation</div>
          <h1 className="text-h1 font-bold text-text">Create a 3D visualisation</h1>
          <p className="text-body text-muted">
            Provide interactive 3D floor plans and apartment walkthroughs for buyers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Route A: Upload existing model */}
          <Card className="flex flex-col justify-between gap-6 p-6">
            <div className="flex flex-col gap-3">
              <div className="flex size-12 items-center justify-center rounded-control bg-primary-tint text-primary">
                <FileUp className="size-6" />
              </div>
              <h2 className="text-h2 font-semibold text-text">Upload a model</h2>
              <p className="text-body text-muted">
                You already have a GLB file. Realdha validates and publishes it directly on the verified property record.
              </p>
            </div>
            <div>
              <Button to={path('F14-02')} className="w-full">
                Upload GLB
              </Button>
            </div>
          </Card>

          {/* Route B: Request Realdha team */}
          <Card className="flex flex-col justify-between gap-6 p-6">
            <div className="flex flex-col gap-3">
              <div className="flex size-12 items-center justify-center rounded-control bg-chain-tint text-chain-ink">
                <Sparkles className="size-6" />
              </div>
              <h2 className="text-h2 font-semibold text-text">Request Realdha's 3D team</h2>
              <p className="text-body text-muted">
                Send 2D architectural plans and CAD drawings. Realdha's team will model, texture, and light the units for you.
              </p>
            </div>
            <div>
              <Button variant="secondary" to={path('F14-03')} className="w-full">
                Request from floor plan
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Screen>
  )
}
